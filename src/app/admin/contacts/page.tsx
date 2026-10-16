import { adminContacts } from "@/lib/admin-data";
import { markRead, deleteContact } from "@/lib/actions/contacts";
import { Badge } from "@/components/ui/badge";
import { RowAction } from "@/components/dashboard/use-admin-action";

export default async function ContactsPage() {
  const all = await adminContacts();
  const unread = all.filter((c) => !c.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {all.length} total · {unread} unread
          </p>
        </div>
        <a
          href="/api/admin/contacts/export"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-black/10 dark:border-white/10 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          ↓ Export CSV
        </a>
      </div>
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm max-md:block">
          <thead className="bg-zinc-50 dark:bg-zinc-800 border-b max-md:hidden">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Email</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Subject</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Date</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y max-md:block">
            {all.length === 0 && (
              <tr className="max-md:block">
                <td colSpan={6} className="max-md:block px-4 py-8 text-center text-zinc-400">
                  No messages yet
                </td>
              </tr>
            )}
            {all.map((c) => (
              <tr key={c.id} className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 max-md:flex max-md:flex-col max-md:py-2">
                <td className="max-md:block max-md:py-1 [overflow-wrap:anywhere] px-4 py-3 font-medium">{c.name}</td>
                <td className="max-md:block max-md:py-1 [overflow-wrap:anywhere] px-4 py-3 text-zinc-500">{c.email}</td>
                <td className="max-md:block max-md:py-1 [overflow-wrap:anywhere] px-4 py-3 text-zinc-500">{c.subject || "—"}</td>
                <td className="max-md:block max-md:py-1 [overflow-wrap:anywhere] px-4 py-3">
                  <Badge variant={c.read ? "secondary" : "default"}>
                    {c.read ? "Read" : "Unread"}
                  </Badge>
                </td>
                <td className="max-md:block max-md:py-1 [overflow-wrap:anywhere] px-4 py-3 text-zinc-400 text-xs">
                  {c.createdAt?.toISOString().split("T")[0] ?? "—"}
                </td>
                <td className="max-md:block max-md:py-1 [overflow-wrap:anywhere] px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {!c.read && (
                      <RowAction label="Mark read" className="text-blue-500" action={markRead.bind(null, c.id)} />
                    )}
                    <RowAction label="Delete" className="text-red-500" confirmText="Delete this message? This cannot be undone." action={deleteContact.bind(null, c.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}