"use client";
import { useMemo, useState, useEffect } from "react";
import { NameGenerator } from "./name-generator";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { createClient } from "@/utils/supabase/client";
import { NamesDisplay } from "./names-display";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { ToastAction } from "./ui/toast";
import { toast } from "./ui/use-toast";
import VerifySubscription from "./verify-subscription";
import {
  BusinessPlanEntitlements,
  FreePlanEntitlements,
  ProPlanEntitlements,
  UnauthenticatedEntitlements,
} from "@/lib/plans";

export default function NewGeneration({
  user,
  names,
}: {
  user: any;
  names: any;
}) {
  const [namesList, setNamesList] = useState<{ [name: string]: string }>({});
  const [inputName, setInputName] = useState<string>("");
  const [showNamesDisplay, setShowNamesDisplay] = useState<boolean>(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const sessionId = useMemo(
    () => searchParams.get("session_id") || uuidv4(),
    [searchParams]
  );
  const router = useRouter();
  const [customerId, setCustomerId] = useState<string>("");
  const [billingPortalUrl, setBillingPortalUrl] = useState<string>("");

  useEffect(() => {
    fetchCustomerId();
  }, []);

  async function fetchCustomerId() {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile && profile.customer_id) {
        setCustomerId(profile.customer_id);
        fetchBillingSession(profile.customer_id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchBillingSession(customerId: string) {
    try {
      const response = await fetch(`/portal-session?customer_id=${customerId}`);
      const data = await response.json();
      if (response.ok) {
        setBillingPortalUrl(data.session.url);
      }
    } catch (error) {
      console.error("Failed to fetch billing session:", error);
    }
  }

  async function addExistingName() {
    const updatedNamesList: { [name: string]: string } = {};

    const oneMonthAgo = new Date(
      new Date().setMonth(new Date().getMonth() - 1)
    ).toISOString();

    try {
      let namesLimit = UnauthenticatedEntitlements.nameGenerations;

      if (user) {
        namesLimit = FreePlanEntitlements.nameGenerations;
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("plan_id")
          .eq("id", user.id)
          .single();

        if (profile && profile.plan_id) {
          const response = await fetch(
            `/fetch-plan?plan_id=${profile.plan_id}`
          );
          const data = await response.json();
          if (response.ok) {
            if (data.planName === "Pro") {
              namesLimit = ProPlanEntitlements.nameGenerations;
            } else if (data.planName === "Business") {
              namesLimit = BusinessPlanEntitlements.nameGenerations;
            }
          }
        }

        const { data: names, error } = await supabase
          .from("names")
          .select("*", { count: "exact" })
          .eq("created_by", user.id)
          .gte("created_at", oneMonthAgo);

        if (names!.length >= namesLimit) {
          toast({
            title: "Uh oh! Out of generations",
            description:
              "You've reached the monthly limit for name generations. Upgrade your account to generate more names and enjoy more features.",
            action: (
              <ToastAction
                onClick={() =>
                  customerId
                    ? router.push(billingPortalUrl)
                    : router.push("/pricing")
                }
                altText="Upgrade"
              >
                Upgrade
              </ToastAction>
            ),
          });
          return;
        }
      } else {
        const { data: names, error } = await supabase
          .from("names")
          .select("*", { count: "exact" })
          .eq("session_id", sessionId)
          .gte("created_at", oneMonthAgo);

        if (names!.length >= namesLimit) {
          toast({
            title: "Uh oh! Out of generations",
            description:
              "You've reached the monthly limit for name generations. Sign up for an account to continue.",
            action: (
              <ToastAction
                onClick={() => router.push("/signup")}
                altText="Sign up"
              >
                Sign up
              </ToastAction>
            ),
          });
          return;
        }
      }

      const updates = {
        name: inputName,
        created_at: new Date(),
        created_by: user?.id,
        session_id: sessionId,
      };
      const { data, error } = await supabase
        .from("names")
        .insert(updates)
        .select();

      if (data) {
        updatedNamesList[data[0].name] = data[0].id;
        setNamesList(updatedNamesList);
        setShowNamesDisplay(true);
        setInputName("");
      }

      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen px-4 sm:px-8">
      <VerifySubscription user={user} />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold sm:text-left mb-4 sm:mb-0">
          Name Generator
        </h1>
        {showNamesDisplay ? (
          <Button variant="ghost" onClick={() => setShowNamesDisplay(false)}>
            Back
          </Button>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost">
                Already have a name? Skip to the branding.
              </Button>
            </PopoverTrigger>
            <PopoverContent className="space-y-2">
              <Input
                type="text"
                placeholder="Enter your startup's name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
              />
              <Button className="w-full" onClick={addExistingName}>
                Go
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {!showNamesDisplay && <NameGenerator user={user} names={names ?? null} />}
      {showNamesDisplay && (
        <NamesDisplay namesList={namesList} user={user} verticalLayout={true} />
      )}
    </div>
  );
}
