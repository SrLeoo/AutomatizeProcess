const axios = require("axios");
const getDeal = require("../../services/bitrix/deal/getDeal");
const getCompany = require("../../services/bitrix/company/getCompany");
const getInvoice = require("../../services/bitrix/invoice/getInvoice");
const listInvoices = require("../../services/bitrix/invoice/listInvoices");

module.exports = async function dealUpdate(body) {
    const dealId = body?.data?.FIELDS?.ID;

    if (!dealId) {
        return;
    }

    // Busca dados
    const mapDeal = await getDeal(dealId);
    const mapCompany = await getCompany(mapDeal.raw.COMPANY_ID);

    // Automação: Atualizar título do negócio com base na prioridade
    if (mapDeal.prioridade === "185") {
        if (!mapDeal.title.startsWith("♨️")) {
            const updatedTitle = `♨️ ${mapDeal.title}`;
            await axios.post(`${process.env.BITRIX_WEBHOOK}crm.deal.update`, {
                id: dealId,
                fields: {
                    TITLE: updatedTitle
                }
            });
        }
    } else {
        if (mapDeal.title.startsWith("♨️")) {
            const updatedTitle = mapDeal.title.replace("♨️ ", "");
            await axios.post(`${process.env.BITRIX_WEBHOOK}crm.deal.update`, {
                id: dealId,
                fields: {
                    TITLE: updatedTitle
                }
            });
        }
    }

    // Automação: Somar em fatura o tempo do negócio
    if (mapDeal.stageId === "WON") {
        const invoiceId = mapCompany?.UF_CRM_1773391522;

        if (!invoiceId) {
            console.log("Empresa não possui vínculo com fatura");
            return;
        }

        const invoice = await getInvoice(invoiceId);

        console.log("Nome da fatura vinculada:", invoice.title);
    }
};