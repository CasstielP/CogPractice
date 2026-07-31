import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import Footer from "./components/Footer";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute"
import {
  getCurrentUser,
  getToken,
  removeToken,
} from "./services/api";

import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ServicesPage from "./pages/ServicesPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  function handleLogin(user) {
    setCurrentUser(user);
    setCredentials(submittedCredentials);
  }

  function handleLogout() {
    removeToken()
    setCurrentUser(null);
  }

  useEffect(() => {
  async function restoreAuthentication() {
    const token = getToken();

    if (!token) {
      setAuthLoading(false);
      return;
    }

    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch {
      removeToken();
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  restoreAuthentication();
}, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/about"
            element={<AboutPage />}
          />

          <Route
            path="/contact"
            element={<ContactPage />}
          />

          <Route
            path="/login"
            element={
              <LoginPage
                currentUser={currentUser}
                onLogin={handleLogin}
              />
            }
          />
          <Route
          path="/signup"
          element={
            <SignUpPage currentUser={currentUser}/>
          }
          />

          <Route
            path="/services"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <ServicesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;