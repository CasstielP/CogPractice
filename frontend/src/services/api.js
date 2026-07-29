const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function createBasicAuthHeader(email, password) {
  const encodedCredentials = btoa(`${email}:${password}`);

  return `Basic ${encodedCredentials}`;
}

async function apiRequest(
  path,
  options = {},
  credentials = null
) {
  const authorizationHeader = credentials
    ? {
        Authorization: createBasicAuthHeader(
          credentials.email,
          credentials.password
        ),
      }
    : {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authorizationHeader,
      ...options.headers,
    },
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      responseBody?.detail ??
        `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return responseBody;
}

// Used by the login form to verify the credentials.
export function authenticateUser(email, password) {
  return apiRequest(
    "/auth/me",
    {},
    {
      email,
      password,
    }
  );
}

export function getUsers(credentials) {
  return apiRequest("/users", {}, credentials);
}

export function createUser(userData, credentials = null) {
  return apiRequest(
    "/users",
    {
      method: "POST",
      body: JSON.stringify(userData),
    },
    credentials
  );
}

export function updateUser(
  userId,
  userData,
  credentials
) {
  return apiRequest(
    `/users/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(userData),
    },
    credentials
  );
}

export function deleteUser(userId, credentials) {
  return apiRequest(
    `/users/${userId}`,
    {
      method: "DELETE",
    },
    credentials
  );
}