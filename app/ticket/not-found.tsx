import Link from "next/link";

export default function TicketNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-6xl">✕</p>
      <h1 className="mt-4 font-display text-3xl tracking-wider">
        TICKET NOT FOUND
      </h1>
      <p className="mt-4 text-sm text-ink/70">
        The ticket code you entered doesn't exist. Check the code on your
        confirmation email, or contact widi@bubu.com if you have questions.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-ink px-6 py-3 font-display text-xl
                   tracking-widest text-paper transition hover:bg-black"
      >
        BACK HOME
      </Link>
    </main>
  );
}
