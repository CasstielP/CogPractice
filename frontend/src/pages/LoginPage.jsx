import { useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";

import {  getCurrentUser,
  loginUser,
  saveToken, } from "../services/api";

const DEMO_CREDENTIALS = {
  email: "casstiel@example.com",
  password: "101010",
};

function LoginPage({ currentUser, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to="/services" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

async function signIn(email, password) {
  try {
    setError("");
    setSubmitting(true);

    const tokenResponse = await loginUser(
      email,
      password
    );

    saveToken(tokenResponse.access_token);

    const user = await getCurrentUser();

    onLogin(user);

    const destination =
      location.state?.from?.pathname ?? "/services";

    navigate(destination, {
      replace: true,
    });
  } catch (requestError) {
    setError(requestError.message);
  } finally {
    setSubmitting(false);
  }
}

  async function handleSubmit(event) {
    event.preventDefault();

    await signIn(
      formData.email,
      formData.password
    );
  }

  async function handleDemoLogin() {
    setFormData(DEMO_CREDENTIALS);

    await signIn(
      DEMO_CREDENTIALS.email,
      DEMO_CREDENTIALS.password
    );
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="text-3xl font-bold text-slate-900">
        Sign in
      </h1>

      <p className="mt-2 text-slate-600">
        Enter your account credentials.
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit}
      >
        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block font-medium text-slate-700"
          >
            Email
          </label>

          <input
            id="login-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-2 block font-medium text-slate-700"
          >
            Password
          </label>

          <input
            id="login-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-300" />
          <span className="text-sm text-slate-500">
            or
          </span>
          <div className="h-px flex-1 bg-slate-300" />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={submitting}
          className="w-full rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Login as Demo User
        </button>
      </form>
<p className="mt-6 text-center text-sm text-slate-600">
  Do not have an account?{" "}
  <Link
    to="/signup"
    className="font-semibold text-blue-700 hover:text-blue-800"
  >
    Create one
  </Link>
</p>
      <div className="mt-6 rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800">
          Demo account
        </p>
        <p>Email: {DEMO_CREDENTIALS.email}</p>
        <p>Password: {DEMO_CREDENTIALS.password}</p>
      </div>
    </section>
  );
}

export default LoginPage;