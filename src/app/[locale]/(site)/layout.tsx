import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { ConvexErrorBoundary } from "@/components/shared/ConvexErrorBoundary";

type Props = {
  children: ReactNode;
};

export default function SiteLayout({ children }: Props) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ConvexErrorBoundary>{children}</ConvexErrorBoundary>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
