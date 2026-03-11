const axios = require("axios");
const getDeal = require("../../services/bitrix/getInvoice");

module.exports = function invoiceUpdate(body) {
    const invoiceId = body?.data?.FIELDS?.ID;
    if (!invoiceId) {
        return;
    }
}