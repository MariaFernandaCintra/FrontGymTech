import { useState } from "react";

import "../dashboard/dashboard.css";
import "./treinos-profissional.css";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuProfissional } from "../../componets/client-sidebar/menus";

import { useUsuarioLogado } from "../../hooks/useUsuarioLogado";
import { useTreinosProfissional } from "../../hooks/useTreinosProfissional";
import { cancelarTreino } from "../../services/treinos";

import { mensagemErro } from "../../utils/erro";
import { formatarDataCompleta, formatarDescanso } from "../../utils/format";
import { getInitials } from "../../utils/initials";

import {
    Search,
    ChevronDown,
    ChevronUp,
    CalendarDays,
    Dumbbell,
    Ban
} from "lucide-react";


const FILTROS = [
    { valor: "Ativo", rotulo: "ATIVOS" },
    { valor: "Cancelado", rotulo: "CANCELADOS" },
    { valor: "Todos", rotulo: "TODOS" }
];


function detalhesDoItem(item) {

    const descanso = formatarDescanso(item.tempo_descanso);

    return [
        item.carga_sugerida != null
            ? `${Number(item.carga_sugerida).toLocaleString("pt-BR")} kg`
            : null,
        descanso ? `${descanso} de descanso` : null
    ]
        .filter(Boolean)
        .join(" • ");
}


function TreinoCard({ treino, aberto, cancelando, onAlternar, onCancelar }) {

    const cancelado = treino.status === "Cancelado";
    const qtd = treino.quantidade_exercicios;

    return (

        <article className={cancelado ? "trn-card cancelado" : "trn-card"}>

            <div className="trn-card-top">

                <div className="dash-avatar-sm">
                    {getInitials(treino.nome_aluno)}
                </div>

                <div className="trn-card-info">
                    <h3>{treino.titulo_treino}</h3>
                    <span>{treino.nome_aluno}</span>
                </div>

                <span className={cancelado ? "dash-badge danger" : "dash-badge"}>
                    {cancelado ? "CANCELADO" : "ATIVO"}
                </span>

            </div>


            <div className="trn-meta">

                <span>
                    <CalendarDays size={13} />
                    {formatarDataCompleta(treino.data_programada)}
                </span>

                <span>
                    <Dumbbell size={13} />
                    {qtd} {qtd === 1 ? "exercício" : "exercícios"}
                </span>

            </div>


            <div className="trn-actions">

                <button type="button" className="trn-btn" onClick={onAlternar}>

                    {aberto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}

                    {aberto ? "OCULTAR EXERCÍCIOS" : "VER EXERCÍCIOS"}

                </button>

                {!cancelado && (
                    <button
                        type="button"
                        className="trn-btn danger"
                        onClick={onCancelar}
                        disabled={cancelando}
                    >
                        <Ban size={13} />

                        {cancelando ? "CANCELANDO..." : "CANCELAR"}
                    </button>
                )}

            </div>


            {aberto && (

                <ol className="trn-exercicios">

                    {(treino.itens || []).map((item, i) => (

                        <li key={item.id_item_treino}>

                            <span className="trn-exercicio-num">{i + 1}</span>

                            <div className="dash-list-info">
                                <strong>{item.nome_exercicio}</strong>
                                <span>{item.grupo_muscular}</span>
                            </div>

                            <div className="trn-exercicio-dados">
                                <strong>{item.series} x {item.repeticoes}</strong>
                                <span>{detalhesDoItem(item)}</span>
                            </div>

                        </li>

                    ))}

                </ol>

            )}

        </article>
    );
}


function TreinosProfissional() {

    const usuario = useUsuarioLogado();

    const [status, setStatus] = useState("Ativo");
    const [busca, setBusca] = useState("");
    const [aberto, setAberto] = useState(null);          // id do treino expandido
    const [cancelandoId, setCancelandoId] = useState(null);
    const [erroAcao, setErroAcao] = useState("");

    const { treinos, total, loading, error, recarregar } = useTreinosProfissional({
        status,
        busca
    });


    async function handleCancelar(treino) {

        const confirmou = window.confirm(
            `Cancelar o treino "${treino.titulo_treino}" de ${treino.nome_aluno}?`
        );

        if (!confirmou) return;

        try {

            setCancelandoId(treino.id_treino);
            setErroAcao("");

            await cancelarTreino(treino.id_treino);

            recarregar();

        } catch (err) {

            setErroAcao(mensagemErro(err, "Não foi possível cancelar o treino."));

        } finally {

            setCancelandoId(null);
        }
    }


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
                        <h1>MEUS TREINOS</h1>
                        <p className="dash-quote">
                            {loading ? "Carregando..." : `${total} ${total === 1 ? "treino encontrado" : "treinos encontrados"}`}
                        </p>
                    </div>
                </header>


                {/* FILTROS */}
                <div className="trn-toolbar">

                    <div className="trn-tabs">
                        {FILTROS.map((f) => (
                            <button
                                key={f.valor}
                                type="button"
                                className={status === f.valor ? "trn-tab active" : "trn-tab"}
                                onClick={() => setStatus(f.valor)}
                            >
                                {f.rotulo}
                            </button>
                        ))}
                    </div>

                    <label className="trn-search">
                        <Search size={14} />

                        <input
                            type="text"
                            placeholder="Buscar pelo título do treino"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </label>

                </div>


                {erroAcao && <div className="trn-erro">{erroAcao}</div>}

                {error && <div className="trn-erro">{error}</div>}


                {/* LISTA */}
                {!error && !loading && treinos.length === 0 && (

                    <div className="trn-vazio">
                        Nenhum treino encontrado.
                    </div>

                )}

                <div className="trn-list">

                    {treinos.map((treino) => (

                        <TreinoCard
                            key={treino.id_treino}
                            treino={treino}
                            aberto={aberto === treino.id_treino}
                            cancelando={cancelandoId === treino.id_treino}
                            onAlternar={() =>
                                setAberto(aberto === treino.id_treino ? null : treino.id_treino)
                            }
                            onCancelar={() => handleCancelar(treino)}
                        />

                    ))}

                </div>

            </main>

        </div>
    );
}

export default TreinosProfissional;