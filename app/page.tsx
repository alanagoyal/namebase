/**
 * v0 by Vercel.
 * @see https://v0.dev/t/RYcnF4FO222
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = createClient();

  return (
    <div className="w-full pt-10 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-6xl font-extrabold leading-tight">
          Transform your idea into a{" "}
          <span style={{ color: "#C850C0" }}>billion-dollar brand</span>
        </h1>
        <p className="mt-4 max-w-2xl text-xl">
          Namebase helps founders name their startup, secure the domain, and
          brand it - all in one place.
        </p>
        <div className="flex pt-4">
          <Link href="/new">
            <Button
              className="mt-4 text-lg"
              style={{
                background:
                  "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                padding: "2px 30px", 
              }}
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
