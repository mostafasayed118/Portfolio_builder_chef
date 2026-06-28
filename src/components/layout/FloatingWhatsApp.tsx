"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { MessageCircle } from "lucide-react";

function getTemplateKey(pathname: string): "services" | "caseStudies" | "contact" | "default" {
  if (pathname.startsWith("/services")) return "services";
  if (pathname.startsWith("/case-studies")) return "caseStudies";
  if (pathname.startsWith("/contact")) return "contact";
  return "default";
}

export function FloatingWhatsApp() {
  const contact = useQuery(api.queries.getContactInfo);
  const t = useTranslations("whatsapp");
  const pathname = usePathname();

  if (!contact?.whatsapp) return null;

  const templateKey = getTemplateKey(pathname);
  const message = t(`templates.${templateKey}`);

  const baseUrl = contact.whatsapp.split("?")[0];
  const whatsappUrl = `${baseUrl}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("ariaLabel")}
      className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-colors duration-200 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 motion-safe:animate-[pulse_2s_ease-in-out_infinite] bottom-5 inset-inline-end-5"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
