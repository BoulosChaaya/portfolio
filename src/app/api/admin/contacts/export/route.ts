import { currentAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  if (!(await currentAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const all = await db
    .select()
    .from(contacts)
    .orderBy(desc(contacts.createdAt));

  const header = "Name,Email,Subject,Message,Read,Date\n";
  const rows = all.map((c) => {
    const date = c.createdAt?.toISOString().split("T")[0] ?? "";
    // Visitors write these fields. A cell starting with = + - @ (or a tab/return) is run as a
    // formula when the file is opened in a spreadsheet, so it is prefixed with ' to stay text.
    const escape = (v: string | null) => {
      const value = v ?? "";
      const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    return [
      escape(c.name),
      escape(c.email),
      escape(c.subject),
      escape(c.message),
      c.read ? "Yes" : "No",
      date,
    ].join(",");
  }).join("\n");

  const csv = header + rows;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="contacts-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}