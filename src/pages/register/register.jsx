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

import { saveUser } from "../../services/auth";

// =========================
// TIPOS DE PERFIL
// =========================

const profiles = [
    { value: "cliente", label: "CLIENTE" },
    { value: "profissional", label: "PROFISSIONAL" }
];

function Register() {

    const navigate = useNavigate();

    // =========================
    // ESTADOS
    // =========================

    const [profile, setProfile] = useState("cliente");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");


    // =========================
    // CADASTRO
    // =========================

    const handleRegister = (event) => {

        event.preventDefault();

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setError("");

        console.log("Perfil:", profile);
        console.log("Nome:", name);
        console.log("E-mail:", email);
        console.log("Senha:", password);

        // Sessão provisória (só front-end). Trocar pelo retorno da API.
        saveUser({ nome: name, email, perfil: profile });

        // Somente o cliente tem dashboard por enquanto.
        navigate(profile === "cliente" ? "/dashboard" : "/login");

        // Quando o back-end estiver pronto:
        // api.post("/usuarios", { perfil: profile, nome: name, email, senha: password });

    };


    return (

        <main className="register-page">

            {/* =================================
                LADO ESQUERDO
            ================================= */}

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


            {/* =================================
                LADO DIREITO
            ================================= */}

            <section className="register-right">

                <div className="register-form-container">

                    <h2>
                        NOVO CADASTRO
                    </h2>


                    <p className="register-subtitle">
                        Preencha os dados para criar seu perfil profissional.
                    </p>


                    <form onSubmit={handleRegister}>

                        {/* =================================
                            TIPO DE PERFIL
                        ================================= */}

                        <div className="register-group">

                            <label>
                                TIPO DE PERFIL
                            </label>


                            <div className="profile-selector">

                                {profiles.map((item) => (

                                    <button
                                        key={item.value}
                                        type="button"
                                        className={
                                            profile === item.value
                                                ? "profile-option active"
                                                : "profile-option"
                                        }
                                        onClick={() =>
                                            setProfile(item.value)
                                        }
                                    >
                                        {item.label}
                                    </button>

                                ))}

                            </div>

                        </div>


                        {/* =================================
                            NOME COMPLETO
                        ================================= */}

                        <div className="register-group">

                            <label htmlFor="name">
                                NOME COMPLETO
                            </label>


                            <div className="register-input">

                                <User size={14} />


                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    placeholder="Seu nome"
                                    required
                                />

                            </div>

                        </div>


                        {/* =================================
                            E-MAIL
                        ================================= */}

                        <div className="register-group">

                            <label htmlFor="register-email">
                                E-MAIL
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
                                    placeholder="nome@exemplo.com"
                                    required
                                />

                            </div>

                        </div>


                        {/* =================================
                            SENHA / CONFIRMAR
                        ================================= */}

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


                        {/* =================================
                            ERRO
                        ================================= */}

                        {error && (

                            <p className="register-error">
                                {error}
                            </p>

                        )}


                        {/* =================================
                            BOTÃO
                        ================================= */}

                        <button
                            type="submit"
                            className="register-button"
                        >

                            <span>
                                CADASTRAR
                            </span>

                            <ArrowRight size={15} />

                        </button>


                        {/* =================================
                            VOLTAR PARA LOGIN
                        ================================= */}

                        <p className="register-login">

                            Já possui uma conta?

                            <Link to="/login">
                                Voltar para Login
                            </Link>

                        </p>

                    </form>


                    {/* =================================
                        RODAPÉ
                    ================================= */}

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
