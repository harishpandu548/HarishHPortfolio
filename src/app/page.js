import Hero from "@/components/Hero";
// import projects from "@/data/projects";
import Link from "next/link";
import dynamic from "next/dynamic";
import SkillsPlayground from "@/components/SkillsPlayground";
import TwoColumnHeroWithEducation from "@/components/TwoColumnHeroWithEducation";
import CertificatesSlider from "@/components/Certificates/CertificatesSlider";
import ProjectsShowcase from "@/components/Projects/ProjectsShowcase";

export default function Home() {
  return (
    <>
      <Hero />
      <TwoColumnHeroWithEducation />
      <SkillsPlayground />
      <ProjectsShowcase/>
      <section id="certificates">
        <CertificatesSlider />
      </section>
    </>
  );
}
