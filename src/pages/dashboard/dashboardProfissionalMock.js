// Troque por chamadas à API quando o back-end estiver pronto.

export const profissionalMock = {

    plano: "Personal Trainer",

    subtitulo: "Você tem 5 sessões agendadas para hoje.",

    resumo: {
        alunosAtivos: 24,
        sessoesHoje: 5,
        avaliacoesPendentes: 3,
        treinosParaRevisar: 7
    },

    agendaHoje: [
        { id: 1, hora: "07:00", aluno: "Carlos Mendes", tipo: "Treino A", local: "Sala de musculação" },
        { id: 2, hora: "09:00", aluno: "Ana Beatriz", tipo: "Avaliação física", local: "Sala de avaliação" },
        { id: 3, hora: "11:30", aluno: "Pedro Henrique", tipo: "Treino C", local: "Sala de musculação" },
        { id: 4, hora: "16:00", aluno: "Juliana Prado", tipo: "Funcional", local: "Área externa" }
    ],

    alunosAtencao: [
        { id: 1, nome: "Marcos Vinícius", motivo: "Sem treinar há 9 dias", frequencia: 25 },
        { id: 2, nome: "Larissa Souza", motivo: "Meta semanal abaixo do esperado", frequencia: 45 },
        { id: 3, nome: "Rafael Gomes", motivo: "Treino vence em 2 dias", frequencia: 60 }
    ],

    notificacoes: [
        {
            id: 1,
            titulo: "Carlos Mendes concluiu o Treino A",
            detalhe: "Há 1 hora • 8 exercícios finalizados",
            nova: true
        },
        {
            id: 2,
            titulo: "Nova solicitação de avaliação",
            detalhe: "Há 3 horas • Ana Beatriz",
            nova: true
        },
        {
            id: 3,
            titulo: "Pedro Henrique atingiu a meta semanal",
            detalhe: "Ontem • 4 de 4 treinos",
            nova: false
        }
    ]
};