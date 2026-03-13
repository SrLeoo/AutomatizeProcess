const axios = require("axios");

module.exports = async function getInvoice(invoiceId) {

    invoiceId = Number(invoiceId);

    const response = await axios.post(
        `${process.env.BITRIX_WEBHOOK}crm.item.get`,
        {
            entityTypeId: 31,
            id: invoiceId
        }
    );

    const item = response?.data?.result?.item;

    return {
        id: item?.id,
        title: item?.title,
        opportunity: item?.opportunity,
        stageId: item?.stageId,
        raw: item
    };
};