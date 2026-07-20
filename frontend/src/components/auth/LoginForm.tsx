import { useState } from "react";
import PasswordInput from "./PasswordInput";
import { login } from "../../services/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      const data = await login(email, password);

      localStorage.setItem(
        "access",
        data.access
      );

      localStorage.setItem(
        "refresh",
        data.refresh
      );

      alert("Login successful!");
    } catch {
      alert("Invalid credentials.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <input
        className="w-full rounded-xl border p-3"
        placeholder="Email Address"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <PasswordInput
        value={password}
        onChange={setPassword}
      />

      <button
        className="w-full rounded-xl bg-green-600 p-3 font-semibold text-white hover:bg-green-700"
      >
        Sign In
      </button>

    </form>
  );
}