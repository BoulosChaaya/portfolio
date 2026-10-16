import { requireAdmin } from "@/lib/dal";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Not the protection itself (see src/lib/dal.ts): it only picks what the sidebar shows.
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen flex w-full bg-zinc-50 dark:bg-zinc-950">
      <AdminSidebar email={admin.email}>
        <main className="flex-1 min-w-0 p-5 md:p-8 overflow-auto">
          {children}
        </main>
      </AdminSidebar>
    </div>
  );
}