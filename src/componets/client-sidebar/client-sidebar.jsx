import "../client-sidebar/client-sidebar.css";
import raioIcon from "../../assets/images/raio-icon.png";

import { LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { logout } from "../../services/auth";
import { menuAluno } from "./menus";


// =========================
// ITEM DO MENU
// =========================
// Itens com "to" navegam. Os sem "to" ainda não têm tela:
// quando criar a página, é só adicionar o "to" dela no menus.js.

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


// =========================
// SIDEBAR
// =========================
// "menu" define os itens de cada perfil (aluno, profissional, academia).
// Se não for passado, usa o menu do aluno.

function ClientSidebar({ name, plan, menu = menuAluno }) {

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

                {menu.main.map((item) => (
                    <SidebarItem key={item.label} item={item} />
                ))}

                <div className="csb-divider"></div>

                {menu.secondary.map((item) => (
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