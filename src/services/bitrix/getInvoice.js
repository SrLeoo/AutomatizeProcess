const axios = require("axios");

module.exports = function getDeal(dealId) {
    return axios
        .get(`${process.env.BITRIX_WEBHOOK}crm.item.get?id=${dealId}&entityTypeId=31`)
        .then(response => {
            const invoiceData = response.data.result;
            console.log("Dados da fatura:", invoiceData);
            return {
                id: invoiceData.ID,
                title: invoiceData.TITLE,
                opportunity: invoiceData.OPPORTUNITY,
                
            };
            
        }
    );
};