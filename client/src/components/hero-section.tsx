"use client";

import {
  ArrowRight,
  FileSearch,
  Hourglass,
  PiggyBank,
  Scale,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const features = [
  {
    title: "AI-powered Analysis",
    description: "DocuMentor uses advanced AI to scan and understand your contracts effortlessly.",
    icon: FileSearch,
  },
  {
    title: "Risk Identification",
    description: "Instantly uncover hidden risks, loopholes, and liabilities within your documents.",
    icon: ShieldCheck,
  },
  {
    title: "Streamlined Negotiation",
    description: "Accelerate contract negotiations with AI-suggested redlines and alternatives.",
    icon: Hourglass,
  },
  {
    title: "Cost Reduction",
    description: "Minimize reliance on expensive legal reviews with automated insights.",
    icon: PiggyBank,
  },
  {
    title: "Improved Compliance",
    description: "Ensure every clause aligns with the latest legal and regulatory standards.",
    icon: Scale,
  },
  {
    title: "Faster Turnaround",
    description: "Review and refine contracts in minutes — not days.",
    icon: Zap,
  },
];

function googleSignIn(): Promise<void> {
  return new Promise((resolve) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    resolve();
  });
}

export function HeroSection() {
  const mutation = useMutation({
    mutationFn: googleSignIn,
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <section className="w-full py-20 md:py-32 lg:py-36 bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 md:px-6 flex flex-col items-center max-w-6xl mx-auto">
        <div className="w-full text-center mb-16">
          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1e293b] to-[#636363]">
            DocuMentor
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Your AI-powered assistant to analyze, optimize, and decode contracts — in seconds.
          </p>

          <div className="flex justify-center mt-10">
            <Button
              size="lg"
              className="text-lg px-6 py-4"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing in..." : "Get Started"}
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="h-full bg-card/80 backdrop-blur-md border border-border hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="text-primary size-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
