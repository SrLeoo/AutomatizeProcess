const axios = require('axios');

module.exports = function getQuote(quoteId) {
    return axios
        .post(`${process.env.BITRIX_WEBHOOK}crm.quote.get?id=${quoteId}`)
        .then(response => {
            const quoteData = response.data.result;

            return {
                id: quoteData.ID,
                title: quoteData.TITLE,
                companyId: quoteData.COMPANY_ID,
                linkReuniao: quoteData.UF_CRM_1773953522,
                linkTranscricao: quoteData.UF_CRM_1773953560,
                raw: quoteData
            };
        });
}
