"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icons } from "./icons";
import Link from "next/link";
import {
  BusinessPlanEntitlements,
  FreePlanEntitlements,
  ProPlanEntitlements,
} from "@/lib/plans";
import { useEffect, useState } from "react";

const freePlanDetails = {
  title: "Free",
  price: "$0",
  description: "Free forever",
  link: FreePlanEntitlements.link,
  features: [
    `${FreePlanEntitlements.nameGenerations} name generations`,
    `${FreePlanEntitlements.domainLookups} domain lookups`,
    `${FreePlanEntitlements.npmNameLookups} npm name lookups`,
    `${FreePlanEntitlements.onePagerGenerations} one-pager generations`,
    `${FreePlanEntitlements.trademarkChecks} trademark check`,
    `${FreePlanEntitlements.logoGenerations} logo generation`,
    "AI-assisted support",
  ],
};

const proPlanDetails = {
  title: "Pro",
  price: "$4.99",
  description: "/ month",
  badge: "Popular",
  link: ProPlanEntitlements.link,
  features: [
    `${ProPlanEntitlements.nameGenerations} name generations`,
    `${ProPlanEntitlements.domainLookups} domain lookups`,
    `${ProPlanEntitlements.npmNameLookups} npm name lookups`,
    `${ProPlanEntitlements.onePagerGenerations} one-pager generations`,
    `${ProPlanEntitlements.trademarkChecks} trademark checks`,
    `${ProPlanEntitlements.logoGenerations} logo generations`,
    "Basic email support",
  ],
};

const businessPlanDetails = {
  title: "Business",
  price: "$19.99",
  description: "/ month",
  link: BusinessPlanEntitlements.link,
  features: [
    `${BusinessPlanEntitlements.nameGenerations} name generations`,
    `${BusinessPlanEntitlements.domainLookups} domain lookups`,
    `${BusinessPlanEntitlements.npmNameLookups} npm name lookups`,
    `${BusinessPlanEntitlements.onePagerGenerations} one-pager generations`,
    `${BusinessPlanEntitlements.trademarkChecks} trademark checks`,
    `${BusinessPlanEntitlements.logoGenerations} logo generations`,
    "Advanced email & phone support",
  ],
};

export default function Pricing({ userData }: { userData: any }) {
  const [isCustomer, setIsCustomer] = useState(false);
  const [billingPortalUrl, setBillingPortalUrl] = useState("");
  
  useEffect(() => {
    if (userData && userData.customer_id) {
      setIsCustomer(true);
      fetchBillingSession(userData.customer_id);
    }
  }, [userData]);

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
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Straightforward, affordable pricing
        </h1>
        <p className="mt-4 text-lg">
          Find a plan that fits your needs. Start for free, no credit card
          required.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border p-4 shadow-sm rounded-lg">
          <PlanDetails {...freePlanDetails} isCustomer={isCustomer} billingPortalUrl={billingPortalUrl} />
        </Card>
        <Card className="border p-4 shadow-sm rounded-lg relative">
          {proPlanDetails.badge && (
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-[#C850C0] px-3 py-1 rounded-full text-sm text-white">
              {proPlanDetails.badge}
            </div>
          )}
          <PlanDetails {...proPlanDetails} isCustomer={isCustomer} billingPortalUrl={billingPortalUrl} buttonColor="bg-[#C850C0]" />
        </Card>
        <Card className="border p-4 shadow-sm rounded-lg">
          <PlanDetails {...businessPlanDetails} isCustomer={isCustomer} billingPortalUrl={billingPortalUrl} />
        </Card>
      </div>
    </div>
  );
}

interface PlanDetailsProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonColor?: string;
  link: string;
  isCustomer: boolean;
  billingPortalUrl: string;
}

function PlanDetails({
  title,
  price,
  description,
  features,
  buttonColor,
  link,
  isCustomer,
  billingPortalUrl,
}: PlanDetailsProps) {

  return (
    <>
      <div className="text-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-4xl font-bold">{price}</p>
        <p className="text-gray-500">{description}</p>
        <Link href={isCustomer ? billingPortalUrl : link}>
          <Button className={`mt-4 ${buttonColor} min-w-[200px]`}>
            {isCustomer ? "Manage Subscription" : `Get started with ${title}`}
          </Button>
        </Link>
      </div>
      <div className="mt-6">
        <h3 className="font-semibold">What&apos;s included:</h3>
        <ul className="mt-2 space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-1">
              <Icons.checkmark className="inline-block" />{" "}
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
