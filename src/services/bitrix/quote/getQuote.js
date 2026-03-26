const axios = require('axios');

module.exports = function getQuote(quoteId) {
    return axios
        .post(`${process.env.BITRIX_WEBHOOK}crm.quote.get?id=${quoteId}`)
        .then(response => {
            const quoteData = response.data.result;

            return {
                id: quoteData.ID,
                title: quoteData.TITLE,
                status_id: quoteData.STATUS_ID,
                companyId: quoteData.COMPANY_ID,
                linkReuniao: quoteData.UF_CRM_1773953522,
                linkTranscricao: quoteData.UF_CRM_1773953560,

                // Entrada na fase
                aguardandoRetorno: quoteData.UF_CRM_QUOTE_1774540648, // Aguardando retorno
                devolutivaFeita: quoteData.UF_CRM_QUOTE_1774540686, // Devolutiva feita
                aguardandoAssinatura: quoteData.UF_CRM_QUOTE_1774540703, // Aguardando assinatura
                recusado: quoteData.UF_CRM_QUOTE_1774540714, // Recusado
                aceito: quoteData.UF_CRM_QUOTE_1774540734,   // Aceito
                //
                raw: quoteData
            };
        });
}
