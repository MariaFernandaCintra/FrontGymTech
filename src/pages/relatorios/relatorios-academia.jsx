import { useState } from "react";

import "../dashboard/dashboard.css";
import "../treinos/treinos-profissional.css";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuAcademia } from "../../componets/client-sidebar/menus";
import { useRelatoriosAcademia, dataBR } from "../../hooks/useRelatoriosAcademia";

import { getInitials } from "../../utils/initials";

import {
    CalendarDays,
    Users,
    ClipboardList,
    UserCheck,
    Download
} from "lucide-react";


const PERIODOS = [
    { dias: 7, rotulo: "ÚLTIMOS 7 DIAS" },
    { dias: 30, rotulo: "ÚLTIMOS 30 DIAS" },
    { dias: 90, rotulo: "ÚLTIMOS 90 DIAS" }
];


// Baixa uma lista como CSV (separador ";" e acentos corretos para abrir no Excel)
function baixarCsv(nomeArquivo, cabecalho, linhas) {

    const escapar = (valor) => {

        let texto = String(valor ?? "");

        // Evita que o Excel trate o texto como fórmula
        if (/^[=+\-@]/.test(texto)) {
            texto = `'${texto}`;
        }

        return `"${texto.replace(/"/g, '""')}"`;
    };

    const conteudo = [cabecalho, ...linhas]
        .map((linha) => linha.map(escapar).join(";"))
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = nomeArquivo;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function formatarPercentual(valor) {

    return valor === null ? "—" : `${valor}%`;
}


// Cartão de indicador, no mesmo formato do dashboard
function Kpi({ rotulo, valor, nota, icone: Icone }) {

    return (
        <section className="dash-kpi">

            <div className="dash-kpi-top">
                <span>{rotulo}</span>

                <div className="dash-kpi-icon">
                    <Icone size={15} />
                </div>
            </div>

            <strong>{valor}</strong>

            <small>{nota}</small>

        </section>
    );
}

// Título pequeno para separar as listas dentro de um bloco
function Subtitulo({ children }) {

    return (
        <p
            style={{
                margin: "22px 0 0",
                color: "#7d7d7d",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase"
            }}
        >
            {children}
        </p>
    );
}

// Cabeçalho do bloco, com o botão de exportar
function CabecalhoBloco({ icone: Icone, titulo, onExportar }) {

    return (
        <div
            className="dash-card-header"
            style={{ justifyContent: "space-between", alignItems: "center" }}
        >
            <h3>
                <Icone size={14} />
                {titulo}
            </h3>

            <button type="button" className="trn-tab" onClick={onExportar}>
                <Download size={13} /> Exportar CSV
            </button>
        </div>
    );
}

function ListaDeAulas({ aulas }) {

    return (
        <ul className="dash-list">
            {aulas.map((a) => (
                <li key={a.id}>

                    <div className="dash-list-info">
                        <strong>{a.nome}</strong>
                        <span>{dataBR(a.data)} • {a.profissional}</span>
                    </div>

                    <span className="dash-badge">
                        {a.ocupadas}/{a.capacidade} ({a.ocupacao}%)
                    </span>

                </li>
            ))}
        </ul>
    );
}


function RelatoriosAcademia() {

    const [dias, setDias] = useState(30);

    const { nomeAcademia, relatorios, periodo, avisos, loading, error } = useRelatoriosAcademia(dias);

    const sufixo = periodo ? periodo.hoje : "";

    return (

        <div className="dash-page">

            <ClientSidebar
                name={nomeAcademia}
                plan="Academia"
                menu={menuAcademia}
            />

            <main className="dash-main">

                {/* CABEÇALHO */}
                <header className="dash-header">
                    <div>
                        <h1>RELATÓRIOS</h1>
                        <p className="dash-quote">
                            {periodo
                                ? `Período: ${dataBR(periodo.inicio)} a ${dataBR(periodo.hoje)}`
                                : "Gerando relatórios..."}
                        </p>
                    </div>
                </header>


                {/* PERÍODO */}
                <div className="trn-toolbar">

                    <div className="trn-tabs">
                        {PERIODOS.map((p) => (
                            <button
                                key={p.dias}
                                type="button"
                                className={dias === p.dias ? "trn-tab active" : "trn-tab"}
                                onClick={() => setDias(p.dias)}
                                disabled={loading}
                            >
                                {p.rotulo}
                            </button>
                        ))}
                    </div>

                </div>

                {error && <div className="trn-erro">{error}</div>}

                {avisos && <div className="trn-erro">{avisos}</div>}

                {loading && <div className="trn-vazio">Gerando relatórios...</div>}


                {!loading && relatorios && (

                    <>

                        {/* ================= AULAS ================= */}
                        <section className="dash-card">

                            <CabecalhoBloco
                                icone={CalendarDays}
                                titulo="AULAS"
                                onExportar={() => baixarCsv(
                                    `relatorio-aulas-${sufixo}.csv`,
                                    relatorios.aulas.csv.cabecalho,
                                    relatorios.aulas.csv.linhas
                                )}
                            />

                            <div className="dash-kpis">
                                <Kpi
                                    rotulo="AULAS DADAS"
                                    valor={relatorios.aulas.dadas}
                                    nota="No período"
                                    icone={CalendarDays}
                                />
                                <Kpi
                                    rotulo="CANCELADAS"
                                    valor={relatorios.aulas.canceladas}
                                    nota="No período"
                                    icone={CalendarDays}
                                />
                                <Kpi
                                    rotulo="OCUPAÇÃO MÉDIA"
                                    valor={formatarPercentual(relatorios.aulas.ocupacaoMedia)}
                                    nota="Vagas preenchidas nas aulas dadas"
                                    icone={UserCheck}
                                />
                            </div>

                            {relatorios.aulas.tipos.length === 0 ? (

                                <p className="dash-empty">Nenhuma aula dada neste período.</p>

                            ) : (

                                <>
                                    <Subtitulo>Ocupação por tipo de aula</Subtitulo>

                                    <ul className="dash-list">
                                        {relatorios.aulas.tipos.map((t) => (
                                            <li key={t.tipo}>

                                                <div className="dash-list-info">
                                                    <strong>{t.tipo}</strong>

                                                    <div className="dash-bar">
                                                        <span style={{ width: `${t.ocupacao ?? 0}%` }}></span>
                                                    </div>
                                                </div>

                                                <span className="dash-badge">
                                                    {t.aulas} {t.aulas === 1 ? "aula" : "aulas"} • {formatarPercentual(t.ocupacao)}
                                                </span>

                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {relatorios.aulas.maisCheias.length > 0 && (
                                <>
                                    <Subtitulo>Aulas mais cheias</Subtitulo>
                                    <ListaDeAulas aulas={relatorios.aulas.maisCheias} />

                                    <Subtitulo>Aulas mais vazias</Subtitulo>
                                    <ListaDeAulas aulas={relatorios.aulas.maisVazias} />
                                </>
                            )}

                        </section>


                        {/* ================= ALUNOS ================= */}
                        <section className="dash-card">

                            <CabecalhoBloco
                                icone={Users}
                                titulo="ALUNOS"
                                onExportar={() => baixarCsv(
                                    `relatorio-alunos-${sufixo}.csv`,
                                    relatorios.alunos.csv.cabecalho,
                                    relatorios.alunos.csv.linhas
                                )}
                            />

                            <div className="dash-kpis">
                                <Kpi
                                    rotulo="NOVOS CADASTROS"
                                    valor={relatorios.alunos.novos}
                                    nota="No período"
                                    icone={Users}
                                />
                                <Kpi
                                    rotulo="ATIVOS"
                                    valor={relatorios.alunos.ativos}
                                    nota="Hoje"
                                    icone={UserCheck}
                                />
                                <Kpi
                                    rotulo="INATIVOS"
                                    valor={relatorios.alunos.inativos}
                                    nota="Hoje"
                                    icone={Users}
                                />
                            </div>

                            <Subtitulo>Alunos que mais reservaram aulas</Subtitulo>

                            {relatorios.alunos.maisAtivos.length === 0 ? (

                                <p className="dash-empty">Nenhuma reserva em aulas já realizadas neste período.</p>

                            ) : (

                                <ul className="dash-list">
                                    {relatorios.alunos.maisAtivos.map((a) => (
                                        <li key={a.id}>

                                            <div className="dash-avatar-sm">
                                                {getInitials(a.nome)}
                                            </div>

                                            <div className="dash-list-info">
                                                <strong>{a.nome}</strong>
                                            </div>

                                            <span className="dash-badge">
                                                {a.total} {a.total === 1 ? "reserva" : "reservas"}
                                            </span>

                                        </li>
                                    ))}
                                </ul>
                            )}

                        </section>


                        {/* ================= AVALIAÇÕES ================= */}
                        <section className="dash-card">

                            <CabecalhoBloco
                                icone={ClipboardList}
                                titulo="AVALIAÇÕES FÍSICAS"
                                onExportar={() => baixarCsv(
                                    `relatorio-avaliacoes-${sufixo}.csv`,
                                    relatorios.avaliacoes.csv.cabecalho,
                                    relatorios.avaliacoes.csv.linhas
                                )}
                            />

                            <div className="dash-kpis">
                                <Kpi
                                    rotulo="REALIZADAS"
                                    valor={relatorios.avaliacoes.realizadas}
                                    nota="Com ficha preenchida"
                                    icone={ClipboardList}
                                />
                                <Kpi
                                    rotulo="CANCELADAS"
                                    valor={relatorios.avaliacoes.canceladas}
                                    nota="No período"
                                    icone={ClipboardList}
                                />
                                <Kpi
                                    rotulo="SEM FICHA"
                                    valor={relatorios.avaliacoes.semFicha}
                                    nota="Data já passou"
                                    icone={ClipboardList}
                                />
                                <Kpi
                                    rotulo="TAXA DE REALIZAÇÃO"
                                    valor={formatarPercentual(relatorios.avaliacoes.taxaRealizacao)}
                                    nota="Realizadas entre as que já deveriam ter ocorrido"
                                    icone={UserCheck}
                                />
                            </div>

                        </section>


                        {/* ================= EQUIPE ================= */}
                        <section className="dash-card">

                            <CabecalhoBloco
                                icone={UserCheck}
                                titulo="EQUIPE"
                                onExportar={() => baixarCsv(
                                    `relatorio-equipe-${sufixo}.csv`,
                                    relatorios.equipe.csv.cabecalho,
                                    relatorios.equipe.csv.linhas
                                )}
                            />

                            {relatorios.equipe.itens.length === 0 ? (

                                <p className="dash-empty">Nenhum profissional ativo cadastrado.</p>

                            ) : (

                                <ul className="dash-list">
                                    {relatorios.equipe.itens.map((p) => (
                                        <li key={p.id}>

                                            <div className="dash-avatar-sm">
                                                {getInitials(p.nome)}
                                            </div>

                                            <div className="dash-list-info">
                                                <strong>{p.nome}</strong>
                                                <span>
                                                    {p.especialidade} • {p.aulas} {p.aulas === 1 ? "aula" : "aulas"} •{" "}
                                                    {p.alunos} {p.alunos === 1 ? "aluno" : "alunos"} •{" "}
                                                    {p.avaliacoes} {p.avaliacoes === 1 ? "avaliação" : "avaliações"} •{" "}
                                                    {p.treinos} {p.treinos === 1 ? "treino" : "treinos"}
                                                </span>
                                            </div>

                                        </li>
                                    ))}
                                </ul>

                            )}

                        </section>

                    </>
                )}

            </main>

        </div>
    );
}

export default RelatoriosAcademia;