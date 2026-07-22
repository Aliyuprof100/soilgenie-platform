import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import RoleCard from "../components/auth/RoleCard";
import { register, login } from "../services/auth";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!role) {
      alert("Please select your role.");
      return;
    }

    if (form.password !== form.confirm_password) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone_number,
        password: form.password,
        role: role,
      });

      const data = await login(form.email, form.password);

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else if (data.user.role === "AGENT") {
        navigate("/agent");
      } else {
        navigate("/farmer");
      }
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        console.log(error.response.data);
        alert(JSON.stringify(error.response.data, null, 2));
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Join SoilGenie"
      subtitle="Grow Smarter with Artificial Intelligence"
    >
      <form onSubmit={handleRegister} className="space-y-5">
        {/* Role Selection */}

        <RoleCard
          title="Farmer"
          description="Monitor farms, receive AI recommendations and manage your crops."
          icon="🌾"
          selected={role === "FARMER"}
          onClick={() => setRole("FARMER")}
        />

        <RoleCard
          title="Field Agent"
          description="Register farmers, collect soil samples and generate reports."
          icon="👨‍🌾"
          selected={role === "AGENT"}
          onClick={() => setRole("AGENT")}
        />

        {/* Registration Form */}

        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 focus:border-green-600 focus:outline-none"
          required
        />

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 focus:border-green-600 focus:outline-none"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 focus:border-green-600 focus:outline-none"
          required
        />

        <input
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={form.phone_number}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 focus:border-green-600 focus:outline-none"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 focus:border-green-600 focus:outline-none"
          required
        />

        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={form.confirm_password}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 focus:border-green-600 focus:outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-700 p-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-green-700 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}