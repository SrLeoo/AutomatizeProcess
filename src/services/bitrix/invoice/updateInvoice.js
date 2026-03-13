const axios = require("axios");

module.exports = async function updateInvoice(invoiceId, fields) {
    return axios.post(`${process.env.BITRIX_WEBHOOK}crm.item.update`, {
        entityTypeId: 31,
        id: Number(invoiceId),
        fields: {
            ufCrm_SMART_INVOICE_1772718146: fields.ufCrm_SMART_INVOICE_1772718146,
            ufCrm_SMART_INVOICE_1772717699: fields.ufCrm_SMART_INVOICE_1772717699,
            opportunity: fields.opportunity
        }
    });
};