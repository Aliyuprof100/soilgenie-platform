import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PasswordInput from "./PasswordInput";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      await login(email, password);

      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (user?.role === "ADMIN") {
        navigate("/admin");
      } else if (user?.role === "AGENT") {
        navigate("/agent");
      } else {
        navigate("/farmer");
      }
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
        type="email"
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