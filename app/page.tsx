import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  return (
    <>
      <SignedOut>
        <div className="app-shell flex min-h-screen items-center justify-center px-6">
          <div className="max-w-lg rounded-3xl border border-white/70 bg-white/80 p-10 text-center shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Tars Live Chat
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900">
              Real-time messaging that feels alive.
            </h1>
            <p className="mt-3 text-sm text-ink-600">
              Sign in to discover teammates, start a conversation, and see
              updates instantly.
            </p>
            <SignInButton mode="modal">
              <button className="mt-6 rounded-full bg-ink-900 px-6 py-2 text-sm font-semibold text-white">
                Sign in to continue
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <AppShell />
      </SignedIn>
    </>
  );
}
