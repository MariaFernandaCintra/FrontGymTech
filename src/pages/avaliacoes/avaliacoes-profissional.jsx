import { useCallback, useEffect, useMemo, useState } from "react";

import "../dashboard/dashboard.css";
import "../treinos/treinos-profissional.css";
import "./avaliacoes-profissional.css";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuProfissional } from "../../componets/client-sidebar/menus";

import { useUsuarioLogado } from "../../hooks/useUsuarioLogado";
import api from "../../services/api";

import { mensagemErro } from "../../utils/erro";
import { hojeISO, formatarDataHora } from "../../utils/format";
import { getInitials } from "../../utils/initials";

import {
    Search,
    CalendarDays,
    Clock,
    ClipboardList,
    Pencil,
    Eye,
    Ban,
    Save,
    X
} from "lucide-react";


const FILTROS = [
    { valor: "Agendado", rotulo: "PENDENTES" },
    { valor: "Realizado", rotulo: "REALIZADAS" },
    { valor: "Cancelado", rotulo: "CANCELADAS" },
    { valor: "Todos", rotulo: "TODAS" }
];

const FORMULARIO_VAZIO = {
    peso: "",
    altura: "",
    percentual_gordura: "",
    massa_magra: "",
    medidas_corporais: "",
    observacoes_tecnicas: ""
};


// "75,5" ou "75.5" -> 75.5 (NaN se não for número)
function paraNumero(texto) {

    return Number(String(texto).trim().replace(",", "."));
}

// 75.5 -> "75,5" (para mostrar no campo)
function paraCampo(numero) {

    return numero == null ? "" : String(numero).replace(".", ",");
}

// 75.5 -> "75,50 kg"
function formatarMedida(numero, unidade) {

    if (numero == null) return "Não informado";

    return `${Number(numero).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} ${unidade}`;
}

function calcularImc(peso, altura) {

    if (!peso || !altura) return null;

    return peso / (altura * altura);
}


