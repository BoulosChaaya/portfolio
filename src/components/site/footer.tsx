export function Footer() {
    return (
      <footer className="border-t border-black/8 dark:border-white/8 mt-auto">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-6 flex flex-col md:flex-row items-center gap-3 md:gap-0 md:justify-between">
          <div className="flex items-center gap-2 text-[12px] text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Open to opportunities · Beirut, Lebanon
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/bouloschaaya"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/boulos-chaaya-30a57a289"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="mailto:bouloschaaya92@gmail.com"
              className="text-[12px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      </footer>
    );
  }