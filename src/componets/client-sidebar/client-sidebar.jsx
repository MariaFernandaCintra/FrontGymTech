import "../client-sidebar/client-sidebar.css";
import raioIcon from "../../assets/images/raio-icon.png";

import { LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { logout } from "../../services/auth";
import { menuAluno } from "./menus";


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


function ClientSidebar({ name, plan, menu = menuAluno }) {

    const navigate = useNavigate();

    const initials = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

    const handleLogout = () => {

        logout();

        navigate("/login");

    };


    return (

        <aside className="csb">

            <div className="csb-logo">

                <div className="csb-logo-icon">
                    <img src={raioIcon} alt="GymTech" />
                </div>

                <span>
                    GYM TECH
                </span>

            </div>


            <nav className="csb-nav">

                {menu.main.map((item) => (
                    <SidebarItem key={item.label} item={item} />
                ))}

                <div className="csb-divider"></div>

                {menu.secondary.map((item) => (
                    <SidebarItem key={item.label} item={item} />
                ))}

            </nav>


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