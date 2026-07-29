import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { createUser } from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  password: "",
};

function SignUpPage({ currentUser }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");
      setSubmitting(true);

      await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setFormData(emptyForm);
      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="text-3xl font-bold text-slate-900">
        Create an account
      </h1>

      <p className="mt-2 text-slate-600">
        Register a new BankUI user.
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit}
      >
        <div>
          <label
            htmlFor="signup-name"
            className="mb-2 block font-medium text-slate-700"
          >
            Name
          </label>

          <input
            id="signup-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            required
            minLength={1}
            maxLength={100}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="mb-2 block font-medium text-slate-700"
          >
            Email
          </label>

          <input
            id="signup-email"
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
            htmlFor="signup-password"
            className="mb-2 block font-medium text-slate-700"
          >
            Password
          </label>

          <input
            id="signup-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />

          <p className="mt-2 text-sm text-slate-500">
            Password must contain at least 8 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </section>
  );
}

export default SignUpPage;