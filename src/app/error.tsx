"use client";

type ErrorPageProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-50">
            <section className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-red-200">
                    Application error
                </p>
                <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
                <p className="mt-3 text-sm leading-6 text-red-100/80">
                    The page failed to render. Try again, or return to the dashboard.
                </p>

                {error.digest ? (
                    <p className="mt-4 break-all text-xs text-red-100/60">
                        Error ID: {error.digest}
                    </p>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={reset}
                        className="rounded-xl bg-red-200 px-4 py-3 text-sm font-semibold text-red-950 transition hover:bg-red-100"
                    >
                        Try again
                    </button>
                    <a
                        href="/dashboard"
                        className="rounded-xl border border-red-200/20 px-4 py-3 text-center text-sm font-semibold text-red-100 transition hover:bg-red-200/10"
                    >
                        Dashboard
                    </a>
                </div>
            </section>
        </main>
    );
}
