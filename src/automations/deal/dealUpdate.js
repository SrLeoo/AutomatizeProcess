const axios = require("axios");
const getDeal = require("../../services/bitrix/deal/getDeal");
const getCompany = require("../../services/bitrix/company/getCompany");
const getInvoice = require("../../services/bitrix/invoice/getInvoice");
const updateInvoice = require("../../services/bitrix/invoice/updateInvoice");
const createInvoice = require("../../services/bitrix/invoice/createInvoice");
const updateCompany = require("../../services/bitrix/company/updateCompany");

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

        let invoiceIds = mapCompany?.UF_CRM_1773391522;
        const executorId = Number(mapDeal.raw.UF_CRM_1761287067);
        const tempoNegocio = Number(mapDeal.raw.UF_CRM_1769023570 || 0);

        if (!invoiceIds) {
            invoiceIds = [];
        }

        // garante array
        if (!Array.isArray(invoiceIds)) {
            invoiceIds = [invoiceIds];
        }

        console.log("Faturas vinculadas:", invoiceIds);

        let invoiceEncontrada = null;

        for (const id of invoiceIds) {
            const invoice = await getInvoice(id);

            console.log("Verificando fatura:", invoice.id, invoice.stageId, invoice.assignedById);

            if (
                invoice.stageId === "DT31_3:N" &&
                Number(invoice.assignedById) === executorId
            ) {
                invoiceEncontrada = invoice;
                break;
            }
        }

        if (invoiceEncontrada) {
            let negocios = invoiceEncontrada.negocios || [];

            if (!Array.isArray(negocios)) {
                negocios = [negocios];
            }

            const jaExiste = negocios.map(String).includes(String(dealId));

            if (jaExiste) {
                console.log("Negócio já lançado na fatura:", invoiceEncontrada.id);
                return;
            }

            const novoTempo = Number(invoiceEncontrada.tempo || 0) + tempoNegocio;
            const novosNegocios = [...negocios, Number(dealId)];

            await updateInvoice(invoiceEncontrada.id, {
                ufCrm_SMART_INVOICE_1772718146: novoTempo,
                ufCrm_SMART_INVOICE_1772717699: novosNegocios
            });
            
            console.log("Fatura atualizada:", invoiceEncontrada.id);
            return;
        }

        const novaFatura = await createInvoice({
            title: `Fatura - ${mapCompany.title || mapCompany.companyTitle || "Empresa"}`,
            companyId: mapDeal.raw.COMPANY_ID,
            assignedById: executorId,
            dealId: dealId,
            tempo: tempoNegocio
        });

        let faturasEmpresa = mapCompany?.UF_CRM_1773391522 || [];

        if (!Array.isArray(faturasEmpresa)) {
            faturasEmpresa = [faturasEmpresa];
        }

        faturasEmpresa = [...faturasEmpresa, Number(novaFatura.id)];

        await updateCompany(mapDeal.raw.COMPANY_ID, {
            UF_CRM_1773391522: faturasEmpresa
        });

        console.log("Nova fatura criada:", novaFatura.id);
    }
};