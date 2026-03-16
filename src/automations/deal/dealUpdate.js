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

    // Automação: Somar valor em negócio
        const tempo = Number(mapDeal.raw.UF_CRM_1769023570 || 0);
        const valorHora = Number(mapCompany.valorHora || 0);
        
        if (tempo > 0 && valorHora > 0) {  
            const opportunity = (tempo / 60) * valorHora;
            console.log(`Deal ${dealId}: ${tempo}min = R$ ${opportunity.toFixed(2)}`);

        await axios.post(`${process.env.BITRIX_WEBHOOK}crm.deal.update`, {
            id: dealId,
            fields: {
                OPPORTUNITY: opportunity
            }
        });
    }

    // Automação: Somar em fatura o tempo do negócio
    if (mapDeal.stageId === "WON") {
        let invoiceIds = mapCompany?.UF_CRM_1773391522;
        const executorId = Number(mapDeal.raw.UF_CRM_1773528146);
        const tempoNegocio = Number(mapDeal.raw.UF_CRM_1769023570);

        if (!invoiceIds) {
            console.log("invoiceIds vazio - definindo array vazio");
            invoiceIds = [];
        }

        if (!Array.isArray(invoiceIds)) {
            console.log("invoiceIds nao era array - convertendo:", invoiceIds);
            invoiceIds = [invoiceIds];
        }

        let invoiceEncontrada = null;

        for (const id of invoiceIds) {
            const invoice = await getInvoice(id);
            console.log("invoice recebida - ID:", invoice.id, "stageId:", invoice.stageId, "assignedById:", invoice.assignedById);

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

                return;
            }

            const tempoAntigo = Number(invoiceEncontrada.tempo || 0);
            // console.log("tempoAntigo na fatura:", tempoAntigo);

            const novoTempo = tempoAntigo + tempoNegocio;
            // console.log("novoTempo:", novoTempo, "=", tempoAntigo, "+", tempoNegocio);

            const novosNegocios = [...negocios, Number(dealId)];
            // console.log("novosNegocios:", novosNegocios);

            const valorHora = Number(mapCompany.valorHora || 0);
            // console.log("valorHora da empresa:", valorHora);

            const novoOpportunity = (novoTempo / 60) * valorHora;
            // console.log("novoOpportunity:", novoOpportunity);
            // console.log("formula: (", novoTempo, "/ 60) * ", valorHora, "=", novoOpportunity);

            const dadosUpdate = {
                ufCrm_SMART_INVOICE_1772718146: novoTempo,
                ufCrm_SMART_INVOICE_1772717699: novosNegocios,
                opportunity: novoOpportunity
            };
            // console.log("Enviando updateInvoice:", dadosUpdate);

            await updateInvoice(invoiceEncontrada.id, dadosUpdate);
            // console.log("Fatura atualizada:", invoiceEncontrada.id);
            // console.log("FIM - FATURA ATUALIZADA");
            return;
        }

        const valorHora = Number(mapCompany.valorHora || 0);
        // console.log("valorHora nova fatura:", valorHora);

        const opportunityInicial = (tempoNegocio / 60) * valorHora;
        // console.log("opportunityInicial:", opportunityInicial);
        // console.log("formula: (", tempoNegocio, "/ 60) * ", valorHora, "=", opportunityInicial);

        const dadosNovaFatura = {
            title: `Fatura - ${mapCompany.title || mapCompany.companyTitle || "Empresa"}`,
            companyId: mapDeal.raw.COMPANY_ID,
            assignedById: executorId,
            dealId: dealId,
            tempo: tempoNegocio,
            opportunity: opportunityInicial
        };
        // console.log("Enviando createInvoice:", dadosNovaFatura);

        const novaFatura = await createInvoice(dadosNovaFatura);
        // console.log("Nova fatura criada ID:", novaFatura.id);

        let faturasEmpresa = mapCompany?.UF_CRM_1773391522 || [];
        // console.log("faturasEmpresa originais:", faturasEmpresa);

        if (!Array.isArray(faturasEmpresa)) {
            // console.log("faturasEmpresa nao era array - convertendo:", faturasEmpresa);
            faturasEmpresa = [faturasEmpresa];
        }

        faturasEmpresa = [...faturasEmpresa, Number(novaFatura.id)];
        // console.log("faturasEmpresa atualizadas:", faturasEmpresa);

        await updateCompany(mapDeal.raw.COMPANY_ID, {
            UF_CRM_1773391522: faturasEmpresa
        });
        // console.log("Empresa atualizada com nova fatura");
    }

};