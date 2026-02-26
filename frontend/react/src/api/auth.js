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

// export const apiRegister = async ({ fullName, email, password, phoneNumber, address }) => {
//   try {
//     const response = await apiAxios.post("/users/register", { fullName, email, password, phoneNumber, address });
//     return response.data;
//   } catch (error) {
//     console.error("Error al registrar usuario:", error);
//   }
// };

export const apiUpdate = async (id, { name, password, role }) => {
  try {
    console.log(id);
    const response = await apiAxios.put(`/users/update/${id}`, { name, password, role });
    return response.data;
  } catch (error) {
    console.error("Error en actualizar usuario:", error);
  }
};

// export const getInfo = async () => {
//   try {
//     const response = await apiAxios.get("/users/my");
//     return response.data;
//   } catch (error) {
//     console.error("Error al obtener información:", error);
//   }
// };

export const decodeToken = () => {
  const token = sessionStorage.getItem("jwt_project") || null;
  return token ? jwtDecode(token) : null;
};