function AvaliacoesProfissional() {

    const usuario = useUsuarioLogado();

    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filtro, setFiltro] = useState("Agendado");
    const [busca, setBusca] = useState("");

    // Painel aberto dentro de um card: { id, modo: "criar" | "ver" | "editar" }
    const [painel, setPainel] = useState(null);
    const [ficha, setFicha] = useState(null);
    const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
    const [carregandoFicha, setCarregandoFicha] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [cancelandoId, setCancelandoId] = useState(null);

    const [erroAcao, setErroAcao] = useState("");
    const [sucesso, setSucesso] = useState("");


    const carregar = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const resposta = await api.get("/profissionais/me/agendamentos", {
                params: { status: "Todos", limit: 500, offset: 0 }
            });

            setAgendamentos(resposta.data.itens);

        } catch (err) {

            setError(mensagemErro(err, "Não foi possível carregar as avaliações."));

            console.error("Erro ao carregar avaliações:", err);

        } finally {

            setLoading(false);
        }

    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);


    const contagem = useMemo(() => ({
        pendentes: agendamentos.filter((a) => a.status === "Agendado").length,
        realizadas: agendamentos.filter((a) => a.status === "Realizado").length
    }), [agendamentos]);

    const filtrados = useMemo(() => {

        const texto = busca.toLowerCase().trim();

        return agendamentos
            .filter((a) => filtro === "Todos" || a.status === filtro)
            .filter((a) => !texto || a.nome_aluno.toLowerCase().includes(texto))
            .sort((a, b) =>
                filtro === "Agendado"
                    ? a.data_horario.localeCompare(b.data_horario)   // próximas primeiro
                    : b.data_horario.localeCompare(a.data_horario)   // mais recentes primeiro
            );

    }, [agendamentos, filtro, busca]);


    function fecharPainel() {

        setPainel(null);
        setFicha(null);
        setFormulario(FORMULARIO_VAZIO);
        setErroAcao("");
    }

    function abrirPreenchimento(agendamento) {

        setSucesso("");
        setErroAcao("");
        setFicha(null);
        setFormulario(FORMULARIO_VAZIO);
        setPainel({ id: agendamento.id_agendamento_avaliacao, modo: "criar" });
    }

    async function abrirFicha(agendamento) {

        const id = agendamento.id_agendamento_avaliacao;

        setSucesso("");
        setErroAcao("");
        setPainel({ id, modo: "ver" });
        setFicha(null);

        try {

            setCarregandoFicha(true);

            const resposta = await api.get(`/profissionais/me/agendamentos/${id}/avaliacao`);

            setFicha(resposta.data);

        } catch (err) {

            setErroAcao(mensagemErro(err, "Não foi possível carregar a ficha."));
            setPainel(null);

        } finally {

            setCarregandoFicha(false);
        }
    }

    function iniciarEdicao() {

        setErroAcao("");

        setFormulario({
            peso: paraCampo(ficha.peso),
            altura: paraCampo(ficha.altura),
            percentual_gordura: paraCampo(ficha.percentual_gordura),
            massa_magra: paraCampo(ficha.massa_magra),
            medidas_corporais: ficha.medidas_corporais || "",
            observacoes_tecnicas: ficha.observacoes_tecnicas || ""
        });

        setPainel((atual) => ({ ...atual, modo: "editar" }));
    }

    function atualizarCampo(evento) {

        const { name, value } = evento.target;

        setFormulario((anterior) => ({ ...anterior, [name]: value }));
    }


    // Confere os campos antes de enviar. Devolve a mensagem de erro ou "".
    function validar() {

        const peso = paraNumero(formulario.peso);
        const altura = paraNumero(formulario.altura);

        if (!formulario.peso.trim() || Number.isNaN(peso) || peso <= 0 || peso >= 1000) {
            return "Informe um peso válido em kg (ex: 75,5).";
        }

        if (!formulario.altura.trim() || Number.isNaN(altura) || altura < 0.5 || altura >= 3) {
            return "Informe a altura em metros (ex: 1,75).";
        }

        if (formulario.percentual_gordura.trim()) {

            const gordura = paraNumero(formulario.percentual_gordura);

            if (Number.isNaN(gordura) || gordura < 0 || gordura > 100) {
                return "O percentual de gordura deve estar entre 0 e 100.";
            }
        }

        if (formulario.massa_magra.trim()) {

            const massa = paraNumero(formulario.massa_magra);

            if (Number.isNaN(massa) || massa < 0 || massa >= 1000) {
                return "Informe uma massa magra válida em kg.";
            }
        }

        return "";
    }

    // Número do campo -> texto com 2 casas ("75.50"), como a API espera
    function paraEnvio(texto) {

        return paraNumero(texto).toFixed(2);
    }

    function montarCorpoCriacao() {

        const corpo = {
            peso: paraEnvio(formulario.peso),
            altura: paraEnvio(formulario.altura)
        };

        if (formulario.percentual_gordura.trim()) {
            corpo.percentual_gordura = paraEnvio(formulario.percentual_gordura);
        }

        if (formulario.massa_magra.trim()) {
            corpo.massa_magra = paraEnvio(formulario.massa_magra);
        }

        if (formulario.medidas_corporais.trim()) {
            corpo.medidas_corporais = formulario.medidas_corporais.trim();
        }

        if (formulario.observacoes_tecnicas.trim()) {
            corpo.observacoes_tecnicas = formulario.observacoes_tecnicas.trim();
        }

        return corpo;
    }

    // Na edição só vai o que mudou
    function montarCorpoEdicao() {

        const corpo = {};

        if (paraNumero(formulario.peso) !== ficha.peso) {
            corpo.peso = paraEnvio(formulario.peso);
        }

        if (paraNumero(formulario.altura) !== ficha.altura) {
            corpo.altura = paraEnvio(formulario.altura);
        }

        for (const campo of ["percentual_gordura", "massa_magra"]) {

            const texto = formulario[campo].trim();
            const original = ficha[campo];

            if (!texto) {
                if (original != null) corpo[campo] = null;
            } else if (paraNumero(texto) !== original) {
                corpo[campo] = paraEnvio(texto);
            }
        }

        for (const campo of ["medidas_corporais", "observacoes_tecnicas"]) {

            const texto = formulario[campo].trim();

            if (texto !== (ficha[campo] || "")) {
                corpo[campo] = texto;
            }
        }

        return corpo;
    }


    async function salvar(evento) {

        evento.preventDefault();

        const mensagemValidacao = validar();

        if (mensagemValidacao) {
            setErroAcao(mensagemValidacao);
            return;
        }

        const criando = painel.modo === "criar";
        const corpo = criando ? montarCorpoCriacao() : montarCorpoEdicao();

        if (!criando && Object.keys(corpo).length === 0) {
            setErroAcao("Você não alterou nenhum dado da ficha.");
            return;
        }

        const url = `/profissionais/me/agendamentos/${painel.id}/avaliacao`;

        try {

            setSalvando(true);
            setErroAcao("");

            if (criando) {
                await api.post(url, corpo);
            } else {
                await api.patch(url, corpo);
            }

            setSucesso(criando
                ? "Avaliação registrada com sucesso!"
                : "Ficha atualizada com sucesso!");

            fecharPainel();
            carregar();

        } catch (err) {

            setErroAcao(mensagemErro(err, "Não foi possível salvar a ficha."));

            console.error("Erro ao salvar ficha:", err);

        } finally {

            setSalvando(false);
        }
    }


    async function cancelar(agendamento) {

        const { dia, hora } = formatarDataHora(agendamento.data_horario);

        const confirmou = window.confirm(
            `Cancelar a avaliação de ${agendamento.nome_aluno} (${dia} às ${hora})?`
        );

        if (!confirmou) return;

        try {

            setCancelandoId(agendamento.id_agendamento_avaliacao);
            setErroAcao("");
            setSucesso("");

            await api.delete(
                `/profissionais/me/agendamentos/${agendamento.id_agendamento_avaliacao}`
            );

            setSucesso("Avaliação cancelada.");

            carregar();

        } catch (err) {

            setErroAcao(mensagemErro(err, "Não foi possível cancelar a avaliação."));

        } finally {

            setCancelandoId(null);
        }
    }


    function renderizarFormulario() {

        return (

            <form className="aval-form" onSubmit={salvar}>

                <div className="aval-form-grid">

                    <label className="aval-campo">
                        <span>Peso (kg) *</span>
                        <input
                            name="peso"
                            inputMode="decimal"
                            placeholder="Ex: 75,5"
                            value={formulario.peso}
                            onChange={atualizarCampo}
                        />
                    </label>

                    <label className="aval-campo">
                        <span>Altura (m) *</span>
                        <input
                            name="altura"
                            inputMode="decimal"
                            placeholder="Ex: 1,75"
                            value={formulario.altura}
                            onChange={atualizarCampo}
                        />
                    </label>

                    <label className="aval-campo">
                        <span>Gordura corporal (%)</span>
                        <input
                            name="percentual_gordura"
                            inputMode="decimal"
                            placeholder="Ex: 18,5"
                            value={formulario.percentual_gordura}
                            onChange={atualizarCampo}
                        />
                    </label>

                    <label className="aval-campo">
                        <span>Massa magra (kg)</span>
                        <input
                            name="massa_magra"
                            inputMode="decimal"
                            placeholder="Ex: 61,5"
                            value={formulario.massa_magra}
                            onChange={atualizarCampo}
                        />
                    </label>

                </div>

                <label className="aval-campo">
                    <span>Medidas corporais</span>
                    <textarea
                        name="medidas_corporais"
                        rows={2}
                        placeholder="Ex: Tórax: 98cm, Cintura: 80cm, Braço: 34cm"
                        value={formulario.medidas_corporais}
                        onChange={atualizarCampo}
                    />
                </label>

                <label className="aval-campo">
                    <span>Observações técnicas</span>
                    <textarea
                        name="observacoes_tecnicas"
                        rows={3}
                        placeholder="Restrições, objetivo, pontos de atenção..."
                        value={formulario.observacoes_tecnicas}
                        onChange={atualizarCampo}
                    />
                </label>

                <div className="trn-actions">

                    <button type="submit" className="trn-btn" disabled={salvando}>
                        <Save size={13} />
                        {salvando ? "SALVANDO..." : "SALVAR FICHA"}
                    </button>

                    <button
                        type="button"
                        className="trn-btn"
                        onClick={fecharPainel}
                        disabled={salvando}
                    >
                        <X size={13} />
                        FECHAR
                    </button>

                </div>

            </form>
        );
    }


    function renderizarFicha() {

        if (carregandoFicha || !ficha) {
            return <p className="aval-carregando">Carregando ficha...</p>;
        }

        const imc = calcularImc(ficha.peso, ficha.altura);

        return (

            <div className="aval-ficha">

                <div className="aval-medidas">

                    <div>
                        <span>PESO</span>
                        <strong>{formatarMedida(ficha.peso, "kg")}</strong>
                    </div>

                    <div>
                        <span>ALTURA</span>
                        <strong>{formatarMedida(ficha.altura, "m")}</strong>
                    </div>

                    <div>
                        <span>IMC (CALCULADO)</span>
                        <strong>
                            {imc == null
                                ? "Não informado"
                                : imc.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                        </strong>
                    </div>

                    <div>
                        <span>GORDURA</span>
                        <strong>{formatarMedida(ficha.percentual_gordura, "%")}</strong>
                    </div>

                    <div>
                        <span>MASSA MAGRA</span>
                        <strong>{formatarMedida(ficha.massa_magra, "kg")}</strong>
                    </div>

                </div>

                <div className="aval-texto">
                    <span>MEDIDAS CORPORAIS</span>
                    <p>{ficha.medidas_corporais || "Não informado"}</p>
                </div>

                <div className="aval-texto">
                    <span>OBSERVAÇÕES TÉCNICAS</span>
                    <p>{ficha.observacoes_tecnicas || "Não informado"}</p>
                </div>

                <div className="trn-actions">

                    <button type="button" className="trn-btn" onClick={iniciarEdicao}>
                        <Pencil size={13} />
                        EDITAR FICHA
                    </button>

                    <button type="button" className="trn-btn" onClick={fecharPainel}>
                        <X size={13} />
                        FECHAR
                    </button>

                </div>

            </div>
        );
    }


    const hoje = hojeISO();

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
                        <h1>AVALIAÇÕES</h1>
                        <p className="dash-quote">
                            {loading
                                ? "Carregando..."
                                : `${contagem.pendentes} ${contagem.pendentes === 1 ? "pendente" : "pendentes"} • ${contagem.realizadas} ${contagem.realizadas === 1 ? "realizada" : "realizadas"}`}
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
                                className={filtro === f.valor ? "trn-tab active" : "trn-tab"}
                                onClick={() => setFiltro(f.valor)}
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


                {sucesso && <div className="aval-sucesso">{sucesso}</div>}

                {erroAcao && <div className="trn-erro">{erroAcao}</div>}

                {error && <div className="trn-erro">{error}</div>}


                {!error && !loading && filtrados.length === 0 && (

                    <div className="trn-vazio">
                        Nenhuma avaliação encontrada neste filtro.
                    </div>

                )}


                {/* LISTA */}
                <section className="trn-list">

                    {filtrados.map((a) => {

                        const id = a.id_agendamento_avaliacao;
                        const { dia, hora } = formatarDataHora(a.data_horario);

                        const agendada = a.status === "Agendado";
                        const realizada = a.status === "Realizado";
                        const cancelada = a.status === "Cancelado";
                        const atrasada = agendada && a.data_horario.slice(0, 10) < hoje;

                        const painelAberto = painel?.id === id;

                        return (

                            <article
                                key={id}
                                className={cancelada ? "trn-card cancelado" : "trn-card"}
                            >

                                <div className="trn-card-top">

                                    <div className="dash-avatar-sm">
                                        {getInitials(a.nome_aluno)}
                                    </div>

                                    <div className="trn-card-info">
                                        <h3>Avaliação física</h3>
                                        <span>{a.nome_aluno}</span>
                                    </div>

                                    <span
                                        className={
                                            cancelada
                                                ? "dash-badge danger"
                                                : atrasada
                                                    ? "dash-badge warn"
                                                    : "dash-badge"
                                        }
                                    >
                                        {cancelada
                                            ? "CANCELADA"
                                            : realizada
                                                ? "REALIZADA"
                                                : atrasada
                                                    ? "AGUARDANDO FICHA"
                                                    : "AGENDADA"}
                                    </span>

                                </div>


                                <div className="trn-meta">

                                    <span>
                                        <CalendarDays size={13} />
                                        {dia}
                                    </span>

                                    <span>
                                        <Clock size={13} />
                                        {hora}
                                    </span>

                                    <span>
                                        <ClipboardList size={13} />
                                        {a.possui_ficha ? "Ficha preenchida" : "Sem ficha"}
                                    </span>

                                </div>


                                {!painelAberto && (

                                    <div className="trn-actions">

                                        {agendada && (
                                            <button
                                                type="button"
                                                className="trn-btn"
                                                onClick={() => abrirPreenchimento(a)}
                                            >
                                                <Pencil size={13} />
                                                PREENCHER FICHA
                                            </button>
                                        )}

                                        {realizada && (
                                            <button
                                                type="button"
                                                className="trn-btn"
                                                onClick={() => abrirFicha(a)}
                                            >
                                                <Eye size={13} />
                                                VER FICHA
                                            </button>
                                        )}

                                        {agendada && (
                                            <button
                                                type="button"
                                                className="trn-btn danger"
                                                onClick={() => cancelar(a)}
                                                disabled={cancelandoId === id}
                                            >
                                                <Ban size={13} />
                                                {cancelandoId === id ? "CANCELANDO..." : "CANCELAR"}
                                            </button>
                                        )}

                                    </div>

                                )}


                                {painelAberto && (

                                    <div className="aval-painel">

                                        {painel.modo === "ver"
                                            ? renderizarFicha()
                                            : renderizarFormulario()}

                                    </div>

                                )}

                            </article>
                        );
                    })}

                </section>

            </main>

        </div>
    );
}

export default AvaliacoesProfissional;