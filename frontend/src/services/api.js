const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000";

const TOKEN_KEY = "access_token";


   //Token helpers functions


export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

  // General API request helper


async function apiRequest(
  path,
  options = {},
  requiresAuthentication = true
) {
  const token = getToken();

  const headers = {
    ...options.headers,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (requiresAuthentication && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const responseBody = await response
    .json()
    .catch(() => null);

  if (!response.ok) {

    if (
      response.status === 401 &&
      requiresAuthentication
    ) {
      removeToken();
    }

    throw new Error(
      responseBody?.detail ??
        responseBody?.error ??
        `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return responseBody;
}

/* =========================================================
   Authentication endpoints
   ========================================================= */


 // POST /auth/login

export async function loginUser(email, password) {
  const formData = new URLSearchParams();

  formData.append("username", email.trim().toLowerCase());
  formData.append("password", password);

  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: formData,
    }
  );

  const responseBody = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      responseBody?.detail ?? "Login failed"
    );
  }

  return responseBody;
}


 // GET /auth/me

export function getCurrentUser() {
  return apiRequest("/auth/me");
}


export async function authenticateUser(
  email,
  password
) {
  const tokenResponse = await loginUser(
    email,
    password
  );

  saveToken(tokenResponse.access_token);

  try {
    return await getCurrentUser();
  } catch (error) {
    removeToken();
    throw error;
  }
}

export function logoutUser() {
  removeToken();
}


  // User endpoints



 // POST /users

export function createUser(userData) {
  return apiRequest(
    "/users",
    {
      method: "POST",
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      }),
    },
    false
  );
}


 // GET /users

export function getUsers() {
  return apiRequest("/users");
}


// GET /users/{user_id}

export function getUser(userId) {
  return apiRequest(`/users/${userId}`);
}

/*
 PUT /users/{user_id}
*/
export function updateUser(userId, userData) {
  return apiRequest(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
    }),
  });
}

/*
 DELETE /users/{user_id}
*/
export function deleteUser(userId) {
  return apiRequest(`/users/${userId}`, {
    method: "DELETE",
  });
}

/* =========================================================
   Authenticated account endpoints
   ========================================================= */

/*
 POST /account/deposit

 The backend gets the user from the JWT.
 No user ID is needed.
*/
export function depositFunds(amount) {
  return apiRequest("/account/deposit", {
    method: "POST",
    body: JSON.stringify({
      amount: Number(amount),
    }),
  });
}

/*
 POST /account/withdraw

 The backend gets the user from the JWT.
*/
export function withdrawFunds(amount) {
  return apiRequest("/account/withdraw", {
    method: "POST",
    body: JSON.stringify({
      amount: Number(amount),
    }),
  });
}

/* =========================================================
   Existing user-specific transaction endpoints
   ========================================================= */

/*
 GET /users/{user_id}/balance
*/
export function getUserBalance(userId) {
  return apiRequest(
    `/users/${userId}/balance`
  );
}

/*
 GET /users/{user_id}/transactions
*/
export function getUserTransactions(userId) {
  return apiRequest(
    `/users/${userId}/transactions`
  );
}