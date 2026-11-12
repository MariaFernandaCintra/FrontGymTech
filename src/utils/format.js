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

// "2026-11-12" -> "12/11/2026"
export function formatarDataCompleta(iso) {

    if (!iso) return "Sem data";

    const [ano, mes, dia] = iso.split("-");

    return `${dia}/${mes}/${ano}`;
}


// "00:01:30" -> "1min30s"
export function formatarDescanso(tempo) {

    if (!tempo) return null;

    const [h, m, s] = tempo.split(":").map(Number);

    const total = h * 3600 + m * 60 + (s || 0);

    const min = Math.floor(total / 60);
    const seg = total % 60;

    if (min === 0) return `${seg}s`;

    return seg === 0 ? `${min}min` : `${min}min${String(seg).padStart(2, "0")}s`;
}