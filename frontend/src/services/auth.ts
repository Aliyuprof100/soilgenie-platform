import api from "../api/api";

export async function login(email: string, password: string) {
  const response = await api.post("/auth/login/", {
    email,
    password,
  });

  return response.data;
}

export async function register(data: any) {
  const response = await api.post("/auth/register/", data);

  return response.data;
}

export async function me(token: string) {
  const response = await api.get("/auth/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}