// =========================
// DADOS DE EXEMPLO (FRONT-END)
// =========================
// Troque por chamadas à API quando o back-end estiver pronto.
// A tela só depende deste formato de dados.

export const dashboardMock = {

    plano: "Plano Elite",

    estado: "Focado • Em Sequência",

    frase: {
        texto: "A persistência é o caminho do êxito.",
        autor: "Desconhecido"
    },

    treinoSugerido: {
        nome: "TREINO A",
        grupo: "PEITO E TRÍCEPS",
        local: "Academia",
        exercicios: 8,
        duracao: "60 min"
    },

    progresso: {
        concluidos: 3,
        meta: 4
    },

    proximaSessao: {
        quando: "Amanhã",
        hora: "08:00",
        treino: "COSTAS E BÍCEPS",
        coach: "Rodrigo Lima"
    },

    agendamentos: [
        {
            id: 1,
            titulo: "AULA DE YOGA",
            instrutor: "Mariana Santos",
            hora: "18:00",
            dia: "HOJE"
        }
    ],

    notificacoes: [
        {
            id: 1,
            titulo: "Novo recorde pessoal em Supino!",
            detalhe: "Há 2 horas • Parabéns por atingir 80kg",
            nova: true
        },
        {
            id: 2,
            titulo: "Avaliação física agendada",
            detalhe: "Há 5 horas • Sexta-feira, às 14:00",
            nova: false
        }
    ]
};
