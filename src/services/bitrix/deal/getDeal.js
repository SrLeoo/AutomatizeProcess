const axios = require("axios");

module.exports = function getDeal(dealId) {
    return axios
        .post(`${process.env.BITRIX_WEBHOOK}crm.deal.get?id=${dealId}`)
        .then(response => {
            const dealData = response.data.result;
            
            let status = "Em andamento";

            if (dealData.STAGE_ID === "WON") {
                status = "Finalizada";
            } else if (dealData.STAGE_ID === "LOSE") {
                status = "Declinada";
            }

            return {
                id: dealData.ID,
                title: dealData.TITLE,
                stageId: dealData.STAGE_ID,
                companyId: dealData.COMPANY_ID,
                prioridade: dealData.UF_CRM_1761801450,
                status: status,
                raw: dealData
            };
        });
};