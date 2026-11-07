import "../client-sidebar/client-sidebar.css";
import raioIcon from "../../assets/images/raio-icon.png";

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
    LogOut
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { logout } from "../../services/auth";

// =========================
// ITENS DO MENU
// =========================
// Itens com "to" navegam. Os sem "to" ainda não têm tela:
// quando criar a página, é só adicionar o "to" dela.

const mainItems = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "Meu Treino", icon: Dumbbell },
    { label: "Próximos Treinos", icon: CalendarCheck },
    { label: "Histórico", icon: History },
    { label: "Progresso", icon: TrendingUp },
    { label: "Objetivos", icon: Target }
];

const secondaryItems = [
    { label: "Agendar Aula", icon: CalendarPlus },
    { label: "Avaliação Física", icon: ClipboardList },
    { label: "Notificações", icon: Bell },
    { label: "Perfil", icon: UserRound }
];


function SidebarItem({ item }) {

    const Icon = item.icon;

    if (item.to) {

        return (

            <NavLink
                to={item.to}
                className={({ isActive }) =>
                    isActive ? "csb-item active" : "csb-item"
                }
            >

                <Icon size={15} />

                <span>
                    {item.label}
                </span>

            </NavLink>

        );
    }

    return (

        <button type="button" className="csb-item">

            <Icon size={15} />

            <span>
                {item.label}
            </span>

        </button>

    );
}


function ClientSidebar({ name, plan }) {

    const navigate = useNavigate();

    const initials = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");


    // =========================
    // SAIR
    // =========================

    const handleLogout = () => {

        logout();

        navigate("/login");

    };


    return (

        <aside className="csb">

            {/* LOGO */}

            <div className="csb-logo">

                <div className="csb-logo-icon">
                    <img src={raioIcon} alt="GymTech" />
                </div>

                <span>
                    GYM TECH
                </span>

            </div>


            {/* MENU */}

            <nav className="csb-nav">

                {mainItems.map((item) => (
                    <SidebarItem key={item.label} item={item} />
                ))}

                <div className="csb-divider"></div>

                {secondaryItems.map((item) => (
                    <SidebarItem key={item.label} item={item} />
                ))}

            </nav>


            {/* USUÁRIO */}

            <div className="csb-user">

                <div className="csb-avatar">
                    {initials}
                </div>


                <div className="csb-user-info">

                    <strong>
                        {name}
                    </strong>

                    <span>
                        {plan}
                    </span>

                </div>


                <button
                    type="button"
                    className="csb-logout"
                    onClick={handleLogout}
                    aria-label="Sair"
                    title="Sair"
                >
                    <LogOut size={14} />
                </button>

            </div>

        </aside>
    );
}

export default ClientSidebar;
