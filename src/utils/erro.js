export function mensagemErro(err, padrao = "Algo deu errado. Tente novamente.") {

    const detalhe = err.response?.data?.detail;

    if (typeof detalhe === "string") {
        return detalhe;
    }

    if (Array.isArray(detalhe) && detalhe[0]?.msg) {
        return detalhe[0].msg;
    }

    return padrao;
}