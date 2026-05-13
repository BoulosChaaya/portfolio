import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const all = await db
    .select()
    .from(contacts)
    .orderBy(desc(contacts.createdAt));

  const header = "Name,Email,Subject,Message,Read,Date\n";
  const rows = all.map((c) => {
    const date = c.createdAt?.toISOString().split("T")[0] ?? "";
    const escape = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;
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
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="contacts-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}