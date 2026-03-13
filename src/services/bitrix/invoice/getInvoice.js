const axios = require("axios");

module.exports = function getInvoice(invoiceId) {
    return axios
        .post(`${process.env.BITRIX_WEBHOOK}crm.item.get`, {
            entityTypeId: 31,
            id: invoiceId
        })
        .then(response => {

            const invoiceData = response?.data?.result?.item;

            return {
                id: invoiceData.id,
                title: invoiceData.title,
                opportunity: invoiceData.opportunity,
                ufCrm_SMART_INVOICE_1773172847829: invoiceData.ufCrm_SMART_INVOICE_1773172847829,
                stageId: invoiceData.stageId,
                raw: invoiceData
            };

        });
};