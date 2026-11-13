import { useState } from "react";

import "../dashboard/dashboard.css";
import "../treinos/treinos-profissional.css";
import "./alunos-profissional.css";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuProfissional } from "../../componets/client-sidebar/menus";

import { useUsuarioLogado } from "../../hooks/useUsuarioLogado";
import { useAlunosProfissional } from "../../hooks/useAlunosProfissional";

import { formatarData, formatarDataHora } from "../../utils/format";
import { getInitials } from "../../utils/initials";
import { normalizarTexto } from "../../utils/texto";

import {
    Search,
    ChevronDown,
    ChevronUp,
    Dumbbell,
    CalendarDays,
    Clock
} from "lucide-react";


const FILTROS = [
    { id: "todos", rotulo: "TODOS" },
    { id: "com", rotulo: "COM TREINO ATIVO" },
    { id: "sem", rotulo: "SEM TREINO ATIVO" }
];


function AlunoCard({ aluno, aberto, onAlternar }) {

    const temTreino = aluno.treinosAtivos > 0;

    return (

        <article className="trn-card">

            <div className="trn-card-top">

                <div className="dash-avatar-sm">
                    {getInitials(aluno.nome)}
                </div>

                <div className="trn-card-info">
                    <h3>{aluno.nome}</h3>
                    <span>
                        {aluno.treinos.length} {aluno.treinos.length === 1 ? "treino" : "treinos"} • {aluno.aulas.length} {aluno.aulas.length === 1 ? "aula reservada" : "aulas reservadas"}
                    </span>
                </div>

                <span className={temTreino ? "dash-badge" : "dash-badge warn"}>
                    {temTreino ? "COM TREINO ATIVO" : "SEM TREINO ATIVO"}
                </span>

            </div>


            <div className="trn-meta">

                <span>
                    <Dumbbell size={13} />
                    {aluno.treinosAtivos} {aluno.treinosAtivos === 1 ? "treino ativo" : "treinos ativos"}
                </span>

                <span>
                    <CalendarDays size={13} />
                    Próximo treino: {aluno.proximoTreino ? formatarData(aluno.proximoTreino) : "não agendado"}
                </span>

                <span>
                    <Clock size={13} />
                    Próxima aula: {aluno.proximaAula
                        ? `${formatarDataHora(aluno.proximaAula).dia} às ${formatarDataHora(aluno.proximaAula).hora}`
                        : "nenhuma"}
                </span>

            </div>


            <div className="trn-actions">

                <button type="button" className="trn-btn" onClick={onAlternar}>

                    {aberto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}

                    {aberto ? "OCULTAR DETALHES" : "VER DETALHES"}

                </button>

            </div>


            {aberto && (

                <div className="alu-detalhe">

                    <div>

                        <h4>TREINOS</h4>

                        {aluno.treinos.length === 0 ? (

                            <p className="dash-empty">Nenhum treino cadastrado.</p>

                        ) : (

                            <ul className="dash-list">
                                {aluno.treinos.map((t) => (
                                    <li key={t.id_treino}>

                                        <span className="dash-list-time">
                                            {t.data_programada ? formatarData(t.data_programada) : "--"}
                                        </span>

                                        <div className="dash-list-info">
                                            <strong>{t.titulo_treino}</strong>
                                            <span>
                                                {t.quantidade_exercicios} {t.quantidade_exercicios === 1 ? "exercício" : "exercícios"}
                                            </span>
                                        </div>

                                        <span className={t.status === "Cancelado" ? "dash-badge danger" : "dash-badge"}>
                                            {t.status.toUpperCase()}
                                        </span>

                                    </li>
                                ))}
                            </ul>

                        )}

                    </div>


                    <div>

                        <h4>AULAS RESERVADAS</h4>

                        {aluno.aulas.length === 0 ? (

                            <p className="dash-empty">Nenhuma aula reservada.</p>

                        ) : (

                            <ul className="dash-list">
                                {aluno.aulas.map((r) => {

                                    const { dia, hora } = formatarDataHora(r.data_horario_aula);

                                    return (
                                        <li key={r.id_reserva_aula}>

                                            <span className="dash-list-time">{hora}</span>

                                            <div className="dash-list-info">
                                                <strong>{r.nome_aula}</strong>
                                                <span>{dia} • {r.tipo_aula}</span>
                                            </div>

                                        </li>
                                    );
                                })}
                            </ul>

                        )}

                    </div>

                </div>

            )}

        </article>
    );
}


function AlunosProfissional() {

    const usuario = useUsuarioLogado();

    const { alunos, loading, error } = useAlunosProfissional();

    const [filtro, setFiltro] = useState("todos");
    const [busca, setBusca] = useState("");
    const [aberto, setAberto] = useState(null);

    const termo = normalizarTexto(busca.trim());

    const visiveis = alunos.filter((aluno) => {

        if (filtro === "com" && aluno.treinosAtivos === 0) return false;
        if (filtro === "sem" && aluno.treinosAtivos > 0) return false;

        return normalizarTexto(aluno.nome).includes(termo);
    });

    return (

        <div className="dash-page">

            <ClientSidebar
                name={usuario?.nome || "Profissional"}
                plan="Profissional"
                menu={menuProfissional}
            />

            <main className="dash-main">

                {/* CABEÇALHO */}
                <header className="dash-header">
                    <div>
                        <h1>MEUS ALUNOS</h1>
                        <p className="dash-quote">
                            {loading
                                ? "Carregando..."
                                : `${alunos.length} ${alunos.length === 1 ? "aluno" : "alunos"} com treino ou aula com você`}
                        </p>
                    </div>
                </header>


                {/* FILTROS */}
                <div className="trn-toolbar">

                    <div className="trn-tabs">
                        {FILTROS.map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                className={filtro === f.id ? "trn-tab active" : "trn-tab"}
                                onClick={() => setFiltro(f.id)}
                            >
                                {f.rotulo}
                            </button>
                        ))}
                    </div>

                    <label className="trn-search">
                        <Search size={14} />

                        <input
                            type="text"
                            placeholder="Buscar pelo nome do aluno"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </label>

                </div>


                {error && <div className="trn-erro">{error}</div>}

                {!error && !loading && alunos.length === 0 && (

                    <div className="trn-vazio">
                        Nenhum aluno por aqui ainda. Os alunos aparecem quando
                        têm um treino seu ou uma reserva em uma aula sua.
                    </div>

                )}

                {!error && !loading && alunos.length > 0 && visiveis.length === 0 && (

                    <div className="trn-vazio">
                        Nenhum aluno encontrado com esse filtro.
                    </div>

                )}


                <div className="trn-list">

                    {visiveis.map((aluno) => (

                        <AlunoCard
                            key={aluno.id}
                            aluno={aluno}
                            aberto={aberto === aluno.id}
                            onAlternar={() =>
                                setAberto(aberto === aluno.id ? null : aluno.id)
                            }
                        />

                    ))}

                </div>

            </main>

        </div>
    );
}

export default AlunosProfissional;