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
        createdTime: invoiceData.createdTime,
        tempo: invoiceData.ufCrm_SMART_INVOICE_1772718146,
        negocios: invoiceData.ufCrm_SMART_INVOICE_1772717699,
        corPdf: invoiceData.ufCrm_SMART_INVOICE_1773404873927,
        opportunity: invoiceData.opportunity,
        raw: invoiceData
    };
};