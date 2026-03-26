const axios = require("axios");
// const notification = require('../../automations/geral/notifications');
const getQuote = require("../../services/bitrix/quote/getQuote");
const currentTime = require('../../automations/geral/currentTime');

module.exports = async function quoteAdd(body) {
    const quoteId = body?.data?.FIELDS?.ID;

    const mapQuote = await getQuote(quoteId);
   if (!mapQuote.raw.UF_CRM_QUOTE_1774523353129) {
        const currentTime = currentTime();
        await axios.post(`${process.env.BITRIX_WEBHOOK}crm.quote.update`, {
            id: quoteId,
            fields: {
                UF_CRM_QUOTE_1774540648: currentTime()
            }
        });
    }

}
