function ContactPage() {
  function handleSubmit(event) {
    event.preventDefault();
    alert("Message submitted.");
    event.currentTarget.reset();
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-md">
      <h1 className="text-3xl font-bold">Contact Us</h1>

      <p className="mt-3 text-slate-600">
        Submit a message using the form below.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="contact-name"
            className="mb-2 block font-medium text-slate-700"
          >
            Name
          </label>

          <input
            id="contact-name"
            name="name"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="mb-2 block font-medium text-slate-700"
          >
            Email
          </label>

          <input
            id="contact-email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="mb-2 block font-medium text-slate-700"
          >
            Message
          </label>

          <textarea
            id="contact-message"
            name="message"
            rows="5"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
        >
          Submit
        </button>
      </form>
    </section>
  );
}

export default ContactPage;