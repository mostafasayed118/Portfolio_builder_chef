import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminProtectedLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;

  // ── Auth guard (defense-in-depth — middleware also protects via clerkMiddleware) ──
  const session = await auth();

  if (!session.userId) {
    redirect(`/${locale}/admin/login`);
  }

  // Enforce single admin email at layout level
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email || email !== process.env.ADMIN_EMAIL) {
    redirect(`/${locale}/admin/unauthorized`);
  }

  const t = await getTranslations({
    locale: locale as "en" | "ar",
    namespace: "admin.topbar",
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 lg:border-e border-border">
        <AdminSidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopbar title={t("title")} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
