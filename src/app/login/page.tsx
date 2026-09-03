import { Suspense } from "react";
import { LoginForm } from "@/features/auth/ui/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <Suspense fallback={<div>Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
