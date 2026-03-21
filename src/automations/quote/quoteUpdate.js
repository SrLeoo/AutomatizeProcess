const sendNotification = require('../../automations/geral/notifications');

module.exports = async function quoteUpdate(body) {
    const userId = 1;
    const message = "Cotação atualizada";
    await sendNotification(userId, message);
}

module.exports = async function quoteUpdate(body) {
    const quoteId = body?.data?.FIELDS?.ID;

    if (!quoteId) {
        return;
    }

    // Busca dados
    const mapQuote = await getQuote(quoteId);
    const mapCompany = await getCompany(mapQuote.raw.COMPANY_ID);

// Atualizar montante com base no valor da hora da empresa e o tempo do negócio
    const tempo = Number(mapQuote.raw.UF_CRM_1773953900);
    const valorHora = Number(mapCompany.valorHora);
    if (tempo > 0 && valorHora > 0) {
        const montante = (tempo / 60) * valorHora;
        console.log(`Quote ${quoteId}: ${tempo}min = R$ ${montante.toFixed(2)}`);
        await axios.post(`${process.env.BITRIX_WEBHOOK}crm.quote.update`, {
            id: quoteId,
            fields: {
                OPPORTUNITY: montante
            }
        });
    }
}

