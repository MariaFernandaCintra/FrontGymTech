
import axios from "axios";

import { getUser, logout } from "./auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});


// Envia o token em toda requisição
api.interceptors.request.use((config) => {

    const user = getUser();

    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
});


// Token inválido ou expirado: limpa a sessão e volta ao login
api.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response?.status === 401) {

            logout();

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
