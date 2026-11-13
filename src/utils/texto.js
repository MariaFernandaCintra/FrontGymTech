// Remove acentos e deixa minúsculo, para buscas que ignoram "João" x "joao"
export function normalizarTexto(texto = "") {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}