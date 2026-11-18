import "../dashboard/dashboard.css";
import "../treinos/treinos-profissional.css";

import { Bell, CheckCheck } from "lucide-react";

import ClientSidebar from "../../componets/client-sidebar/client-sidebar";
import { menuAcademia } from "../../componets/client-sidebar/menus";

import { useNotificacoesAcademia } from "../../hooks/useNotificacoesAcademia";


function NotificacoesAcademia() {

    const {
        nomeAcademia,
        notificacoes,
        naoLidas,
        loading,
        error,
        marcarTodasComoLidas
    } = useNotificacoesAcademia();

    return (

        <div className="dash-page">

            <ClientSidebar
                name={nomeAcademia}
                plan="Academia"
                menu={menuAcademia}
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

                {!loading && notificacoes.length === 0 && (

                    <div className="trn-vazio">
                        Nenhuma notificação por aqui ainda. Os avisos aparecem quando há
                        novos cadastros, aulas, avaliações ou treinos na academia.
                    </div>

                )}

                {notificacoes.length > 0 && (

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

export default NotificacoesAcademia;