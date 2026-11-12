
import "../forgot-password/forgot-password.css";
import gymBackground from "../../assets/images/gym_bacground.png";
import raioIcon from "../../assets/images/raio-icon.png";

import {
    Mail,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    KeyRound,
    Eye,
    EyeOff
} from "lucide-react";

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// =========================
// CONFIGURAÇÕES
// =========================

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

const PERFIS = ["aluno", "profissional", "academia"];

function ForgotPassword() {
    const navigate = useNavigate();

    // =========================
    // ESTADOS
    // =========================

    // 1 = e-mail | 2 = código e nova senha | 3 = sucesso
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(false);

    const inputsRef = useRef([]);

    // =========================
    // CONTAGEM PARA REENVIAR
    // =========================

    useEffect(() => {
        if (step !== 2 || countdown <= 0) {
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((current) => current - 1);
        }, 1000);

        return () => clearTimeout(timer);

    }, [step, countdown]);

    // =========================
    // ENVIAR CÓDIGO
    // =========================

    const sendCode = async () => {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            // Solicita o envio para os três perfis.
            // A API mantém a resposta genérica por segurança.
            await Promise.all(
                PERFIS.map((perfil) =>
                    axios.post(
                        `http://127.0.0.1:8000/auth/${perfil}/esqueci-senha`,
                        {
                            email: email.trim()
                        }
                    )
                )
            );

            setCode(Array(CODE_LENGTH).fill(""));
            setNewPassword("");
            setConfirmPassword("");

            setCountdown(RESEND_SECONDS);
            setStep(2);

            setMessage(
                "Se o e-mail estiver cadastrado, enviamos um código de verificação."
            );

            setTimeout(() => {
                inputsRef.current[0]?.focus();
            }, 100);

        } catch (error) {
            console.error("Erro ao solicitar recuperação:", error);

            if (!error.response) {
                setError(
                    "Não foi possível conectar ao servidor. Tente novamente."
                );
            } else {
                setError(
                    "Não foi possível solicitar o código. Tente novamente."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    const handleSendCode = (event) => {
        event.preventDefault();

        sendCode();
    };

    // =========================
    // CAMPOS DO CÓDIGO
    // =========================

    const handleCodeChange = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);

        const newCode = [...code];
        newCode[index] = digit;

        setCode(newCode);
        setError("");

        if (digit && index < CODE_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleCodeKeyDown = (index, event) => {
        if (
            event.key === "Backspace" &&
            !code[index] &&
            index > 0
        ) {
            inputsRef.current[index - 1]?.focus();
        }

        if (event.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }

        if (
            event.key === "ArrowRight" &&
            index < CODE_LENGTH - 1
        ) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleCodePaste = (event) => {
        event.preventDefault();

        const pasted = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, CODE_LENGTH);

        if (!pasted) {
            return;
        }

        const newCode = Array(CODE_LENGTH).fill("");

        pasted.split("").forEach((digit, index) => {
            newCode[index] = digit;
        });

        setCode(newCode);
        setError("");

        inputsRef.current[
            Math.min(pasted.length, CODE_LENGTH - 1)
        ]?.focus();
    };

    // =========================
    // REDEFINIR SENHA
    // =========================

    const handleResetPassword = async (event) => {
        event.preventDefault();

        const fullCode = code.join("");

        if (fullCode.length !== CODE_LENGTH) {
            setError("Digite os 6 dígitos do código.");
            return;
        }

        if (!newPassword || !confirmPassword) {
            setError("Preencha os dois campos de senha.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            let senhaRedefinida = false;
            let ultimoErro = null;

            // Tenta redefinir a senha em cada perfil.
            for (const perfil of PERFIS) {
                try {
                    const response = await axios.post(
                        `http://127.0.0.1:8000/auth/${perfil}/redefinir-senha`,
                        {
                            email: email.trim(),
                            nova_senha: newPassword,
                            verificacao: {
                                codigo: fullCode
                            }
                        }
                    );

                    if (response.status >= 200 && response.status < 300) {
                        senhaRedefinida = true;
                        break;
                    }

                } catch (error) {
                    ultimoErro = error;

                    const status = error.response?.status;

                    // Se não for um erro de autenticação,
                    // validação do código ou perfil inexistente,
                    // interrompe o processo.
                    if (
                        status !== 400 &&
                        status !== 401 &&
                        status !== 403 &&
                        status !== 404
                    ) {
                        throw error;
                    }
                }
            }

            if (!senhaRedefinida) {
                const detalhe =
                    ultimoErro?.response?.data?.detail ||
                    ultimoErro?.response?.data?.message ||
                    ultimoErro?.response?.data?.mensagem;

                setError(
                    typeof detalhe === "string"
                        ? detalhe
                        : "Código inválido ou expirado. Confira o código e tente novamente."
                );

                return;
            }

            setMessage("Sua senha foi redefinida com sucesso!");
            setStep(3);

        } catch (error) {
            console.error("Erro ao redefinir senha:", error);

            if (!error.response) {
                setError(
                    "Não foi possível conectar ao servidor. Tente novamente."
                );
            } else {
                setError(
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    error.response?.data?.mensagem ||
                    "Não foi possível redefinir sua senha."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // REENVIAR CÓDIGO
    // =========================

    const handleResend = () => {
        if (countdown > 0 || loading) {
            return;
        }

        sendCode();
    };

    // =========================
    // ALTERAR E-MAIL
    // =========================

    const handleChangeEmail = () => {
        setStep(1);
        setError("");
        setMessage("");
        setCountdown(0);
        setCode(Array(CODE_LENGTH).fill(""));
        setNewPassword("");
        setConfirmPassword("");
    };

    // =========================
    // VOLTAR AO LOGIN
    // =========================

    const handleBackToLogin = () => {
        navigate("/login", { replace: true });
    };

    return (
        <main className="forgot-page">

            {/* LADO ESQUERDO */}

            <section
                className="forgot-left"
                style={{
                    backgroundImage: `url(${gymBackground})`
                }}
            >

                <div className="forgot-overlay"></div>

                <div className="forgot-left-content">

                    {/* LOGO */}

                    <div className="forgot-logo">

                        <div className="forgot-logo-icon">
                            <img src={raioIcon} alt="GymTech" />
                        </div>

                        <span>
                            GYM TECH
                        </span>

                    </div>

                    {/* TEXTO */}

                    <div className="forgot-description">

                        <h1>
                            RECOVER

                            <span>
                                YOUR ACCESS
                            </span>
                        </h1>

                        <p>
                            Sem problemas. Enviaremos um código de
                            verificação para o seu e-mail e você volta
                            ao treino em instantes.
                        </p>

                    </div>

                    {/* SEGURANÇA */}

                    <div className="forgot-security">

                        <ShieldCheck size={12} />

                        <span>
                            ENTERPRISE GRADE SECURITY
                        </span>

                    </div>

                </div>

            </section>

            {/* LADO DIREITO */}

            <section className="forgot-right">

                <div className="forgot-form-container">

                    <div className="forgot-icon">

                        {step === 1 ? (
                            <KeyRound size={18} />
                        ) : (
                            <Mail size={18} />
                        )}

                    </div>

                    {/* ETAPA 1 - E-MAIL */}

                    {step === 1 && (

                        <>

                            <h2>
                                ESQUECEU A SENHA?
                            </h2>

                            <p className="forgot-subtitle">
                                Informe seu e-mail e enviaremos um código
                                de 6 dígitos para redefinir o acesso.
                            </p>

                            <form onSubmit={handleSendCode}>

                                <div className="forgot-group">

                                    <label htmlFor="forgot-email">
                                        E-MAIL
                                    </label>

                                    <div className="forgot-input">

                                        <Mail size={14} />

                                        <input
                                            id="forgot-email"
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

                                {error && (
                                    <p className="forgot-error">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="forgot-button"
                                    disabled={loading}
                                >

                                    <span>
                                        {loading
                                            ? "ENVIANDO..."
                                            : "ENVIAR CÓDIGO"}
                                    </span>

                                    <ArrowRight size={15} />

                                </button>

                            </form>

                        </>

                    )}

                    {/* ETAPA 2 - CÓDIGO E NOVA SENHA */}

                    {step === 2 && (

                        <>

                            <h2>
                                VERIFIQUE SEU E-MAIL
                            </h2>

                            <p className="forgot-subtitle">
                                Se o e-mail estiver cadastrado, você receberá
                                um código de verificação em:

                                <strong>
                                    {email}
                                </strong>
                            </p>

                            <form onSubmit={handleResetPassword}>

                                {/* CÓDIGO */}

                                <div className="forgot-group">

                                    <label>
                                        CÓDIGO DE VERIFICAÇÃO
                                    </label>

                                    <div
                                        className="forgot-code"
                                        onPaste={handleCodePaste}
                                    >

                                        {code.map((digit, index) => (

                                            <input
                                                key={index}
                                                ref={(element) =>
                                                    (inputsRef.current[index] = element)
                                                }
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                                maxLength={1}
                                                value={digit}
                                                autoFocus={index === 0}
                                                aria-label={`Dígito ${index + 1}`}
                                                className={
                                                    digit
                                                        ? "forgot-code-input filled"
                                                        : "forgot-code-input"
                                                }
                                                onChange={(event) =>
                                                    handleCodeChange(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                                onKeyDown={(event) =>
                                                    handleCodeKeyDown(index, event)
                                                }
                                            />

                                        ))}

                                    </div>

                                </div>

                                {/* NOVA SENHA */}

                                <div className="forgot-group">

                                    <label htmlFor="new-password">
                                        NOVA SENHA
                                    </label>

                                    <div className="forgot-input">

                                        <KeyRound size={14} />

                                        <input
                                            id="new-password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={newPassword}
                                            onChange={(event) =>
                                                setNewPassword(event.target.value)
                                            }
                                            placeholder="Digite sua nova senha"
                                            required
                                        />

                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={14} />
                                            ) : (
                                                <Eye size={14} />
                                            )}
                                        </button>

                                    </div>

                                </div>

                                {/* CONFIRMAR SENHA */}

                                <div className="forgot-group">

                                    <label htmlFor="confirm-password">
                                        CONFIRMAR NOVA SENHA
                                    </label>

                                    <div className="forgot-input">

                                        <KeyRound size={14} />

                                        <input
                                            id="confirm-password"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmPassword}
                                            onChange={(event) =>
                                                setConfirmPassword(event.target.value)
                                            }
                                            placeholder="Confirme sua nova senha"
                                            required
                                        />

                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Ocultar senha"
                                                    : "Mostrar senha"
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={14} />
                                            ) : (
                                                <Eye size={14} />
                                            )}
                                        </button>

                                    </div>

                                </div>

                                {error && (
                                    <p className="forgot-error">
                                        {error}
                                    </p>
                                )}

                                {/* REDEFINIR */}

                                <button
                                    type="submit"
                                    className="forgot-button"
                                    disabled={loading}
                                >

                                    <span>
                                        {loading
                                            ? "REDEFININDO..."
                                            : "REDEFINIR SENHA"}
                                    </span>

                                    <ArrowRight size={15} />

                                </button>

                                {/* REENVIAR */}

                                <p className="forgot-resend">

                                    Não recebeu o código?

                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={countdown > 0 || loading}
                                    >
                                        {countdown > 0
                                            ? `Reenviar em ${countdown}s`
                                            : "Reenviar código"}
                                    </button>

                                </p>

                                <button
                                    type="button"
                                    className="forgot-change-email"
                                    onClick={handleChangeEmail}
                                >
                                    Alterar e-mail
                                </button>

                            </form>

                        </>

                    )}

                    {/* ETAPA 3 - SUCESSO */}

                    {step === 3 && (

                        <>

                            <h2>
                                SENHA ALTERADA!
                            </h2>

                            <p className="forgot-subtitle">
                                Sua senha foi redefinida com sucesso.
                                Agora você já pode acessar sua conta
                                utilizando a nova senha.
                            </p>

                            <button
                                type="button"
                                className="forgot-button"
                                onClick={handleBackToLogin}
                            >

                                <span>
                                    VOLTAR PARA LOGIN
                                </span>

                                <ArrowRight size={15} />

                            </button>

                        </>

                    )}

                    {/* VOLTAR PARA LOGIN */}

                    {step !== 3 && (

                        <p className="forgot-back">

                            <Link to="/login">

                                <ArrowLeft size={12} />

                                Voltar para Login

                            </Link>

                        </p>

                    )}

                    {/* RODAPÉ */}

                    <div className="forgot-footer">

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

export default ForgotPassword;
