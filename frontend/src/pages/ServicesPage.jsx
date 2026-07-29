import { useEffect, useState } from "react";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../services/api";
const emptyEditForm = {
  name: "",
  email: "",
};
function ServicesPage({credentials}) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(emptyEditForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

async function loadUsers() {
  try {
    setError("");
    setLoading(true);

    const data = await getUsers(credentials);
    setUsers(data);
  } catch (requestError) {
    setError(requestError.message);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadUsers();
  }, [credentials]);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

async function handleSubmit(event) {
  event.preventDefault();

  if (!editingUserId) {
    return;
  }

  try {
    setError("");
    setSubmitting(true);

    const updatedUser = await updateUser(
      editingUserId,
      {
        name: formData.name.trim(),
        email: formData.email.trim(),
      },
      credentials
    );

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        getUserId(user) === editingUserId
          ? updatedUser
          : user
      )
    );

    resetForm();
  } catch (requestError) {
    setError(requestError.message);
  } finally {
    setSubmitting(false);
  }
}
function beginEdit(user) {
  setEditingUserId(getUserId(user));

  setFormData({
    name: user.name,
    email: user.email,
  });
}

function resetForm() {
  setEditingUserId(null);
  setFormData(emptyEditForm);
}

  async function handleDelete(userId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this account?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await deleteUser(userId, credentials);

      setUsers((currentUsers) =>
        currentUsers.filter((user) => getUserId(user) !== userId)
      );

      if (editingUserId === userId) {
        resetForm();
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function getUserId(user) {
    return user.id ?? user._id;
  }

return (
  <section>
    <div className="mb-8">
      <h1 className="text-3xl font-bold">
        Banking Services
      </h1>

      <p className="mt-2 text-slate-600">
        View, update, and delete customer accounts.
      </p>
    </div>

    {error && (
      <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
        {error}
      </div>
    )}

    {editingUserId && (
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold">
          Update User
        </h2>

        <form
          className="mt-6 grid gap-5 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="edit-name"
              className="mb-2 block font-medium text-slate-700"
            >
              Name
            </label>

            <input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="edit-email"
              className="mb-2 block font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="edit-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Update User"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )}

    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-semibold">
          Customer Accounts
        </h2>
      </div>

      {loading ? (
        <p className="p-6 text-slate-600">
          Loading users...
        </p>
      ) : users.length === 0 ? (
        <p className="p-6 text-slate-600">
          No users have been created.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm uppercase text-slate-600">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {users.map((user) => {
                const userId = getUserId(user);

                return (
                  <tr
                    key={userId}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {user.email}
                    </td>

                    <td className="px-6 py-4">
                      ${Number(user.balance ?? 0).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => beginEdit(user)}
                          className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(userId)
                          }
                          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </section>
);
}

export default ServicesPage;