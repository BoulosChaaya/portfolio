import type { ReactNode } from "react";

/**
 * Renders a post written in the dashboard as plain text, with three conventions:
 * a line starting "## " is a heading, consecutive lines starting "- " are a list, and every other
 * line is a paragraph. Text is never interpreted as HTML, so a post cannot inject markup.
 */
export function PostBody({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc space-y-2 pl-5 text-[15px] leading-[1.75] text-zinc-700 dark:text-zinc-300">
        {list.map((item, i) => <li key={i}>{item}</li>)}
      </ul>,
    );
    list = [];
  };
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("- ")) { list.push(line.slice(2)); continue; }
    flush();
    if (!line) continue;
    if (line.startsWith("## ")) {
      blocks.push(<h2 key={`h-${blocks.length}`} className="pt-4 text-[20px] font-medium tracking-tight text-zinc-900 dark:text-zinc-100">{line.slice(3)}</h2>);
    } else {
      blocks.push(<p key={`p-${blocks.length}`} className="text-[15px] leading-[1.85] text-zinc-700 dark:text-zinc-300">{line}</p>);
    }
  }
  flush();
  return <div className="space-y-5">{blocks}</div>;
}
