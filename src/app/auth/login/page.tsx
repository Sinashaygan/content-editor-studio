// app/(auth)/login/page.tsx
import { LoginForm } from "@/features/auth/ui/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
