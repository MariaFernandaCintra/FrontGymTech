import "../forgot-password/forgot-password.css";
import gymBackground from "../../assets/images/gym_bacground.png";
import raioIcon from "../../assets/images/raio-icon.png";

import {
    Mail,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    KeyRound
} from "lucide-react";

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

// =========================
// CONFIGURAÇÕES
// =========================

const CODE_LENGTH = 4;
const RESEND_SECONDS = 30;

function ForgotPassword() {

    // =========================
    // ESTADOS
    // =========================

    // 1 = informar e-mail | 2 = digitar código
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));

    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(0);

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

    const sendCode = () => {

        // Quando o back-end estiver pronto:
        // api.post("/auth/esqueci-senha", { email });

        console.log("Código solicitado para:", email);

        setCode(Array(CODE_LENGTH).fill(""));
        setCountdown(RESEND_SECONDS);
        setError("");
        setStep(2);

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
            inputsRef.current[index + 1].focus();
        }

    };


    const handleCodeKeyDown = (index, event) => {

        if (event.key === "Backspace" && !code[index] && index > 0) {
            inputsRef.current[index - 1].focus();
        }

        if (event.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1].focus();
        }

        if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
            inputsRef.current[index + 1].focus();
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

        pasted.split("").forEach((digit, i) => {
            newCode[i] = digit;
        });

        setCode(newCode);
        setError("");

        inputsRef.current[
            Math.min(pasted.length, CODE_LENGTH - 1)
        ].focus();

    };


    // =========================
    // VERIFICAR CÓDIGO
    // =========================

    const handleVerifyCode = (event) => {

        event.preventDefault();

        const fullCode = code.join("");

        if (fullCode.length < CODE_LENGTH) {
            setError("Digite os 4 dígitos do código.");
            return;
        }

        setError("");

        console.log("E-mail:", email);
        console.log("Código:", fullCode);

        // Quando o back-end estiver pronto:
        // api.post("/auth/verificar-codigo", { email, codigo: fullCode });

    };


    // =========================
    // REENVIAR / TROCAR E-MAIL
    // =========================

    const handleResend = () => {

        if (countdown > 0) {
            return;
        }

        sendCode();

        inputsRef.current[0]?.focus();

    };


    const handleChangeEmail = () => {

        setStep(1);
        setError("");
        setCountdown(0);

    };


    return (

        <main className="forgot-page">

            {/* =================================
                LADO ESQUERDO
            ================================= */}

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


            {/* =================================
                LADO DIREITO
            ================================= */}

            <section className="forgot-right">

                <div className="forgot-form-container">

                    <div className="forgot-icon">

                        {step === 1 ? (
                            <KeyRound size={18} />
                        ) : (
                            <Mail size={18} />
                        )}

                    </div>


                    {/* =================================
                        ETAPA 1 - E-MAIL
                    ================================= */}

                    {step === 1 && (

                        <>

                            <h2>
                                ESQUECEU A SENHA?
                            </h2>


                            <p className="forgot-subtitle">
                                Informe seu e-mail e enviaremos um código
                                de 4 dígitos para redefinir o acesso.
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


                                <button
                                    type="submit"
                                    className="forgot-button"
                                >

                                    <span>
                                        ENVIAR CÓDIGO
                                    </span>

                                    <ArrowRight size={15} />

                                </button>

                            </form>

                        </>

                    )}


                    {/* =================================
                        ETAPA 2 - CÓDIGO
                    ================================= */}

                    {step === 2 && (

                        <>

                            <h2>
                                VERIFIQUE SEU E-MAIL
                            </h2>


                            <p className="forgot-subtitle">
                                Enviamos um código de 4 dígitos para

                                <strong>
                                    {email}
                                </strong>
                            </p>


                            <form onSubmit={handleVerifyCode}>

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


                                {error && (

                                    <p className="forgot-error">
                                        {error}
                                    </p>

                                )}


                                <button
                                    type="submit"
                                    className="forgot-button"
                                >

                                    <span>
                                        VERIFICAR CÓDIGO
                                    </span>

                                    <ArrowRight size={15} />

                                </button>


                                {/* REENVIAR */}

                                <p className="forgot-resend">

                                    Não recebeu o código?

                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={countdown > 0}
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


                    {/* =================================
                        VOLTAR PARA LOGIN
                    ================================= */}

                    <p className="forgot-back">

                        <Link to="/login">

                            <ArrowLeft size={12} />

                            Voltar para Login

                        </Link>

                    </p>


                    {/* =================================
                        RODAPÉ
                    ================================= */}

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
