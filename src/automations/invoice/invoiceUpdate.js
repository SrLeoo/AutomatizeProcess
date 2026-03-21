const axios = require("axios");
const getInvoice = require("../../services/bitrix/invoice/getInvoice");

module.exports = function invoiceUpdate(body) {
    const invoiceId = body?.data?.FIELDS?.ID;
    if (!invoiceId) {
        return;
    }
}
