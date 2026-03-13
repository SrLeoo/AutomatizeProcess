const axios = require("axios");

module.exports = async function getInvoice(invoiceId) {
    if (Array.isArray(invoiceId)) {
        invoiceId = invoiceId[0];
    }

    invoiceId = Number(invoiceId);

    const response = await axios.post(`${process.env.BITRIX_WEBHOOK}crm.item.get`, {
        entityTypeId: 31,
        id: invoiceId
    });

    const invoiceData = response?.data?.result?.item;

    return {
        id: invoiceData.id,
        title: invoiceData.title,
        stageId: invoiceData.stageId,
        assignedById: invoiceData.assignedById,
        companyId: invoiceData.companyId,
        tempo: invoiceData.ufCrm_SMART_INVOICE_1772718146,
        negocios: invoiceData.ufCrm_SMART_INVOICE_1772717699,
        raw: invoiceData
    };
};