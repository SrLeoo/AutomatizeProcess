const axios = require("axios");
const getDeal = require("../../services/bitrix/deal/getDeal");
const getCompany = require("../../services/bitrix/company/getCompany");
const getInvoice = require("../../services/bitrix/invoice/getInvoice");
const listInvoices = require("../../services/bitrix/invoice/listInvoices");

module.exports = async function dealUpdate(body) {
    const dealId = body?.data?.FIELDS?.ID;

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

        let invoiceIds = mapCompany?.UF_CRM_1773391522;

        if (!invoiceIds) {
            console.log("Empresa não possui vínculo com fatura");
            return;
        }

        // garante array
        if (!Array.isArray(invoiceIds)) {
            invoiceIds = [invoiceIds];
        }

        console.log("Faturas vinculadas:", invoiceIds);

        let invoiceEncontrada = null;

        for (const id of invoiceIds) {

            const invoice = await getInvoice(id);

            console.log("Verificando fatura:", invoice.id, invoice.stageId);

            if (invoice.stageId === "DT31_3:N") {
                invoiceEncontrada = invoice;
                break;
            }
        }

        if (!invoiceEncontrada) {
            console.log("Nenhuma fatura encontrada na fase correta");
            return;
        }

        console.log("Fatura correta:", invoiceEncontrada.title);

    }
};