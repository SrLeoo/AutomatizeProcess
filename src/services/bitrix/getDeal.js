const axios = require("axios");

module.exports = function getDeal(dealId) {
    return axios
        .get(`${process.env.BITRIX_WEBHOOK}crm.deal.get?id=${dealId}`)
        .then(response => {
            const dealData = response.data.result;

            return {
                id: dealData.ID,
                title: dealData.TITLE,
                stageId: dealData.STAGE_ID,
                companyId: dealData.COMPANY_ID,
                prioridade: dealData.UF_CRM_1761801450,
                raw: dealData
            };
        });
};