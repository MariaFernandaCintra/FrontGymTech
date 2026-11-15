import { useEffect, useState } from "react";
import {
    UserRound,
    Mail,
    Phone,
    CalendarDays,
    ShieldCheck,
    Pencil,
    ArrowLeft,
    Save,
    LoaderCircle
} from "lucide-react";

import api from "../../services/api";
import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuProfissional } from "../../componets/client-sidebar/menus";

// Reaproveita o mesmo visual do perfil do aluno
import "./perfil-aluno.css";

function PerfilProfissional() {
    const [perfil, setPerfil] = useState(null);
    const [etapa, setEtapa] = useState("perfil");

    const [codigo, setCodigo] = useState("");
    const [destino, setDestino] = useState("");

    const [formulario, setFormulario] = useState({
        nome: "",
        email: "",
        telefone: "",
        data_nascimento: "",
        especialidade: "",
        registro_profissional: ""
    });

    const [carregando, setCarregando] = useState(false);
    const [enviandoCodigo, setEnviandoCodigo] = useState(false);

    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        carregarPerfil();
    }, []);

    function obterMensagemErro(error, mensagemPadrao) {
        const detalhe = error.response?.data?.detail;

        if (typeof detalhe === "string") {
            return detalhe;
        }

        if (Array.isArray(detalhe)) {
            return detalhe.map((item) => item.msg || "Erro de validação").join(" | ");
        }

        return mensagemPadrao;
    }

    function montarFormulario(dados) {
        return {
            nome: dados.nome || "",
            email: dados.email || "",
            telefone: dados.telefone || "",
            data_nascimento: dados.data_nascimento?.split("T")[0] || "",
            especialidade: dados.especialidade || "",
            registro_profissional: dados.registro_profissional || ""
        };
    }

    async function carregarPerfil() {
        try {
            setCarregando(true);
            setErro("");

            const resposta = await api.get("/usuarios/me");
            const dados = resposta.data;

            setPerfil(dados);
            setFormulario(montarFormulario(dados));
        } catch (error) {
            console.log("Erro ao carregar perfil:", error.response?.data);

            setErro(
                obterMensagemErro(error, "Não foi possível carregar seus dados.")
            );
        } finally {
            setCarregando(false);
        }
    }

    function iniciarEdicao() {
        setErro("");
        setMensagem("");
        setCodigo("");
        setDestino("");

        setFormulario(montarFormulario(perfil));

        setEtapa("edicao");
    }

    async function solicitarCodigo() {
        try {
            setEnviandoCodigo(true);
            setErro("");
            setMensagem("");

            const resposta = await api.post("/usuarios/me/codigo-email");

            setDestino(resposta.data.destino || "");
            setMensagem(resposta.data.mensagem || "Código enviado para seu e-mail!");
        } catch (error) {
            console.log("Erro ao enviar código:", error.response?.data);

            setErro(
                obterMensagemErro(error, "Não foi possível enviar o código. Tente novamente.")
            );
        } finally {
            setEnviandoCodigo(false);
        }
    }

    function atualizarCampo(event) {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value
        }));
    }

    async function salvarPerfil(event) {
        event.preventDefault();

        if (codigo.length !== 6) {
            setErro("Digite o código de verificação de 6 dígitos.");
            return;
        }

        try {
            setCarregando(true);
            setErro("");
            setMensagem("");

            // Envia só o que realmente mudou
            const dadosAtualizados = {};

            Object.entries(formulario).forEach(([campo, valor]) => {
                const valorOriginal = campo === "data_nascimento"
                    ? perfil[campo]?.split("T")[0] || ""
                    : perfil[campo] || "";

                if (valor !== valorOriginal) {
                    dadosAtualizados[campo] = valor;
                }
            });

            if (Object.keys(dadosAtualizados).length === 0) {
                setErro("Você não alterou nenhum dado do perfil.");
                return;
            }

            const resposta = await api.patch("/profissionais/me", {
                verificacao: {
                    codigo: codigo
                },
                ...dadosAtualizados
            });

            // Mantém o que já tínhamos e sobrescreve com a resposta da API
            const novoPerfil = { ...perfil, ...resposta.data };

            setPerfil(novoPerfil);
            setFormulario(montarFormulario(novoPerfil));

            setCodigo("");
            setEtapa("perfil");

            setMensagem(
                resposta.data.mensagem || "Perfil atualizado com sucesso!"
            );

        } catch (error) {
            console.log("Erro ao atualizar perfil:", error.response?.data);

            setErro(
                obterMensagemErro(
                    error,
                    "Não foi possível atualizar seus dados."
                )
            );
        } finally {
            setCarregando(false);
        }
    }

    function formatarData(data) {
        if (!data) return "Não informado";

        const [ano, mes, dia] = data.split("T")[0].split("-");

        return `${dia}/${mes}/${ano}`;
    }

    if (carregando && !perfil) {
        return (
            <div className="perfil-layout">
                <ClientSidebar
                    name="Profissional"
                    plan="Profissional"
                    menu={menuProfissional}
                />

                <main className="perfil-main">
                    <p>Carregando perfil...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="perfil-layout">
            <ClientSidebar
                name={perfil?.nome || "Profissional"}
                plan="Profissional"
                menu={menuProfissional}
            />

            <main className="perfil-main">

                <header className="perfil-header">
                    <div>
                        <span className="perfil-subtitulo">CONTA DO PROFISSIONAL</span>
                        <h1>Meu Perfil</h1>
                        <p>Consulte e atualize suas informações pessoais.</p>
                    </div>
                </header>

                {erro && (
                    <div className="perfil-alerta erro">
                        {erro}
                    </div>
                )}

                {mensagem && (
                    <div className="perfil-alerta sucesso">
                        {mensagem}
                    </div>
                )}

                {etapa === "perfil" && perfil && (
                    <section className="perfil-card">

                        <div className="perfil-card-topo">
                            <div className="perfil-avatar">
                                <UserRound size={34} />
                            </div>

                            <div>
                                <h2>{perfil.nome}</h2>
                                <span>{perfil.tipo_perfil || "Profissional"}</span>
                            </div>
                        </div>

                        <div className="perfil-informacoes">

                            <div className="perfil-campo">
                                <span><UserRound size={17} /> Nome completo</span>
                                <strong>{perfil.nome || "Não informado"}</strong>
                            </div>

                            <div className="perfil-campo">
                                <span><Mail size={17} /> E-mail</span>
                                <strong>{perfil.email || "Não informado"}</strong>
                            </div>

                            <div className="perfil-campo">
                                <span><Phone size={17} /> Telefone</span>
                                <strong>{perfil.telefone || "Não informado"}</strong>
                            </div>

                            <div className="perfil-campo">
                                <span><CalendarDays size={17} /> Data de nascimento</span>
                                <strong>{formatarData(perfil.data_nascimento)}</strong>
                            </div>

                            <div className="perfil-campo">
                                <span><ShieldCheck size={17} /> CPF</span>
                                <strong>{perfil.cpf || "Não informado"}</strong>
                            </div>

                            <div className="perfil-campo">
                                <span><ShieldCheck size={17} /> Status</span>
                                <strong>{perfil.status || "Não informado"}</strong>
                            </div>

                            <div className="perfil-campo">
                                <span>Especialidade</span>
                                <strong>{perfil.especialidade || "Não informado"}</strong>
                            </div>

                            <div className="perfil-campo">
                                <span>Registro profissional</span>
                                <strong>{perfil.registro_profissional || "Não informado"}</strong>
                            </div>

                        </div>

                        <button
                            className="perfil-botao"
                            onClick={iniciarEdicao}
                        >
                            <Pencil size={18} />
                            Atualizar Perfil
                        </button>

                    </section>
                )}

                {etapa === "edicao" && (
                    <section className="perfil-card">

                        <div className="perfil-edicao-topo">
                            <div>
                                <span className="perfil-subtitulo">DADOS PESSOAIS</span>
                                <h2>Editar perfil</h2>
                            </div>

                            <ShieldCheck size={25} />
                        </div>

                        <form
                            className="perfil-formulario"
                            onSubmit={salvarPerfil}
                        >

                            <div className="perfil-input-grupo">
                                <label htmlFor="nome">Nome completo</label>
                                <input
                                    id="nome"
                                    name="nome"
                                    value={formulario.nome}
                                    onChange={atualizarCampo}
                                />
                            </div>

                            <div className="perfil-input-grupo">
                                <label htmlFor="email">E-mail</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formulario.email}
                                    onChange={atualizarCampo}
                                />
                            </div>

                            <div className="perfil-input-grupo">
                                <label htmlFor="telefone">Telefone</label>
                                <input
                                    id="telefone"
                                    name="telefone"
                                    value={formulario.telefone}
                                    onChange={atualizarCampo}
                                />
                            </div>

                            <div className="perfil-input-grupo">
                                <label htmlFor="data_nascimento">Data de nascimento</label>
                                <input
                                    id="data_nascimento"
                                    name="data_nascimento"
                                    type="date"
                                    value={formulario.data_nascimento}
                                    onChange={atualizarCampo}
                                />
                            </div>

                            <div className="perfil-input-grupo">
                                <label htmlFor="especialidade">Especialidade</label>
                                <input
                                    id="especialidade"
                                    name="especialidade"
                                    value={formulario.especialidade}
                                    onChange={atualizarCampo}
                                />
                            </div>

                            <div className="perfil-input-grupo">
                                <label htmlFor="registro_profissional">Registro profissional</label>
                                <input
                                    id="registro_profissional"
                                    name="registro_profissional"
                                    value={formulario.registro_profissional}
                                    onChange={atualizarCampo}
                                />
                            </div>

                            <div className="perfil-input-grupo perfil-codigo-grupo">
                                <label htmlFor="codigo">Código de verificação</label>

                                <div className="perfil-codigo-container">
                                    <input
                                        id="codigo"
                                        name="codigo"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="Digite os 6 dígitos"
                                        value={codigo}
                                        onChange={(event) =>
                                            setCodigo(
                                                event.target.value.replace(/\D/g, "")
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="perfil-enviar-codigo"
                                        onClick={solicitarCodigo}
                                        disabled={enviandoCodigo}
                                    >
                                        {enviandoCodigo
                                            ? "Enviando..."
                                            : "Enviar código"}
                                    </button>
                                </div>

                                {destino && (
                                    <small>
                                        Código enviado para {destino}
                                    </small>
                                )}
                            </div>

                            <div className="perfil-acoes">

                                <button
                                    type="button"
                                    className="perfil-voltar"
                                    onClick={() => {
                                        setEtapa("perfil");
                                        setCodigo("");
                                        setErro("");
                                        setMensagem("");
                                    }}
                                >
                                    <ArrowLeft size={16} />
                                    Cancelar
                                </button>

                                <button
                                    className="perfil-botao"
                                    type="submit"
                                    disabled={carregando}
                                >
                                    {carregando ? (
                                        <>
                                            <LoaderCircle className="girando" size={18} />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Salvar alterações
                                        </>
                                    )}
                                </button>

                            </div>

                        </form>

                    </section>
                )}

            </main>
        </div>
    );
}

export default PerfilProfissional;