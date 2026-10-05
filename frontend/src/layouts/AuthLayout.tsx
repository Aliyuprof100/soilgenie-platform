import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-green-700">
            SoilGenie
          </h1>

          <h2 className="mt-6 text-2xl font-semibold">
            {title}
          </h2>

          <p className="mt-2 text-slate-600">
            {subtitle}
          </p>

        </div>

        {children}

      </div>
    </div>
  );
}