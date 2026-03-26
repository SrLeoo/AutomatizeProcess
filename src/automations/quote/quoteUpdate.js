const axios = require("axios");
const sendNotification = require('../../automations/geral/notifications');
const getCompany = require("../../services/bitrix/company/getCompany");
const getQuote = require("../../services/bitrix/quote/getQuote");
const currentTime = require('../../automations/geral/currentTime');

module.exports = async function quoteUpdate(body) {
    const quoteId = body?.data?.FIELDS?.ID;
    // Busca dados empresa
    const mapQuote = await getQuote(quoteId);
    const mapCompany = await getCompany(mapQuote.raw.COMPANY_ID);

    // Atualizar montante com base no valor da hora da empresa e o tempo do negócio
    const tempo = Number(mapQuote.raw.UF_CRM_1773953900);
    const valorHora = Number(mapCompany.valorHora);
    if (tempo > 0 && valorHora > 0) {
        const montante = (tempo * valorHora);
        // console.log(`Quote ${quoteId}: ${tempo}min = R$ ${montante.toFixed(2)}`);
        await axios.post(`${process.env.BITRIX_WEBHOOK}crm.quote.update`, {
            id: quoteId,
            fields: {
                OPPORTUNITY: montante
            }
        });
    }

    // Setar data de entrada da fase
    // DRAFT seria a primeira fase. Está em quoteAdd.js para garantir que seja setada na criação da cotação

    let fieldToUpdate;
    // logs para debug
    console.log("Quote ID:", quoteId);
    console.log("stage atual:", mapQuote.status_id);
    console.log("devolutivaFeita:", mapQuote.devolutivaFeita);
    console.log("aguardandoAssinatura:", mapQuote.aguardandoAssinatura);
    console.log("aceito:", mapQuote.aceito);
    console.log("recusado:", mapQuote.recusado);
    //

    if (mapQuote.status_id === "SENT" && !mapQuote.devolutivaFeita) {
        fieldToUpdate = "UF_CRM_QUOTE_1774523375059"; // Devolutiva feita
    }

    if (mapQuote.status_id === "UC_34LZB3" && !mapQuote.aguardandoAssinatura) {
        fieldToUpdate = "UF_CRM_QUOTE_1774523404427"; // Aguardando assinatura
    }

    if (mapQuote.status_id === "APPROVED" && !mapQuote.aceito) {
        fieldToUpdate = "UF_CRM_QUOTE_1774523551749"; // Aceito
    }

    if (mapQuote.status_id === "DECLINED" && !mapQuote.recusado) {
        fieldToUpdate = "UF_CRM_QUOTE_1774523541655"; // Recusado
    }

    if (fieldToUpdate) {
        await axios.post(`${process.env.BITRIX_WEBHOOK}crm.quote.update`, {
            id: quoteId,
            fields: {
                [fieldToUpdate]: currentTime()
            }
        });
    }
};
