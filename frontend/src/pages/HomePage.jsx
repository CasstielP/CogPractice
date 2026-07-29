import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-16 text-white shadow-xl sm:px-12">
      <div className="max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-200">
          Simple digital banking
        </p>

        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Manage your account with BankUI
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-blue-100">
          Create customer accounts, review balances, and manage banking
          information through a React frontend connected to FastAPI and
          MongoDB.
        </p>

        <Link
          to="/services"
          className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-blue-800 transition hover:bg-blue-100"
        >
          Manage accounts
        </Link>
      </div>
    </section>
  );
}

export default HomePage;