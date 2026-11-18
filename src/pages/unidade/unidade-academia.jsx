import "../dashboard/dashboard.css";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuAcademia } from "../../componets/client-sidebar/menus";
import { useUnidadeAcademia } from "../../hooks/useUnidadeAcademia";

import {
    Users,
    UserCheck,
    CalendarDays,
    TrendingUp,
    Building2,
    MapPin,
    Phone,
    Mail,
    ShieldCheck
} from "lucide-react";

import { getInitials } from "../../utils/initials";
import { formatarDataHora } from "../../utils/format";


// 12345678000199 -> 12.345.678/0001-99
function formatarCnpj(valor) {

    const digitos = String(valor || "").replace(/\D/g, "");

    if (digitos.length !== 14) return valor || "Não informado";

    return digitos.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
    );
}

// 16999998888 -> (16) 99999-8888
function formatarTelefone(valor) {

    const digitos = String(valor || "").replace(/\D/g, "");

    if (digitos.length === 11) {
        return digitos.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }

    if (digitos.length === 10) {
        return digitos.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    return valor || "Não informado";
}


function UnidadeAcademia() {

    const { data, avisos, loading, error } = useUnidadeAcademia();

    if (loading) {
        return <div className="dash-state">Carregando...</div>;
    }

    if (error) {
        return <div className="dash-state error">{error}</div>;
    }

    const { resumo } = data;

    const kpis = [
        {
            label: "ALUNOS ATIVOS",
            value: resumo.alunosAtivos,
            icon: Users,
            nota: `${resumo.alunosInativos} ${resumo.alunosInativos === 1 ? "inativo" : "inativos"}`
        },
        {
            label: "PROFISSIONAIS",
            value: resumo.profissionais,
            icon: UserCheck,
            nota: "Equipe ativa"
        },
        {
            label: "AULAS (7 DIAS)",
            value: resumo.aulasSemana,
            icon: CalendarDays,
            nota: `${resumo.aulasFuturas} no total pela frente`
        },
        {
            label: "OCUPAÇÃO",
            value: resumo.ocupacao === null ? "—" : `${resumo.ocupacao}%`,
            icon: TrendingUp,
            nota: "Vagas preenchidas nos próximos 7 dias"
        }
    ];

    const identificacao = [
        { icon: MapPin, valor: data.endereco || "Não informado", rotulo: "Endereço" },
        { icon: Phone, valor: formatarTelefone(data.telefone), rotulo: "Telefone" },
        { icon: Mail, valor: data.email || "Não informado", rotulo: "E-mail corporativo" },
        { icon: ShieldCheck, valor: formatarCnpj(data.cnpj), rotulo: "CNPJ" }
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
                        <h1>UNIDADE</h1>
                        <p className="dash-quote">
                            {data.nome} • {resumo.alunosAtivos} alunos e {resumo.profissionais} profissionais ativos
                        </p>
                    </div>
                </header>

                {avisos && (
                    <p style={{ margin: "0 0 16px", color: "#ff5252", fontSize: "12px" }}>
                        {avisos}
                    </p>
                )}


                {/* INDICADORES */}
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


                {/* IDENTIFICAÇÃO / EQUIPE */}
                <div className="dash-row">

                    <section className="dash-card">

                        <div className="dash-card-header">
                            <h3>
                                <Building2 size={14} />
                                IDENTIFICAÇÃO
                            </h3>
                        </div>

                        <ul className="dash-list">
                            {identificacao.map((item) => {

                                const Icon = item.icon;

                                return (
                                    <li key={item.rotulo}>

                                        <div className="dash-avatar-sm">
                                            <Icon size={15} />
                                        </div>

                                        <div className="dash-list-info">
                                            <strong>{item.valor}</strong>
                                            <span>{item.rotulo}</span>
                                        </div>

                                    </li>
                                );
                            })}
                        </ul>

                    </section>


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
                                            <span>{p.especialidade} • {p.registro}</span>
                                        </div>

                                        <span className="dash-badge">
                                            {p.aulas} {p.aulas === 1 ? "aula" : "aulas"}
                                        </span>

                                    </li>
                                ))}
                            </ul>

                        )}

                    </section>

                </div>


                {/* GRADE DE AULAS */}
                <section className="dash-card">

                    <div className="dash-card-header">
                        <h3>
                            <CalendarDays size={14} />
                            AULAS DOS PRÓXIMOS 7 DIAS
                        </h3>
                    </div>

                    {data.dias.map((dia) => (

                        <div key={dia.chave}>

                            <p
                                style={{
                                    margin: "20px 0 0",
                                    color: "#7d7d7d",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.5px",
                                    textTransform: "uppercase"
                                }}
                            >
                                {dia.rotulo}
                            </p>

                            {dia.aulas.length === 0 ? (

                                <p className="dash-empty">Sem aulas neste dia.</p>

                            ) : (

                                <ul className="dash-list">
                                    {dia.aulas.map((aula) => {

                                        const lotada = aula.vagas_disponiveis === 0;

                                        return (
                                            <li key={aula.id_aula}>

                                                <span className="dash-list-time">
                                                    {formatarDataHora(aula.data_horario).hora}
                                                </span>

                                                <div className="dash-list-info">
                                                    <strong>{aula.nome_aula}</strong>
                                                    <span>{aula.tipo_aula} • {aula.nome_profissional}</span>
                                                </div>

                                                <span className={lotada ? "dash-badge danger" : "dash-badge"}>
                                                    {lotada
                                                        ? "LOTADA"
                                                        : `${aula.vagas_ocupadas}/${aula.capacidade_maxima} vagas`}
                                                </span>

                                            </li>
                                        );
                                    })}
                                </ul>

                            )}

                        </div>

                    ))}

                </section>

            </main>

        </div>
    );
}

export default UnidadeAcademia;