
import axios from "axios";
import { getUser } from "./auth";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
        "Content-Type": "application/json"
    }
});

// Interceptor: adiciona automaticamente o token JWT
api.interceptors.request.use(
    (config) => {
        const user = getUser();

        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
