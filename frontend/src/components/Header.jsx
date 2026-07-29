import {
  NavLink,
  useNavigate,
} from "react-router-dom";

function Header({
  currentUser,
  onLogout,
}) {
  const navigate = useNavigate();

  const links = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "About",
      path: "/about",
    },
    {
      label: "Contact",
      path: "/contact",
    },
  ];

  function getLinkClasses({ isActive }) {
    return [
      "rounded-md px-3 py-2 text-sm font-medium transition",
      isActive
        ? "bg-blue-700 text-white"
        : "text-slate-200 hover:bg-blue-700 hover:text-white",
    ].join(" ");
  }

  function handleLogout() {
    onLogout();
    navigate("/login");
  }

  return (
    <header className="bg-slate-900 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="text-2xl font-bold text-white"
        >
          BankUI
        </NavLink>

        <nav aria-label="Main navigation">
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {links.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={getLinkClasses}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}

            {currentUser ? (
              <>
                <li>
                  <NavLink
                    to="/services"
                    className={getLinkClasses}
                  >
                    Services
                  </NavLink>
                </li>

                <li className="px-3 text-sm text-slate-300">
                  {currentUser.name}
                </li>

                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-md border border-slate-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/login"
                    className={getLinkClasses}
                  >
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/signup"
                    className={getLinkClasses}
                  >
                    Sign Up
                  </NavLink>
                </li>

              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;