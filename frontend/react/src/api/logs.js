import apiAxios from "./axios";


export const apiGetLogs = async () => {
    try {
        const response = await apiAxios.get("/logs");
        return response.data;
    } catch (error) {
        console.error("Error en obtener información personal:", error);
    }
};