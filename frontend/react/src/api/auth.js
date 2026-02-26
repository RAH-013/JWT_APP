import apiAxios from "./axios";
import { jwtDecode } from "jwt-decode";

export const apiAuth = async ({ name, password }) => {
  try {
    const response = await apiAxios.post("/users/login", { name, password });
    return response.data;
  } catch (error) {
    console.error("Error en autenticación:", error);
  }
};

export const apiMe = async () => {
  try {
    const response = await apiAxios.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Error en obtener información personal:", error);
  }
};

export const apiGetUsers = async () => {
  try {
    const response = await apiAxios.get("/users/home");
    return response.data;
  } catch (error) {
    console.error("Error en obtener información de usuarios:", error);
  }
};

export const apiCreate = async ({ name, password, role }) => {
  try {
    const response = await apiAxios.post('/users/register/', { name, password, role });
    return response.data;
  } catch (error) {
    console.error("Error al crear usuario:", error);
  }
}

export const apiUpdate = async (id, { name, password, role }) => {
  try {
    const response = await apiAxios.put(`/users/update/${id}`, { name, password, role });
    return response.data;
  } catch (error) {
    console.error("Error en actualizar usuario:", error);
  }
};

export const apiDelete = async (id) => {
  try {
    const response = await apiAxios.delete(`/users/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
  }
}

export const decodeToken = () => {
  const token = sessionStorage.getItem("jwt_project") || null;
  return token ? jwtDecode(token) : null;
};
