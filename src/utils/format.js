// "2026-11-12" -> "12/11"
export function formatarData(iso) {

    if (!iso) return "Sem data";

    const [, mes, dia] = iso.split("-");

    return `${dia}/${mes}`;
}

// Data de hoje no formato AAAA-MM-DD (horário local).
// Não use toISOString(): ele converte para UTC e pode virar o dia seguinte.
export function hojeISO() {

    const d = new Date();

    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");

    return `${d.getFullYear()}-${mes}-${dia}`;
}