// =========================
// SESSÃO PROVISÓRIA (FRONT-END)
// =========================
// Enquanto o back-end não existe, o usuário logado fica salvo no
// navegador. Quando a API estiver pronta, troque estas funções pelo
// token/dados retornados pelo login.

const STORAGE_KEY = "gymtech:user";

export function saveUser(user) {

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
        // armazenamento indisponível: ignora
    }

}

export function getUser() {

    try {

        const stored = localStorage.getItem(STORAGE_KEY);

        return stored ? JSON.parse(stored) : null;

    } catch {

        return null;

    }

}

export function logout() {

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // armazenamento indisponível: ignora
    }

}
