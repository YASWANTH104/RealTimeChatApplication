import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
