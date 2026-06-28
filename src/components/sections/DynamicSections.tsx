"use client";

import { Suspense, lazy, type ComponentType } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { MenuSection } from "@/components/sections/MenuSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { ContactSection } from "@/components/sections/ContactSection";
import { TrustedBySection } from "@/components/sections/TrustedBySection";

const ProjectsSection = lazy(() =>
  import("@/components/sections/ProjectsSection").then((m) => ({
    default: m.ProjectsSection,
  })),
);

const VideosSection = lazy(() =>
  import("@/components/sections/VideosSection").then((m) => ({
    default: m.VideosSection,
  })),
);

const LocationsSection = lazy(() =>
  import("@/components/sections/LocationsSection").then((m) => ({
    default: m.LocationsSection,
  })),
);

const SECTION_COMPONENTS: Record<string, ComponentType> = {
  hero: HeroSection,
  trustedBy: TrustedBySection,
  about: AboutSection,
  services: ServicesSection,
  menu: MenuSection,
  testimonials: TestimonialsSection,
  gallery: GallerySection,
  contact: ContactSection,
  projects: ProjectsSection,
  craftPractice: VideosSection,
  locations: LocationsSection,
};

function SectionSkeleton() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <Skeleton className="h-10 w-64 mx-auto mb-12" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Skeleton className="h-16 w-full max-w-md" />
            <Skeleton className="h-6 w-full max-w-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-12 w-36" />
            </div>
          </div>
          <Skeleton className="aspect-square rounded-2xl" />
        </div>
      </div>
    </section>
  );
}

function SectionWrapper({
  sectionKey,
  children,
}: {
  sectionKey: string;
  children: React.ReactNode;
}) {
  if (sectionKey === "hero") {
    return <Suspense fallback={<HeroSkeleton />}>{children}</Suspense>;
  }
  return <Suspense fallback={<SectionSkeleton />}>{children}</Suspense>;
}

export function DynamicSections() {
  const visibleSections = useQuery(api.queries.getVisibleSections);

  if (!visibleSections) {
    return (
      <>
        <HeroSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
      </>
    );
  }

  if (visibleSections.length === 0) {
    return <HeroSkeleton />;
  }

  return (
    <>
      {visibleSections.map((section) => {
        if (section.sectionKey === "ctaBanner") {
          return null;
        }

        const Component = SECTION_COMPONENTS[section.sectionKey];
        if (!Component) return null;

        return (
          <SectionWrapper key={section.sectionKey} sectionKey={section.sectionKey}>
            <Component />
          </SectionWrapper>
        );
      })}
    </>
  );
}

export function CTAVisibilityGate({ children }: { children: React.ReactNode }) {
  const visibleSections = useQuery(api.queries.getVisibleSections);
  if (!visibleSections) return null;

  const ctaVisible = visibleSections.some((s) => s.sectionKey === "ctaBanner");
  if (!ctaVisible) return null;

  return <>{children}</>;
}
