const axios = require("axios");
const getDeal = require("../../services/bitrix/getDeal");

module.exports = function invoiceUpdate(body) {
    const invoiceId = body?.data?.FIELDS?.ID;
    if (!invoiceId) {
        return;
    }
}