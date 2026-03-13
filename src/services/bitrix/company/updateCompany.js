const axios = require("axios");

module.exports = async function updateCompany(companyId, fields) {
    return axios.post(`${process.env.BITRIX_WEBHOOK}crm.company.update`, {
        id: Number(companyId),
        fields
    });
};