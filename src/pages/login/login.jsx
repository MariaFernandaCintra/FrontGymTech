import "../login/login.css";
import gymBackground from "../../assets/images/gym_bacground.png";
import raioIcon from "../../assets/images/raio-icon.png";

import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Check
} from "lucide-react";

import { useState } from "react";

function Login() {

    // =========================
    // ESTADOS
    // =========================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);


    // =========================
    // LOGIN
    // =========================

    const handleLogin = (event) => {

        event.preventDefault();

        console.log("E-mail:", email);
        console.log("Senha:", password);
        console.log("Lembrar de mim:", rememberMe);

    };


    return (

        <main className="login-page">

            {/* =================================
                LADO ESQUERDO
            ================================= */}

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


            {/* =================================
                LADO DIREITO
            ================================= */}

            <section className="login-right">

                <div className="login-form-container">

                    <h2>
                        BEM-VINDO
                    </h2>


                    <p className="subtitle">
                        Insira suas credenciais para continuar sua jornada.
                    </p>


                    <form onSubmit={handleLogin}>

                        {/* =================================
                            E-MAIL
                        ================================= */}

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
                                />

                            </div>

                        </div>


                        {/* =================================
                            SENHA
                        ================================= */}

                        <div className="form-group">

                            <div className="password-label">

                                <label htmlFor="password">
                                    SENHA
                                </label>


                                <a href="#">
                                    Esqueceu a senha?
                                </a>

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


                        {/* =================================
                            LEMBRAR DE MIM
                        ================================= */}

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


                        {/* =================================
                            BOTÃO
                        ================================= */}

                        <button
                            type="submit"
                            className="login-button"
                        >

                            <span>
                                ENTRAR
                            </span>

                            <ArrowRight size={15} />

                        </button>


                        {/* =================================
                            CRIAR CONTA
                        ================================= */}

                        <p className="register">

                            Novo por aqui?

                            <a href="#">
                                Criar conta
                            </a>

                        </p>

                    </form>


                    {/* =================================
                        RODAPÉ
                    ================================= */}

                    <div className="login-footer">

                        <span>
                            © 2024 GYM TECH SYSTEMS
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