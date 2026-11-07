import "../dashboard/dashboard.css";
import heroImage from "../../assets/images/gym_bacground.png";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { dashboardMock } from "./dashboardMock";

import {
    Flame,
    MapPin,
    ListChecks,
    Timer,
    Play,
    User,
    CalendarDays,
    Clock,
    Leaf,
    Bell
} from "lucide-react";

import { getUser } from "../../services/auth";

// =========================
// ANEL DE PROGRESSO
// =========================

const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function Dashboard() {

    // =========================
    // DADOS
    // =========================

    const user = getUser();

    const data = dashboardMock;

    const fullName = user?.nome || "Cliente";
    const firstName = fullName.split(" ")[0];

    const percent = Math.round(
        (data.progresso.concluidos / data.progresso.meta) * 100
    );


    return (

        <div className="dash-page">

            <ClientSidebar name={fullName} plan={data.plano} />


            <main className="dash-main">

                {/* =================================
                    CABEÇALHO
                ================================= */}

                <header className="dash-header">

                    <div>

                        <h1>
                            BOM TREINO, {firstName.toUpperCase()}!
                        </h1>

                        <p className="dash-quote">
                            "{data.frase.texto}" — {data.frase.autor}
                        </p>

                    </div>


                    <div className="dash-status">

                        <div>

                            <span>
                                ESTADO ATUAL
                            </span>

                            <strong>
                                {data.estado}
                            </strong>

                        </div>


                        <div className="dash-status-icon">
                            <Flame size={18} />
                        </div>

                    </div>

                </header>


                {/* =================================
                    TREINO SUGERIDO
                ================================= */}

                <section className="dash-card dash-hero">

                    <div className="dash-hero-content">

                        <div className="dash-hero-tags">

                            <span className="dash-tag">
                                TREINO SUGERIDO
                            </span>

                            <span className="dash-place">

                                <MapPin size={11} />

                                {data.treinoSugerido.local}

                            </span>

                        </div>


                        <h2>
                            {data.treinoSugerido.nome}
                        </h2>

                        <p className="dash-hero-group">
                            {data.treinoSugerido.grupo}
                        </p>


                        <div className="dash-hero-stats">

                            <div className="dash-stat">

                                <div className="dash-stat-icon">
                                    <ListChecks size={14} />
                                </div>

                                <div>

                                    <span>
                                        EXERCÍCIOS
                                    </span>

                                    <strong>
                                        {String(data.treinoSugerido.exercicios).padStart(2, "0")}
                                    </strong>

                                </div>

                            </div>


                            <div className="dash-stat">

                                <div className="dash-stat-icon">
                                    <Timer size={14} />
                                </div>

                                <div>

                                    <span>
                                        DURAÇÃO
                                    </span>

                                    <strong>
                                        {data.treinoSugerido.duracao}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <button type="button" className="dash-button">

                            <span>
                                INICIAR TREINO
                            </span>

                            <Play size={13} fill="currentColor" />

                        </button>

                    </div>


                    <div className="dash-hero-image">

                        <img src={heroImage} alt="Treino sugerido" />

                    </div>

                </section>


                {/* =================================
                    PROGRESSO / PRÓXIMA SESSÃO
                ================================= */}

                <div className="dash-row">

                    <section className="dash-card dash-progress">

                        <div className="dash-ring">

                            <svg viewBox="0 0 120 120">

                                <circle
                                    className="dash-ring-track"
                                    cx="60"
                                    cy="60"
                                    r={RING_RADIUS}
                                />

                                <circle
                                    className="dash-ring-value"
                                    cx="60"
                                    cy="60"
                                    r={RING_RADIUS}
                                    strokeDasharray={RING_LENGTH}
                                    strokeDashoffset={RING_LENGTH * (1 - percent / 100)}
                                />

                            </svg>

                            <strong>
                                {percent}%
                            </strong>

                        </div>


                        <div className="dash-progress-info">

                            <h3>
                                SEU PROGRESSO
                            </h3>

                            <p>
                                Você completou

                                <strong>
                                    {" "}{data.progresso.concluidos} de {data.progresso.meta}{" "}
                                </strong>

                                treinos da sua meta semanal!
                            </p>


                            <div className="dash-segments">

                                {Array.from({ length: data.progresso.meta }).map((_, index) => (

                                    <span
                                        key={index}
                                        className={
                                            index < data.progresso.concluidos
                                                ? "dash-segment filled"
                                                : "dash-segment"
                                        }
                                    ></span>

                                ))}

                            </div>

                        </div>

                    </section>


                    <section className="dash-card dash-session">

                        <div>

                            <span className="dash-label">
                                PRÓXIMA SESSÃO
                            </span>


                            <p className="dash-session-time">

                                {data.proximaSessao.quando}

                                <span>
                                    {data.proximaSessao.hora}
                                </span>

                            </p>


                            <h3>
                                {data.proximaSessao.treino}
                            </h3>


                            <p className="dash-session-coach">

                                <User size={11} />

                                Coach: {data.proximaSessao.coach}

                            </p>

                        </div>


                        <div className="dash-session-icon">
                            <CalendarDays size={22} />
                        </div>

                    </section>

                </div>


                {/* =================================
                    AGENDAMENTOS / NOTIFICAÇÕES
                ================================= */}

                <div className="dash-row">

                    <section className="dash-card">

                        <div className="dash-card-header">

                            <h3>

                                <Clock size={14} />

                                PRÓXIMOS AGENDAMENTOS

                            </h3>

                            <button type="button" className="dash-link">
                                VER TODOS
                            </button>

                        </div>


                        {data.agendamentos.map((item) => (

                            <div key={item.id} className="dash-appointment">

                                <div className="dash-appointment-icon">
                                    <Leaf size={14} />
                                </div>


                                <div className="dash-appointment-info">

                                    <strong>
                                        {item.titulo}
                                    </strong>

                                    <span>
                                        Instrutor: {item.instrutor}
                                    </span>

                                </div>


                                <div className="dash-appointment-time">

                                    <strong>
                                        {item.hora}
                                    </strong>

                                    <span>
                                        {item.dia}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </section>


                    <section className="dash-card">

                        <div className="dash-card-header">

                            <h3 className="dash-white">

                                <Bell size={14} />

                                NOTIFICAÇÕES

                            </h3>

                        </div>


                        <ul className="dash-notifications">

                            {data.notificacoes.map((item) => (

                                <li key={item.id}>

                                    <span
                                        className={
                                            item.nova
                                                ? "dash-dot new"
                                                : "dash-dot"
                                        }
                                    ></span>


                                    <div>

                                        <strong>
                                            {item.titulo}
                                        </strong>

                                        <span>
                                            {item.detalhe}
                                        </span>

                                    </div>

                                </li>

                            ))}

                        </ul>

                    </section>

                </div>

            </main>

        </div>
    );
}

export default Dashboard;
