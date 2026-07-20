import Bubu30Logo from "@/components/Bubu30Logo";

// Deliberately no event links here: each event's URL is distributed
// privately, so the root page is just a brand splash.
export default function Home() {
  return (
    <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-[-20%] h-72 w-72 rounded-full bg-brand/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[-25%] h-64 w-64 rounded-full bg-neutral-500/20 blur-3xl"
      />
      <p className="font-display text-lg tracking-[0.35em] text-brand">
        BUBU.COM
      </p>
      <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
        The Cultural Intelligence Agency
      </p>
      <div className="mt-10">
        <Bubu30Logo />
      </div>
      <h1 className="mt-8 font-display text-4xl tracking-wide">
        AHEAD. <span className="text-brand">ON</span> REPEAT.
      </h1>
      <p className="mt-2 text-xs uppercase tracking-[0.4em] text-ink/55">
        Thirtieth Anniversary
      </p>
      <p className="mt-10 text-xs text-ink/45">
        check out{" "}
        <a href="https://bubu.com" className="text-brand">
          bubu.com
        </a>{" "}
        for more info
      </p>
    </main>
  );
}
