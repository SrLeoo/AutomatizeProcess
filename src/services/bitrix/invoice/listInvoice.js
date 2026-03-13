const axios = require("axios");
const e = require("express");

module.exports = function listInvoice(filter = {}) {
    return axios
        .post(`${process.env.BITRIX_WEBHOOK}crm.item.list`, {
            entityTypeId: 31,
            filter: filter
        })

        .then(response => {
            const items = response.data.result.items || [];

            return items.map(invoice => ({
                id: invoice.id,
                title: invoice.title,
                opportunity: invoice.opportunity,
                companyId: invoice.companyId,
            }));

        });
};