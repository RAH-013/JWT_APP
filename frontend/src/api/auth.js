import apiAxios from "./axios";

export const apiAuth = async ({ name, password }) => {
  const response = await apiAxios.post("/users/login", {
    name,
    password,
  });

  const { access_token, user } = response.data;

  sessionStorage.setItem("jwt_project", access_token);

  return { user, access_token };
};

export const apiMe = async () => {
  const response = await apiAxios.get("/users/me");
  return response.data;
};

export const apiGetUsers = async () => {
  const response = await apiAxios.get("/users");
  return response.data;
};

export const apiGetUser = async (id) => {
  const response = await apiAxios.get(`/users/${id}`);
  return response.data;
};

export const apiCreate = async ({ name, password, role }) => {
  const response = await apiAxios.post("/users", {
    name,
    password,
    role,
  });

  return response.data;
};

export const apiUpdate = async (id, { name, password, role }) => {
  const response = await apiAxios.put(`/users/${id}`, {
    name,
    password,
    role,
  });

  return response.data;
};

export const apiDelete = async (id) => {
  const response = await apiAxios.delete(`/users/${id}`);
  return response.data;
};
