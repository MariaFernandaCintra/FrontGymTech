
import {
    LayoutDashboard,
    Dumbbell,
    CalendarCheck,
    History,
    TrendingUp,
    Target,
    CalendarPlus,
    ClipboardList,
    Bell,
    UserRound,
    Users,
    UserCheck,
    Wallet,
    Settings,
    Building2
} from "lucide-react";

// Itens com "to" navegam.
// Os sem "to" ainda não possuem tela implementada.

export const menuAluno = {
    main: [
        { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard-aluno" },
        { label: "Meus Treinos", icon: Dumbbell, to: "/meus-treinos" },
        { label: "Histórico", icon: History, to: "/historico-treinos" },
    ],
    secondary: [
        { label: "Agendar Aula", icon: CalendarPlus, to: "/agendamento-aula" },
        { label: "Avaliação Física", icon: ClipboardList, to: "/avaliacao-fisica" },
        { label: "Perfil", icon: UserRound, to: "/perfil-aluno" }
    ]
};

export const menuProfissional = {
    main: [
        { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard-profissional" },
        { label: "Meus Alunos", icon: Users, to: "/alunos-profissional" },
        { label: "Treinos", icon: Dumbbell, to: "/treinos-profissional" },
        { label: "Agenda", icon: CalendarCheck, to: "/agenda-profissional" },
        { label: "Avaliações", icon: ClipboardList, to: "/avaliacoes-profissional" },
        
    ],
    secondary: [
        { label: "Notificações", icon: Bell, to: "/notificacoes-profissional" },
        { label: "Perfil", icon: UserRound, to: "/perfil-profissional" }
    ]
};

export const menuAcademia = {
    main: [
        { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard-academia" },
        { label: "Alunos", icon: Users, to: "/alunos-academia" },
        { label: "Profissionais", icon: UserCheck, to: "/profissionais-academia" },
        { label: "Aulas", icon: CalendarCheck, to: "/aulas" },
        { label: "Relatórios", icon: TrendingUp }
    ],
    secondary: [
        { label: "Unidade", icon: Building2 },
        { label: "Notificações", icon: Bell },
        { label: "Configurações", icon: Settings }
    ]
};

