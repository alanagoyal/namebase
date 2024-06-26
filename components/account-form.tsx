"use client";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "./ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

const accountFormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function AccountForm({
  user,
  userData,
}: {
  user: any;
  userData: any;
}) {
  const supabase = createClient();
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: userData.email || "",
      name: userData.name || "",
    },
  });
  const [planName, setPlanName] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [billingPortalUrl, setBillingPortalUrl] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchCustomerId();
    }
  }, [user]);

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

  useEffect(() => {
    fetchUserPlan();
  }, [userData]);

  async function fetchUserPlan() {
    if (!userData.plan_id) {
      setPlanName("Free Plan");
      return;
    }
    try {
      const response = await fetch(`/fetch-plan?plan_id=${userData.plan_id}`);
      const data = await response.json();
      if (response.ok) {
        setPlanName(`${data.planName} Plan`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function onSubmit(data: AccountFormValues) {
    try {
      const updates = {
        email: userData.email,
        name: data.name,
        updated_at: new Date(),
      };

      let { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;
      toast({
        description: "Account updated",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Error updating account",
      });
    }
  }
  return (
    <div className="flex flex-col ">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        {planName &&
          (customerId ? (
            <a
              href={billingPortalUrl}
              className="bg-[#C850C0] px-3 py-1 rounded-full text-sm text-white h-6 flex items-center justify-center"
            >
              {planName}
            </a>
          ) : (
            <a
              href="/pricing"
              className="bg-[#C850C0] px-3 py-1 rounded-full text-sm text-white h-6 flex items-center justify-center"
            >
              {planName}
            </a>
          ))}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormDescription>
                  This is the email you log in with
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed in the dashboard
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="py-1 flex justify-center w-full">
            <Button className="w-full" type="submit">
              Update
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
