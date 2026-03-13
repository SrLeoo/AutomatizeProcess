const axios = require("axios");

module.exports = function getCompany(companyId) {
    return axios
        .post(`${process.env.BITRIX_WEBHOOK}crm.company.get?id=${companyId}`)
        .then(response => {
            const companyData = response.data.result;

            const valorHoraBruto = companyData.UF_CRM_1761290484552;
            const valorHora = valorHoraBruto
                ? Number(String(valorHoraBruto).split("|")[0])
                : 0;

            return {
                id: companyData.ID,
                title: companyData.TITLE,
                valorHora: valorHora,
                UF_CRM_1773391522: companyData.UF_CRM_1773391522,
                raw: companyData
            };
        });
};