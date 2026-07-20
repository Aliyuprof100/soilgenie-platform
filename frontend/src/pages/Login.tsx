import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to SoilGenie"
    >
      <LoginForm />
    </AuthLayout>
  );
}