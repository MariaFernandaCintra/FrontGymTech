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

// Itens com "to" navegam. Os sem "to" ainda não têm tela:
// quando criar a página, é só adicionar o "to" dela.

export const menuAluno = {
    main: [
        { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard-aluno" },
        { label: "Meu Treino", icon: Dumbbell },
        { label: "Próximos Treinos", icon: CalendarCheck },
        { label: "Histórico", icon: History },
        { label: "Progresso", icon: TrendingUp },
        { label: "Objetivos", icon: Target }
    ],
    secondary: [
        { label: "Agendar Aula", icon: CalendarPlus },
        { label: "Avaliação Física", icon: ClipboardList },
        { label: "Notificações", icon: Bell },
        { label: "Perfil", icon: UserRound }
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