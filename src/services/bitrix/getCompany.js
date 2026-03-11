const axios = require("axios");

module.exports = function getCompany(companyId) {
    return axios
        .get(`${process.env.BITRIX_WEBHOOK}crm.company.get?id=${companyId}`)
        .then(response => {
            const companyData = response.data.result;

            return {
                id: companyData.ID,
                title: companyData.TITLE,
                raw: companyData
            };
        });
};