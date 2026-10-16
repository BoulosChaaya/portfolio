import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts, experience, posts, projects, settings, skills } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/dal";

// The only way admin pages read data. Each function checks the admin first, so a page cannot
// show admin data without the check (ESLint stops admin pages importing the database directly).

export async function adminOverview() {
  await requireAdmin();
  const [allProjects, allPosts, allContacts] = await Promise.all([
    db.select().from(projects),
    db.select().from(posts),
    db.select().from(contacts),
  ]);
  return { projects: allProjects, posts: allPosts, contacts: allContacts };
}

export async function adminProjects() {
  await requireAdmin();
  return db.select().from(projects).orderBy(projects.order);
}

export async function adminPosts() {
  await requireAdmin();
  return db.select().from(posts).orderBy(posts.createdAt);
}

export async function adminContacts() {
  await requireAdmin();
  return db.select().from(contacts).orderBy(desc(contacts.createdAt));
}

export async function adminExperience() {
  await requireAdmin();
  return db.select().from(experience).orderBy(experience.order);
}

export async function adminSettings() {
  await requireAdmin();
  return db.select().from(settings);
}

export async function adminSkills() {
  await requireAdmin();
  const [allSkills, allSettings] = await Promise.all([
    db.select().from(skills).orderBy(skills.category, skills.order),
    db.select().from(settings),
  ]);
  return { skills: allSkills, settings: allSettings };
}
