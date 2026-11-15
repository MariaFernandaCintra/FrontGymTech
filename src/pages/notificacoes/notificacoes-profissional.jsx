import "../dashboard/dashboard.css";
import "../treinos/treinos-profissional.css";

import { Bell, CheckCheck } from "lucide-react";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuProfissional } from "../../componets/client-sidebar/menus";

import { useUsuarioLogado } from "../../hooks/useUsuarioLogado";
import { useNotificacoesProfissional } from "../../hooks/useNotificacoesProfissional";


function NotificacoesProfissional() {

    const usuario = useUsuarioLogado();

    const {
        notificacoes,
        naoLidas,
        loading,
        error,
        marcarTodasComoLidas
    } = useNotificacoesProfissional();

    return (

        <div className="dash-page">

            <ClientSidebar
                name={usuario?.nome || "Profissional"}
                plan="Profissional"
                menu={menuProfissional}
            />

            <main className="dash-main">

                {/* CABEÇALHO */}
                <header className="dash-header">
                    <div>
                        <h1>NOTIFICAÇÕES</h1>
                        <p className="dash-quote">
                            {loading
                                ? "Carregando..."
                                : naoLidas === 0
                                    ? "Você está em dia, nenhuma notificação nova"
                                    : `${naoLidas} ${naoLidas === 1 ? "notificação nova" : "notificações novas"}`}
                        </p>
                    </div>
                </header>


                {/* AÇÕES */}
                <div className="trn-toolbar">

                    <div className="trn-tabs">
                        <button
                            type="button"
                            className="trn-tab"
                            onClick={marcarTodasComoLidas}
                            disabled={loading || naoLidas === 0}
                        >
                            <CheckCheck size={13} /> Marcar todas como lidas
                        </button>
                    </div>

                </div>


                {error && <div className="trn-erro">{error}</div>}

                {!error && !loading && notificacoes.length === 0 && (

                    <div className="trn-vazio">
                        Nenhuma notificação por aqui ainda. Os avisos aparecem quando
                        você tem treinos ou avaliações com os alunos.
                    </div>

                )}

                {!error && notificacoes.length > 0 && (

                    <section className="dash-card">

                        <div className="dash-card-header">

                            <h3 className="dash-white">
                                <Bell size={14} />
                                RECENTES
                            </h3>

                        </div>

                        <ul className="dash-notifications">

                            {notificacoes.map((item) => (

                                <li key={item.id}>

                                    <span
                                        className={item.nova ? "dash-dot new" : "dash-dot"}
                                    ></span>

                                    <div>

                                        <strong>{item.titulo}</strong>

                                        <span>{item.detalhe}</span>

                                    </div>

                                </li>

                            ))}

                        </ul>

                    </section>

                )}

            </main>

        </div>
    );
}

export default NotificacoesProfissional;