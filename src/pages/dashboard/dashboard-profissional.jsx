import "../dashboard/dashboard.css";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuProfissional } from "../../componets/client-sidebar/menus";
import { useDashboardProfissional } from "../../hooks/useDashboardProfissional";

import {
    Users,
    Dumbbell,
    CalendarCheck,
    CalendarDays,
    Clock
} from "lucide-react";

import { getInitials } from "../../utils/initials";
import { formatarData } from "../../utils/format";

function DashboardProfissional() {

    const { data, loading, error } = useDashboardProfissional();

    if (loading) {
        return <div className="dash-state">Carregando...</div>;
    }

    if (error) {
        return <div className="dash-state error">{error}</div>;
    }

    const firstName = data.nome.split(" ")[0];

    const { treinosHoje } = data.resumo;

    const subtitulo =
        treinosHoje === 0
            ? "Nenhum treino programado para hoje."
            : `Você tem ${treinosHoje} ${treinosHoje === 1 ? "treino programado" : "treinos programados"} para hoje.`;

    const kpis = [
        { label: "ALUNOS ATENDIDOS", value: data.resumo.alunos, icon: Users, nota: "Com treino ativo seu" },
        { label: "TREINOS ATIVOS", value: data.resumo.treinosAtivos, icon: Dumbbell, nota: "Total cadastrado" },
        { label: "TREINOS HOJE", value: data.resumo.treinosHoje, icon: CalendarCheck, nota: "Programados para hoje" },
        { label: "SEM DATA", value: data.resumo.semData, icon: Clock, nota: "Ainda sem data programada" }
    ];

    return (

        <div className="dash-page">

            <ClientSidebar
                name={data.nome}
                plan="Profissional"
                menu={menuProfissional}
            />

            <main className="dash-main">

                {/* CABEÇALHO */}
                <header className="dash-header">
                    <div>
                        <h1>OLÁ, COACH {firstName.toUpperCase()}!</h1>
                        <p className="dash-quote">{subtitulo}</p>
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


                {/* TREINOS DE HOJE / PRÓXIMOS */}
                <div className="dash-row">

                    <section className="dash-card">

                        <div className="dash-card-header">
                            <h3>
                                <CalendarCheck size={14} />
                                TREINOS DE HOJE
                            </h3>
                        </div>

                        {data.treinosHoje.length === 0 ? (

                            <p className="dash-empty">
                                Nenhum treino programado para hoje.
                            </p>

                        ) : (

                            <ul className="dash-list">
                                {data.treinosHoje.map((t) => (
                                    <li key={t.id_treino}>

                                        <div className="dash-avatar-sm">
                                            {getInitials(t.nome_aluno)}
                                        </div>

                                        <div className="dash-list-info">
                                            <strong>{t.titulo_treino}</strong>
                                            <span>{t.nome_aluno}</span>
                                        </div>

                                    </li>
                                ))}
                            </ul>

                        )}

                    </section>


                    <section className="dash-card">

                        <div className="dash-card-header">
                            <h3>
                                <CalendarDays size={14} />
                                PRÓXIMOS TREINOS
                            </h3>
                        </div>

                        {data.proximos.length === 0 ? (

                            <p className="dash-empty">
                                Nenhum treino programado para os próximos dias.
                            </p>

                        ) : (

                            <ul className="dash-list">
                                {data.proximos.map((t) => (
                                    <li key={t.id_treino}>

                                        <span className="dash-list-time">
                                            {formatarData(t.data_programada)}
                                        </span>

                                        <div className="dash-list-info">
                                            <strong>{t.titulo_treino}</strong>
                                            <span>{t.nome_aluno}</span>
                                        </div>

                                    </li>
                                ))}
                            </ul>

                        )}

                    </section>

                </div>


                {/* MEUS ALUNOS */}
                <section className="dash-card">

                    <div className="dash-card-header">
                        <h3>
                            <Users size={14} />
                            MEUS ALUNOS
                        </h3>
                    </div>

                    {data.alunos.length === 0 ? (

                        <p className="dash-empty">
                            Você ainda não tem treinos cadastrados para nenhum aluno.
                        </p>

                    ) : (

                        <ul className="dash-list">
                            {data.alunos.map((aluno) => (
                                <li key={aluno.id}>

                                    <div className="dash-avatar-sm">
                                        {getInitials(aluno.nome)}
                                    </div>

                                    <div className="dash-list-info">
                                        <strong>{aluno.nome}</strong>
                                        <span>
                                            {aluno.treinos}{" "}
                                            {aluno.treinos === 1 ? "treino ativo" : "treinos ativos"}
                                        </span>
                                    </div>

                                    <span className="dash-badge">
                                        {aluno.proximo
                                            ? `Próximo: ${formatarData(aluno.proximo)}`
                                            : "Sem data"}
                                    </span>

                                </li>
                            ))}
                        </ul>

                    )}

                </section>

            </main>

        </div>
    );
}

export default DashboardProfissional;
