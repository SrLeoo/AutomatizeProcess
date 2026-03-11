const axios = require("axios");

module.exports = function invoiceUpdate(invoiceId) {
    return axios
        .get(`${process.env.BITRIX_WEBHOOK}crm.item.get?id=${invoiceId}&entityTypeId=31`)
        .then(response => {
            const invoiceData = response.data.result;

            return {
                id: invoiceData.ID,
                title: invoiceData.TITLE,
                opportunity: invoiceData.OPPORTUNITY,
                ufCrm_SMART_INVOICE_1773172847829: invoiceData.UF_CRM_SMART_INVOICE_1773172847829,
                
            };
            
        }
    );
};