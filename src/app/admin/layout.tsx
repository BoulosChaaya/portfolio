import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex w-full bg-zinc-50 dark:bg-zinc-950">
      <AdminSidebar email={session.user?.email ?? ""}>
        <main className="flex-1 min-w-0 p-5 md:p-8 overflow-auto">
          {children}
        </main>
      </AdminSidebar>
    </div>
  );
}