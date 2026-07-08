"use client";

type GlobalErrorPageProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
    return (
        <html lang="en">
        <body>
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-50">
            <section className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-red-200">
                    Critical error
                </p>
                <h1 className="mt-4 text-2xl font-semibold">Wallet Console could not start</h1>
                <p className="mt-3 text-sm leading-6 text-red-100/80">
                    Reload the app after checking deployment configuration and browser console details.
                </p>

                {error.digest ? (
                    <p className="mt-4 break-all text-xs text-red-100/60">
                        Error ID: {error.digest}
                    </p>
                ) : null}

                <button
                    type="button"
                    onClick={reset}
                    className="mt-6 rounded-xl bg-red-200 px-4 py-3 text-sm font-semibold text-red-950 transition hover:bg-red-100"
                >
                    Try again
                </button>
            </section>
        </main>
        </body>
        </html>
    );
}
