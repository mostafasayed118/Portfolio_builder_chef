import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/session";
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
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect({ href: "/admin/login", locale: locale as "en" | "ar" });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 lg:border-e border-border">
        <AdminSidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopbar title="Admin" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
