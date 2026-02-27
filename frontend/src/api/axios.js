import axios from "axios";

const apiAxios = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
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
    const message = error?.response?.data?.message;

    if (message === "API connection failed") {
      console.warn("Fallo de conexión con el API.");
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default apiAxios;
