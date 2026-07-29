function AboutPage() {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-md">
      <h1 className="text-3xl font-bold text-slate-900">About BankUI</h1>

      <p className="mt-4 leading-7 text-slate-600">
        BankUI is a training application built with React, React Router,
        Tailwind CSS, FastAPI, Beanie, and MongoDB Atlas.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          ["React", "Creates the interactive user interface."],
          ["FastAPI", "Processes API requests and business logic."],
          ["MongoDB", "Stores users, balances, and transactions."],
        ].map(([title, description]) => (
          <article
            key={title}
            className="rounded-xl border border-slate-200 p-6"
          >
            <h2 className="text-xl font-semibold text-blue-700">{title}</h2>
            <p className="mt-2 text-slate-600">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AboutPage;