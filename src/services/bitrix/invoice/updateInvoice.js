const axios = require("axios");

module.exports = async function updateInvoice(invoiceId, fields) {
    return axios.post(`${process.env.BITRIX_WEBHOOK}crm.item.update`, {
        entityTypeId: 31,
        id: Number(invoiceId),
        fields
    });
};