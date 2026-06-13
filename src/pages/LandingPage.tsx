import { MarketingLayout } from "@/app/MarketingLayout";
import { Hero } from "@/components/marketing/Hero";
import { ProblemFlow } from "@/components/marketing/ProblemFlow";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { CtaBand } from "@/components/marketing/CtaBand";

export function LandingPage() {
  return (
    <MarketingLayout>
      <Hero />
      <ProblemFlow />
      <FeatureGrid />
      <HowItWorks />
      <CtaBand />
    </MarketingLayout>
  );
}
