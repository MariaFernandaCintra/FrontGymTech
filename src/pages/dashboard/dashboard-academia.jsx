import "../dashboard/dashboard.css";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuAcademia } from "../../componets/client-sidebar/menus";
import { useDashboardAcademia } from "../../hooks/useDashboardAcademia";

import {
    Users,
    UserCheck,
    Dumbbell,
    TrendingUp,
    CalendarDays
} from "lucide-react";

import { getInitials } from "../../utils/initials";
import { formatarData } from "../../utils/format";

function DashboardAcademia() {

    const { data, loading, error } = useDashboardAcademia();

    if (loading) {
        return <div className="dash-state">Carregando...</div>;
    }

    if (error) {
        return <div className="dash-state error">{error}</div>;
    }

    const maxCadastros = Math.max(1, ...data.cadastros.map((m) => m.total));

    const kpis = [
        { label: "ALUNOS ATIVOS", value: data.resumo.alunos, icon: Users, nota: "Matrículas ativas" },
        { label: "PROFISSIONAIS", value: data.resumo.profissionais, icon: UserCheck, nota: "Equipe ativa" },
        { label: "TREINOS ATIVOS", value: data.resumo.treinos, icon: Dumbbell, nota: "Cadastrados na academia" },
        { label: "NOVOS ALUNOS", value: data.resumo.novos, icon: TrendingUp, nota: "Últimos 30 dias" }
    ];

    return (

        <div className="dash-page">

            <ClientSidebar
                name={data.nome}
                plan="Academia"
                menu={menuAcademia}
            />

            <main className="dash-main">

                {/* CABEÇALHO */}
                <header className="dash-header">
                    <div>
                        <h1>PAINEL DA {data.nome.toUpperCase()}</h1>
                        <p className="dash-quote">
                            {data.resumo.alunos} alunos e {data.resumo.profissionais} profissionais ativos na sua academia.
                        </p>
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


                {/* GRÁFICO / PRÓXIMOS TREINOS */}
                <div className="dash-row">

                    <section className="dash-card">

                        <div className="dash-card-header">
                            <h3>
                                <TrendingUp size={14} />
                                NOVOS ALUNOS POR MÊS
                            </h3>
                        </div>

                        <div className="dash-chart">
                            {data.cadastros.map((m) => (
                                <div
                                    key={m.chave}
                                    className={m.atual ? "dash-chart-col current" : "dash-chart-col"}
                                >
                                    <strong>{m.total}</strong>

                                    <div className="dash-chart-track">
                                        <div
                                            className="dash-chart-bar"
                                            style={{ height: `${(m.total / maxCadastros) * 100}%` }}
                                        ></div>
                                    </div>

                                    <span>{m.rotulo}</span>
                                </div>
                            ))}
                        </div>

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
                                            <span>{t.nome_aluno} • {t.nome_profissional}</span>
                                        </div>

                                    </li>
                                ))}
                            </ul>

                        )}

                    </section>

                </div>


                {/* EQUIPE / MODALIDADES */}
                <div className="dash-row">

                    <section className="dash-card">

                        <div className="dash-card-header">
                            <h3>
                                <UserCheck size={14} />
                                EQUIPE
                            </h3>
                        </div>

                        {data.equipe.length === 0 ? (

                            <p className="dash-empty">
                                Nenhum profissional ativo cadastrado.
                            </p>

                        ) : (

                            <ul className="dash-list">
                                {data.equipe.map((p) => (
                                    <li key={p.id}>

                                        <div className="dash-avatar-sm">
                                            {getInitials(p.nome)}
                                        </div>

                                        <div className="dash-list-info">
                                            <strong>{p.nome}</strong>
                                            <span>
                                                {p.especialidade} • {p.alunos} {p.alunos === 1 ? "aluno" : "alunos"}
                                            </span>
                                        </div>

                                        <span className="dash-badge">
                                            {p.treinos} {p.treinos === 1 ? "treino" : "treinos"}
                                        </span>

                                    </li>
                                ))}
                            </ul>

                        )}

                    </section>


                    <section className="dash-card">

                        <div className="dash-card-header">
                            <h3>
                                <Dumbbell size={14} />
                                MODALIDADES
                            </h3>
                        </div>

                        {data.modalidades.length === 0 ? (

                            <p className="dash-empty">
                                Nenhum aluno ativo cadastrado.
                            </p>

                        ) : (

                            <ul className="dash-list">
                                {data.modalidades.map((m) => (
                                    <li key={m.nome}>

                                        <div className="dash-list-info">
                                            <strong>{m.nome}</strong>

                                            <div className="dash-bar">
                                                <span
                                                    style={{ width: `${(m.total / data.totalAlunos) * 100}%` }}
                                                ></span>
                                            </div>
                                        </div>

                                        <span className="dash-badge">
                                            {m.total} {m.total === 1 ? "aluno" : "alunos"}
                                        </span>

                                    </li>
                                ))}
                            </ul>

                        )}

                    </section>

                </div>

            </main>

        </div>
    );
}

export default DashboardAcademia;