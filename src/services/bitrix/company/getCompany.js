const axios = require("axios");

module.exports = function getCompany(companyId) {
    return axios
        .post(`${process.env.BITRIX_WEBHOOK}crm.company.get?id=${companyId}`)
        .then(response => {
            const companyData = response.data.result;

            return {
                id: companyData.ID,
                title: companyData.TITLE,
                valorHora: companyData.UF_CRM_1761548403458,
                UF_CRM_1773391522: companyData.UF_CRM_1773391522, // Fatura em andamento
                raw: companyData
            };
        });
};