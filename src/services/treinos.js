import api from "./api";

export async function cancelarTreino(idTreino) {

    const { data } = await api.delete(`/profissionais/me/treinos/${idTreino}`);

    return data;
}