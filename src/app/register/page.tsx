import { RegisterForm } from "@/features/auth/ui/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <RegisterForm />
      </div>
    </main>
  );
}
