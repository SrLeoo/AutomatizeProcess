const axios = require("axios");

module.exports = async function createInvoice({ title, companyId, assignedById, dealId, tempo }) {
    const response = await axios.post(`${process.env.BITRIX_WEBHOOK}crm.item.add`, {
        entityTypeId: 31,
        fields: {
            title: title,
            companyId: Number(companyId),
            assignedById: Number(assignedById),
            stageId: "DT31_3:N",
            UF_CRM_SMART_INVOICE_1772717699: [Number(dealId)],
            UF_CRM_SMART_INVOICE_1772718146: Number(tempo)
        }
    });

    return response?.data?.result?.item;
};