import Hero from "../components/home/Hero";
import PlatformFeatures from "../components/home/PlatformFeatures";
import Statistics from "../components/home/Statistics";
import HowItWorks from "../components/home/HowItWorks";
import NigeriaSection from "../components/home/NigeriaSection";
import Roadmap from "../components/home/Roadmap";
import FinalCTA from "../components/home/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />

      <PlatformFeatures />

      <Statistics />

      <HowItWorks />

      <NigeriaSection />

      <Roadmap />

      <FinalCTA />
    </>
  );
}