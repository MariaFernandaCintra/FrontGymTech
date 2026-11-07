
import "../login/login.css";
import gymBackground from "../../assets/images/gym_bacground.png";
import raioIcon from "../../assets/images/raio-icon.png";

import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { saveUser } from "../../services/auth";

// Endpoints de login da API
const LOGIN_ENDPOINTS = [
    {
        url: "http://127.0.0.1:8000/auth/aluno/login",
        perfil: "aluno",
        tipo: "Aluno"
    },
    {
        url: "http://127.0.0.1:8000/auth/profissional/login",
        perfil: "profissional",
        tipo: "Profissional"
    },
    {
        url: "http://127.0.0.1:8000/auth/academia/login",
        perfil: "academia",
        tipo: "academia"
    }
];

// Decodifica o payload do JWT
function decodificarToken(token) {
    const payload = token.split(".")[1];

    const base64 = payload
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const decoded = atob(base64);

    const bytes = Uint8Array.from(
        decoded,
        (char) => char.charCodeAt(0)
    );

    return JSON.parse(
        new TextDecoder().decode(bytes)
    );
}

function Login() {
    const navigate = useNavigate();

    // ESTADOS
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);

    // LOGIN
    const handleLogin = async (event) => {
        event.preventDefault();

        setMensagem("");
        setTipoMensagem("");

        if (!email || !password) {
            setMensagem("Preencha o e-mail e a senha.");
            setTipoMensagem("erro");
            return;
        }

        try {
            setCarregando(true);

            let loginRealizado = false;
            let ultimoErro = null;

            // Tenta identificar em qual perfil o usuário está cadastrado
            for (const endpoint of LOGIN_ENDPOINTS) {
                try {
                    const response = await axios.post(
                        endpoint.url,
                        {
                            email: email,
                            senha: password
                        }
                    );

                    const token = response.data?.access_token;

                    if (!token) {
                        throw new Error(
                            "A API não retornou o token de acesso."
                        );
                    }

                    const dadosToken = decodificarToken(token);

                    const tipoUsuario = String(
                        dadosToken.tipo || endpoint.tipo
                    ).toLowerCase();

                    let perfil;

                    if (tipoUsuario === "aluno") {
                        perfil = "aluno";
                    } else if (tipoUsuario === "profissional") {
                        perfil = "profissional";
                    } else if (tipoUsuario === "academia") {
                        perfil = "academia";
                    } else {
                        throw new Error(
                            "Tipo de usuário não reconhecido."
                        );
                    }

                    // Salva os dados da sessão
                    saveUser({
                        token: token,
                        id: dadosToken.sub,
                        email: dadosToken.email || email,
                        nome: dadosToken.nome || "",
                        perfil: perfil
                    });

                    setMensagem(
                        response.data?.mensagem ||
                        "Login realizado com sucesso!"
                    );

                    setTipoMensagem("sucesso");

                    loginRealizado = true;

                    // Redireciona conforme o perfil
                    const rotas = {
                        aluno: "/dashboard-aluno",
                        profissional: "/dashboard-profissional",
                        academia: "/dashboard-academia"
                    };

                    navigate(rotas[perfil], { replace: true });

                    break;

                } catch (error) {
                    ultimoErro = error;

                    const status = error.response?.status;

                    // Continua tentando somente quando a API
                    // indica falha de autenticação ou rota inexistente
                    if (
                        status === 401 ||
                        status === 403 ||
                        status === 404
                    ) {
                        continue;
                    }

                    // Erros de conexão ou erros internos não devem
                    // ser tratados como se fossem outro perfil
                    throw error;
                }
            }

            if (!loginRealizado) {
                const detalheErro =
                    ultimoErro?.response?.data?.detail ||
                    ultimoErro?.response?.data?.message ||
                    ultimoErro?.response?.data?.mensagem;

                setMensagem(
                    typeof detalheErro === "string"
                        ? detalheErro
                        : "E-mail ou senha incorretos."
                );

                setTipoMensagem("erro");
            }

        } catch (error) {
            console.error("Erro no login:", error);

            if (!error.response) {
                setMensagem(
                    "Não foi possível conectar ao servidor. Verifique se a API está funcionando."
                );
            } else if (error.message) {
                setMensagem(error.message);
            } else {
                setMensagem(
                    "Não foi possível realizar o login."
                );
            }

            setTipoMensagem("erro");

        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="login-page">

            {/* LADO ESQUERDO */}
            <section
                className="login-left"
                style={{
                    backgroundImage: `url(${gymBackground})`
                }}
            >

                <div className="login-overlay"></div>

                <div className="login-left-content">

                    {/* LOGO */}
                    <div className="login-logo">

                        <div className="logo-icon">
                            <img src={raioIcon} alt="GymTech" />
                        </div>

                        <span>
                            GYMTECH
                        </span>

                    </div>

                    {/* TEXTO */}
                    <div className="login-description">

                        <h1>
                            EVOLVE

                            <span>
                                YOUR LIMITS
                            </span>
                        </h1>

                        <p>
                            Acesse a plataforma de gestão fitness mais
                            avançada do mercado. Tecnologia de ponta para
                            resultados extraordinários.
                        </p>

                    </div>

                    {/* ESTATÍSTICAS */}
                    <div className="login-statistics">

                        <div className="stat">

                            <strong>
                                50k+
                            </strong>

                            <span>
                                ATLETAS ATIVOS
                            </span>

                        </div>

                        <div className="stat">

                            <strong>
                                99.9%
                            </strong>

                            <span>
                                UPTIME SYSTEM
                            </span>

                        </div>

                    </div>

                </div>

            </section>

            {/* LADO DIREITO */}
            <section className="login-right">

                <div className="login-form-container">

                    <h2>
                        BEM-VINDO
                    </h2>

                    <p className="subtitle">
                        Insira suas credenciais para continuar sua jornada.
                    </p>

                    <form onSubmit={handleLogin}>

                        {/* E-MAIL */}
                        <div className="form-group">

                            <label htmlFor="email">
                                E-MAIL
                            </label>

                            <div className="input-container">

                                <Mail size={14} />

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="Digite seu e-mail"
                                    required
                                />

                            </div>

                        </div>

                        {/* SENHA */}
                        <div className="form-group">

                            <div className="password-label">

                                <label htmlFor="password">
                                    SENHA
                                </label>

                                <Link to="/esqueceu-senha">
                                    Esqueceu a senha?
                                </Link>

                            </div>

                            <div className="input-container">

                                <Lock size={14} />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Digite sua senha"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >

                                    {showPassword ? (
                                        <EyeOff size={14} />
                                    ) : (
                                        <Eye size={14} />
                                    )}

                                </button>

                            </div>

                        </div>

                        {/* LEMBRAR DE MIM */}
                        <div className="remember">

                            <label>

                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(event) =>
                                        setRememberMe(event.target.checked)
                                    }
                                />

                                <span>
                                    Lembrar de mim
                                </span>

                            </label>

                        </div>

                        {/* BOTÃO */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={carregando}
                        >

                            <span>
                                {carregando ? "ENTRANDO..." : "ENTRAR"}
                            </span>

                            <ArrowRight size={15} />

                        </button>

                        {/* MENSAGEM DA API */}
                        {mensagem && (

                            <p
                                role="status"
                                style={{
                                    color: tipoMensagem === "sucesso"
                                        ? "green"
                                        : "red",
                                    marginTop: "12px",
                                    textAlign: "center"
                                }}
                            >
                                {mensagem}
                            </p>

                        )}

                        {/* CRIAR CONTA */}
                        <p className="register">

                            Novo por aqui?

                            <Link to="/cadastro">
                                Criar conta
                            </Link>

                        </p>

                    </form>

                    {/* RODAPÉ */}
                    <div className="login-footer">

                        <span>
                            © 2026 GYM TECH SYSTEMS
                        </span>

                        <div>

                            <a href="#">
                                TERMOS
                            </a>

                            <a href="#">
                                PRIVACIDADE
                            </a>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Login;
