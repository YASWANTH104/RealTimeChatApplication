import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
