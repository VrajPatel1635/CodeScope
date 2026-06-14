"use client";

import Navbar from "@/app/components/landing/Navbar";
import Hero from "@/app/components/landing/Hero";
import FeaturesMarquee from "@/app/components/landing/FeaturesMarquee";
import VisualDebuggerShowcase from "@/app/components/landing/VisualDebuggerShowcase";
import ExecutionIntelligenceShowcase from "@/app/components/landing/ExecutionIntelligenceShowcase";
import DiagnosticEngineShowcase from "@/app/components/landing/DiagnosticEngineShowcase";
import PhilosophyQuoteSection from "@/app/components/landing/PhilosophyQuoteSection";
import DataStructuresShowcase from "@/app/components/landing/DataStructuresShowcase";
import InteractiveDemoExperience from "@/app/components/landing/InteractiveDemoExperience";
import FAQSection from "@/app/components/landing/FAQSection";
import CTASection from "@/app/components/landing/CTASection";
import Footer from "@/app/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FeaturesMarquee />
      <VisualDebuggerShowcase />
      <InteractiveDemoExperience />
      <ExecutionIntelligenceShowcase />
      {/* <PhilosophyQuoteSection /> */}
      <DataStructuresShowcase />
      <DiagnosticEngineShowcase />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}