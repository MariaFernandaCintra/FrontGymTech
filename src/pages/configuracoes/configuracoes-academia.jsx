import { useEffect, useState } from "react";
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    KeyRound,
    ArrowLeft,
    Save,
    LoaderCircle
} from "lucide-react";

import api from "../../services/api";
import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuAcademia } from "../../componets/client-sidebar/menus";
import { mensagemErro } from "../../utils/erro";

// Reaproveita o mesmo visual do perfil
import "../dashboard/perfil-aluno.css";


// 12345678000199 -> 12.345.678/0001-99
function formatarCnpj(valor) {

    const digitos = String(valor || "").replace(/\D/g, "");

    if (digitos.length !== 14) return valor || "Não informado";

    return digitos.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
    );
}

// 16999998888 -> (16) 99999-8888
function formatarTelefone(valor) {

    const digitos = String(valor || "").replace(/\D/g, "");

    if (digitos.length === 11) {
        return digitos.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }

    if (digitos.length === 10) {
        return digitos.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    return valor || "Não informado";
}

// adm@gymtech.com -> a**@gymtech.com
function mascararEmail(email) {

    if (!email || !email.includes("@")) return "";

    const [usuario, dominio] = email.split("@");

    return `${usuario.slice(0, 1)}${"*".repeat(Math.max(usuario.length - 1, 2))}@${dominio}`;
}


function ConfiguracoesAcademia() {

    const [academia, setAcademia] = useState(null);
    const [carregando, setCarregando] = useState(true);

    const [alterandoSenha, setAlterandoSenha] = useState(false);
    const [codigoEnviado, setCodigoEnviado] = useState(false);

    const [codigo, setCodigo] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");

    const [enviandoCodigo, setEnviandoCodigo] = useState(false);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");


    useEffect(() => {

        async function carregar() {

            try {

                const resposta = await api.get("/academias/me");

                setAcademia(resposta.data);

            } catch (error) {

                console.error("Erro ao carregar a academia:", error.response?.data);

                setErro(mensagemErro(error, "Não foi possível carregar os dados da academia."));

            } finally {

                setCarregando(false);
            }
        }

        carregar();

    }, []);


    function limparFormularioSenha() {

        setAlterandoSenha(false);
        setCodigoEnviado(false);
        setCodigo("");
        setNovaSenha("");
        setConfirmacao("");
    }

    function iniciarTrocaDeSenha() {

        setErro("");
        setMensagem("");
        setAlterandoSenha(true);
    }

    async function enviarCodigo() {

        try {

            setEnviandoCodigo(true);
            setErro("");
            setMensagem("");

            await api.post("/auth/academia/esqueci-senha", {
                email: academia.email_corporativo
            });

            setCodigoEnviado(true);

            setMensagem(
                `Enviamos um código de 6 dígitos para ${mascararEmail(academia.email_corporativo)}. Ele vale 10 minutos.`
            );

        } catch (error) {

            console.error("Erro ao enviar código:", error.response?.data);

            setErro(mensagemErro(error, "Não foi possível enviar o código. Tente novamente."));

        } finally {

            setEnviandoCodigo(false);
        }
    }

    async function salvarNovaSenha(event) {

        event.preventDefault();

        setErro("");
        setMensagem("");

        if (!codigoEnviado) {
            setErro("Primeiro clique em \"Enviar código\" para receber o código por e-mail.");
            return;
        }

        if (codigo.length !== 6) {
            setErro("Digite o código de verificação de 6 dígitos.");
            return;
        }

        if (novaSenha.length < 8) {
            setErro("A nova senha precisa ter pelo menos 8 caracteres.");
            return;
        }

        // o bcrypt só considera os 72 primeiros bytes da senha
        if (new TextEncoder().encode(novaSenha).length > 72) {
            setErro("A nova senha pode ter no máximo 72 bytes.");
            return;
        }

        if (novaSenha !== confirmacao) {
            setErro("A confirmação da senha não confere.");
            return;
        }

        try {

            setSalvando(true);

            await api.post("/auth/academia/redefinir-senha", {
                email: academia.email_corporativo,
                nova_senha: novaSenha,
                verificacao: { codigo }
            });

            limparFormularioSenha();

            setMensagem("Senha alterada com sucesso! Use a nova senha no próximo login.");

        } catch (error) {

            console.error("Erro ao redefinir senha:", error.response?.data);

            setErro(mensagemErro(error, "Não foi possível alterar a senha."));

        } finally {

            setSalvando(false);
        }
    }


    if (carregando) {

        return (
            <div className="perfil-layout">

                <ClientSidebar
                    name="Academia"
                    plan="Academia"
                    menu={menuAcademia}
                />

                <main className="perfil-main">
                    <p>Carregando configurações...</p>
                </main>
            </div>
        );
    }

    return (

        <div className="perfil-layout">

            <ClientSidebar
                name={academia?.nome_academia || "Academia"}
                plan="Academia"
                menu={menuAcademia}
            />

            <main className="perfil-main">

                <header className="perfil-header">
                    <div>
                        <span className="perfil-subtitulo">CONTA DA ACADEMIA</span>
                        <h1>Configurações</h1>
                        <p>Consulte os dados da academia e gerencie a segurança da conta.</p>
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

                {academia && (

                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* DADOS DA ACADEMIA (somente leitura) */}
                        <section className="perfil-card">

                            <div className="perfil-card-topo">

                                <div className="perfil-avatar">
                                    <Building2 size={34} />
                                </div>

                                <div>
                                    <h2>{academia.nome_academia}</h2>
                                    <span>Academia</span>
                                </div>

                            </div>

                            <div className="perfil-informacoes">

                                <div className="perfil-campo">
                                    <span><Building2 size={17} /> Nome da academia</span>
                                    <strong>{academia.nome_academia || "Não informado"}</strong>
                                </div>

                                <div className="perfil-campo">
                                    <span><Mail size={17} /> E-mail corporativo</span>
                                    <strong>{academia.email_corporativo || "Não informado"}</strong>
                                </div>

                                <div className="perfil-campo">
                                    <span><ShieldCheck size={17} /> CNPJ</span>
                                    <strong>{formatarCnpj(academia.cnpj)}</strong>
                                </div>

                                <div className="perfil-campo">
                                    <span><Phone size={17} /> Telefone</span>
                                    <strong>{formatarTelefone(academia.telefone)}</strong>
                                </div>

                                <div className="perfil-campo">
                                    <span><MapPin size={17} /> Endereço</span>
                                    <strong>{academia.endereco || "Não informado"}</strong>
                                </div>

                            </div>

                            <p style={{ margin: 0, color: "#888", fontSize: "12px" }}>
                                Estes dados são somente para consulta. Para alterá-los, entre em
                                contato com o suporte do GymTech.
                            </p>

                        </section>


                        {/* SEGURANÇA */}
                        <section className="perfil-card">

                            <div className="perfil-edicao-topo">
                                <div>
                                    <span className="perfil-subtitulo">SEGURANÇA</span>
                                    <h2>Senha de acesso</h2>
                                </div>

                                <KeyRound size={25} />
                            </div>

                            {!alterandoSenha && (

                                <>
                                    <p style={{ color: "#888", fontSize: "13px", margin: "0 0 20px" }}>
                                        Para trocar a senha, enviamos um código de verificação
                                        para o e-mail corporativo da academia.
                                    </p>

                                    <button
                                        className="perfil-botao"
                                        type="button"
                                        onClick={iniciarTrocaDeSenha}
                                    >
                                        <KeyRound size={18} />
                                        Alterar senha
                                    </button>
                                </>
                            )}

                            {alterandoSenha && (

                                <form
                                    className="perfil-formulario"
                                    onSubmit={salvarNovaSenha}
                                >

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
                                                    setCodigo(event.target.value.replace(/\D/g, ""))
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="perfil-enviar-codigo"
                                                onClick={enviarCodigo}
                                                disabled={enviandoCodigo}
                                            >
                                                {enviandoCodigo
                                                    ? "Enviando..."
                                                    : codigoEnviado
                                                        ? "Reenviar código"
                                                        : "Enviar código"}
                                            </button>

                                        </div>
                                    </div>

                                    <div className="perfil-input-grupo">
                                        <label htmlFor="novaSenha">Nova senha</label>
                                        <input
                                            id="novaSenha"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Mínimo de 8 caracteres"
                                            value={novaSenha}
                                            onChange={(event) => setNovaSenha(event.target.value)}
                                        />
                                    </div>

                                    <div className="perfil-input-grupo">
                                        <label htmlFor="confirmacao">Confirmar nova senha</label>
                                        <input
                                            id="confirmacao"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Repita a nova senha"
                                            value={confirmacao}
                                            onChange={(event) => setConfirmacao(event.target.value)}
                                        />
                                    </div>

                                    <div className="perfil-acoes">

                                        <button
                                            type="button"
                                            className="perfil-voltar"
                                            onClick={() => {
                                                limparFormularioSenha();
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
                                            disabled={salvando}
                                        >
                                            {salvando ? (
                                                <>
                                                    <LoaderCircle className="girando" size={18} />
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} />
                                                    Salvar nova senha
                                                </>
                                            )}
                                        </button>

                                    </div>

                                </form>
                            )}

                        </section>

                    </div>
                )}

            </main>

        </div>
    );
}

export default ConfiguracoesAcademia;