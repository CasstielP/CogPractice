function Footer() {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toLocaleDateString();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm sm:flex-row sm:px-6 lg:px-8">
        <p className="font-semibold text-white">BankUI</p>
        <p>{currentDate}</p>
        <p>© {currentYear} BankUI</p>
      </div>
    </footer>
  );
}

export default Footer;