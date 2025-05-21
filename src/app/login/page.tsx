// src/app/login/page.tsx
"use client";

import LoginForm from "../../../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-900 dark:to-blue-950">
        <LoginForm/>
    </div>
  );
}
