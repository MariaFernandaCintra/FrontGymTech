
const STORAGE_KEY = "gymtech:user";

export function saveUser(user) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
        console.error("Não foi possível salvar a sessão.");
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
        console.error("Não foi possível encerrar a sessão.");
    }
}
