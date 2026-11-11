import "../register/register.css";
import gymBackground from "../../assets/images/gym_bacground.png";
import raioIcon from "../../assets/images/raio-icon.png";

import {
    User,
    Mail,
    Lock,
    CheckCheck,
    ArrowRight,
    ShieldCheck
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";

function Register() {
    const navigate = useNavigate();

    // ESTADOS
    const [nomeAcademia, setNomeAcademia] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // CADASTRO
    const handleRegister = async (event) => {
        event.preventDefault();

        setError("");

        if (password.length < 8) {
            setError("A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        const dadosAcademia = {
            nome_academia: nomeAcademia,
            cnpj: cnpj.replace(/\D/g, ""),
            email_corporativo: email,
            senha_adm: password,
        };

        try {
            setLoading(true);

            const resposta = await api.post(
                "/academias",
                dadosAcademia
            );

            alert(
                resposta.data.mensagem ||
                "Academia cadastrada com sucesso!"
            );

            navigate("/login");
        } catch (erro) {
            if (erro.response?.data?.detail) {
                const detalhe = erro.response.data.detail;

                setError(
                    typeof detalhe === "string"
                        ? detalhe
                        : JSON.stringify(detalhe)
                );
            } else {
                setError(
                    "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
                );
            }

            console.error("Erro no cadastro:", erro);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="register-page">

            {/* LADO ESQUERDO */}
            <section
                className="register-left"
                style={{
                    backgroundImage: `url(${gymBackground})`
                }}
            >
                <div className="register-overlay"></div>

                <div className="register-left-content">

                    {/* LOGO */}
                    <div className="register-logo">
                        <div className="register-logo-icon">
                            <img src={raioIcon} alt="GymTech" />
                        </div>

                        <span>
                            GYM TECH
                        </span>
                    </div>

                    {/* TEXTO */}
                    <div className="register-description">
                        <h1>
                            JOIN THE

                            <span>
                                ELITE FORCE
                            </span>
                        </h1>

                        <p>
                            Crie sua conta agora e tenha acesso às
                            ferramentas de alta performance que estão
                            moldando o futuro do fitness profissional.
                        </p>
                    </div>

                    {/* SEGURANÇA */}
                    <div className="register-security">
                        <ShieldCheck size={12} />

                        <span>
                            ENTERPRISE GRADE SECURITY
                        </span>
                    </div>

                </div>
            </section>

            {/* LADO DIREITO */}
            <section className="register-right">
                <div className="register-form-container">

                    <h2>
                        NOVO CADASTRO
                    </h2>

                    <p className="register-subtitle">
                        Preencha os dados para criar seu perfil profissional.
                    </p>

                    <form onSubmit={handleRegister}>

                        {/* NOME DA ACADEMIA */}
                        <div className="register-group">
                            <label htmlFor="nome-academia">
                                NOME DA ACADEMIA
                            </label>

                            <div className="register-input">
                                <User size={14} />

                                <input
                                    id="nome-academia"
                                    type="text"
                                    value={nomeAcademia}
                                    onChange={(event) =>
                                        setNomeAcademia(event.target.value)
                                    }
                                    placeholder="Nome da sua academia"
                                    required
                                />
                            </div>
                        </div>

                        {/* CNPJ */}
                        <div className="register-group">
                            <label htmlFor="cnpj">
                                CNPJ
                            </label>

                            <div className="register-input">
                                <User size={14} />

                                <input
                                    id="cnpj"
                                    type="text"
                                    value={cnpj}
                                    onChange={(event) =>
                                        setCnpj(event.target.value)
                                    }
                                    placeholder="00.000.000/0000-00"
                                    maxLength={18}
                                    required
                                />
                            </div>
                        </div>

                        {/* E-MAIL CORPORATIVO */}
                        <div className="register-group">
                            <label htmlFor="register-email">
                                E-MAIL CORPORATIVO
                            </label>

                            <div className="register-input">
                                <Mail size={14} />

                                <input
                                    id="register-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="contato@academia.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* SENHA / CONFIRMAR */}
                        <div className="register-row">

                            <div className="register-group">
                                <label htmlFor="register-password">
                                    SENHA
                                </label>

                                <div className="register-input">
                                    <Lock size={14} />

                                    <input
                                        id="register-password"
                                        type="password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="********"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="register-group">
                                <label htmlFor="confirm-password">
                                    CONFIRMAR
                                </label>

                                <div className="register-input">
                                    <CheckCheck size={14} />

                                    <input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) =>
                                            setConfirmPassword(event.target.value)
                                        }
                                        placeholder="********"
                                        required
                                    />
                                </div>
                            </div>

                        </div>

                        {/* ERRO */}
                        {error && (
                            <p className="register-error">
                                {error}
                            </p>
                        )}

                        {/* BOTÃO */}
                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            <span>
                                {loading
                                    ? "CADASTRANDO..."
                                    : "CADASTRAR ACADEMIA"}
                            </span>

                            <ArrowRight size={15} />
                        </button>

                        {/* VOLTAR PARA LOGIN */}
                        <p className="register-login">
                            Já possui uma conta?

                            <Link to="/login">
                                Voltar para Login
                            </Link>
                        </p>

                    </form>

                    {/* RODAPÉ */}
                    <div className="register-footer">
                        <span>
                            © 2026 GYM TECH SYSTEMS
                        </span>

                        <div>
                            <a href="#">
                                TERMOS
                            </a>

                            <a href="#">
                                AJUDA
                            </a>
                        </div>
                    </div>

                </div>
            </section>

        </main>
    );
}

export default Register;
