import "../dashboard/dashboard.css";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuProfissional } from "../../componets/client-sidebar/menus";
import { profissionalMock } from "./dashboardProfissionalMock";

import {
    Users,
    CalendarCheck,
    ClipboardList,
    Dumbbell,
    Clock,
    Bell,
    TrendingUp
} from "lucide-react";

import { getUser } from "../../services/auth";
import { getInitials } from "../../utils/initials";

function DashboardProfissional() {

    const user = getUser();
    const data = profissionalMock;

    const fullName = user?.nome || "Profissional";
    const firstName = fullName.split(" ")[0];

    const kpis = [
        { label: "ALUNOS ATIVOS", value: data.resumo.alunosAtivos, icon: Users, nota: "Total sob sua orientação" },
        { label: "SESSÕES HOJE", value: data.resumo.sessoesHoje, icon: CalendarCheck, nota: "Agenda do dia" },
        { label: "AVALIAÇÕES PENDENTES", value: data.resumo.avaliacoesPendentes, icon: ClipboardList, nota: "Aguardando você" },
        { label: "TREINOS A REVISAR", value: data.resumo.treinosParaRevisar, icon: Dumbbell, nota: "Vencendo em breve" }
    ];

    return (

        <div className="dash-page">

            <ClientSidebar
                name={fullName}
                plan={data.plano}
                menu={menuProfissional}
            />

            <main className="dash-main">

                {/* CABEÇALHO */}
                <header className="dash-header">
                    <div>
                        <h1>OLÁ, COACH {firstName.toUpperCase()}!</h1>
                        <p className="dash-quote">{data.subtitulo}</p>
                    </div>
                </header>


                {/* KPIs */}
                <div className="dash-kpis">

                    {kpis.map((kpi) => {

                        const Icon = kpi.icon;

                        return (
                            <section key={kpi.label} className="dash-kpi">

                                <div className="dash-kpi-top">
                                    <span>{kpi.label}</span>

                                    <div className="dash-kpi-icon">
                                        <Icon size={15} />
                                    </div>
                                </div>

                                <strong>{kpi.value}</strong>

                                <small>{kpi.nota}</small>

                            </section>
                        );
                    })}

                </div>


                {/* AGENDA / ALUNOS EM ATENÇÃO */}
                <div className="dash-row">

                    <section className="dash-card">

                        <div className="dash-card-header">
                            <h3>
                                <Clock size={14} />
                                AGENDA DE HOJE
                            </h3>

                            <button type="button" className="dash-link">
                                VER AGENDA
                            </button>
                        </div>

                        <ul className="dash-list">
                            {data.agendaHoje.map((item) => (
                                <li key={item.id}>

                                    <span className="dash-list-time">{item.hora}</span>

                                    <div className="dash-list-info">
                                        <strong>{item.aluno}</strong>
                                        <span>{item.tipo} • {item.local}</span>
                                    </div>

                                </li>
                            ))}
                        </ul>

                    </section>


                    <section className="dash-card">

                        <div className="dash-card-header">
                            <h3>
                                <TrendingUp size={14} />
                                ALUNOS EM ATENÇÃO
                            </h3>

                            <button type="button" className="dash-link">
                                VER TODOS
                            </button>
                        </div>

                        <ul className="dash-list">
                            {data.alunosAtencao.map((aluno) => (
                                <li key={aluno.id}>

                                    <div className="dash-avatar-sm">
                                        {getInitials(aluno.nome)}
                                    </div>

                                    <div className="dash-list-info">
                                        <strong>{aluno.nome}</strong>
                                        <span>{aluno.motivo}</span>

                                        <div className="dash-bar">
                                            <span style={{ width: `${aluno.frequencia}%` }}></span>
                                        </div>
                                    </div>

                                    <span
                                        className={
                                            aluno.frequencia < 40
                                                ? "dash-badge danger"
                                                : "dash-badge warn"
                                        }
                                    >
                                        {aluno.frequencia}%
                                    </span>

                                </li>
                            ))}
                        </ul>

                    </section>

                </div>


                {/* NOTIFICAÇÕES */}
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

                                <span className={item.nova ? "dash-dot new" : "dash-dot"}></span>

                                <div>
                                    <strong>{item.titulo}</strong>
                                    <span>{item.detalhe}</span>
                                </div>

                            </li>
                        ))}
                    </ul>

                </section>

            </main>

        </div>
    );
}

export default DashboardProfissional;
