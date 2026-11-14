
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
    MessageSquare,
    Building2
} from "lucide-react";

export const menuAluno = {
    main: [
        { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard-aluno" },
        { label: "Meus Treinos", icon: Dumbbell, to: "/meus-treinos" },
        { label: "Histórico", icon: History, to: "/historico-treinos" }
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
        { label: "Agenda", icon: CalendarCheck },
        { label: "Avaliações", icon: ClipboardList },
        { label: "Evolução", icon: TrendingUp }
    ],
    secondary: [
        { label: "Mensagens", icon: MessageSquare },
        { label: "Notificações", icon: Bell },
        { label: "Perfil", icon: UserRound }
    ]
};

export const menuAcademia = {
    main: [
        { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard-academia" },
        { label: "Alunos", icon: Users },
        { label: "Profissionais", icon: UserCheck },
        { label: "Aulas", icon: CalendarCheck },
        { label: "Financeiro", icon: Wallet },
        { label: "Relatórios", icon: TrendingUp }
    ],
    secondary: [
        { label: "Unidade", icon: Building2 },
        { label: "Notificações", icon: Bell },
        { label: "Configurações", icon: Settings }
    ]
};
