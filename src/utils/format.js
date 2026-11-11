// "2026-11-12" -> "12/11"
export function formatarData(iso) {

    if (!iso) return "Sem data";

    const [, mes, dia] = iso.split("-");

    return `${dia}/${mes}`;
}