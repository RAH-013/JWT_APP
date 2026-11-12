import axios from "axios";

const apiAxios = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiAxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("jwt_project");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("jwt_project");
    }

    return Promise.reject(error);
  },
);

export default apiAxios;
