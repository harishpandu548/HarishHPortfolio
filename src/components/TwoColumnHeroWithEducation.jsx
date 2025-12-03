"use client";

import AdvancedHeroBG from "./AdvancedHeroBG";
import ProfileOrb from "./ProfileOrb";
import EducationPanel from "./EducationalPanel";

export default function TwoColumnHeroWithEducation() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <AdvancedHeroBG
        theme={{
          accent: "#7efcff",
          accent2: "#ff77ff",
          accent3: "#ffd166",
          grid: "rgba(255,255,255,0.02)",
          bg: "#000606",
          bloom: 1.1,
        }}
        className="absolute inset-0 -z-10 pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-10 items-start">
          {/* left: profile orb / visual */}
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center justify-center lg:justify-start">
              <ProfileOrb />
            </div>
          </div>

          {/* right: education + stats panel */}
          <div className="col-span-12 lg:col-span-5">
            <EducationPanel />
          </div>
        </div>
      </div>
    </section>
  );
}
