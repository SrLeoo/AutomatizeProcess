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
        console.log("=== INICIO PROCESSO FATURA ===");
        console.log("mapDeal.stageId:", mapDeal.stageId);

        let invoiceIds = mapCompany?.UF_CRM_1773391522;
        console.log("invoiceIds iniciais:", invoiceIds);

        const executorId = Number(mapDeal.raw.UF_CRM_1773528146);
        console.log("executorId:", executorId);

        const tempoNegocio = Number(mapDeal.raw.UF_CRM_1769023570);
        console.log("tempoNegocio minutos:", tempoNegocio);

        if (!invoiceIds) {
            console.log("invoiceIds vazio - definindo array vazio");
            invoiceIds = [];
        }

        if (!Array.isArray(invoiceIds)) {
            console.log("invoiceIds nao era array - convertendo:", invoiceIds);
            invoiceIds = [invoiceIds];
        }

        console.log("Faturas vinculadas final:", invoiceIds);

        let invoiceEncontrada = null;
        console.log("Iniciando loop de invoices");

        for (const id of invoiceIds) {
            console.log("Verificando invoice ID:", id);
            const invoice = await getInvoice(id);
            console.log("invoice recebida - ID:", invoice.id, "stageId:", invoice.stageId, "assignedById:", invoice.assignedById);

            if (
                invoice.stageId === "DT31_3:N" &&
                Number(invoice.assignedById) === executorId
            ) {
                console.log("CRITERIOS ATENDIDOS - invoiceEncontrada:", invoice.id);
                invoiceEncontrada = invoice;
                break;
            } else {
                console.log("Critérios nao atendidos");
                console.log("  stageId esperado DT31_3:N atual:", invoice.stageId);
                console.log("  assignedById esperado:", executorId, "atual:", invoice.assignedById);
            }
        }

        console.log("invoiceEncontrada final:", invoiceEncontrada ? invoiceEncontrada.id : "NENHUMA");

        if (invoiceEncontrada) {
            console.log("ATUALIZANDO FATURA EXISTENTE");
            console.log("invoiceEncontrada completa:", invoiceEncontrada);

            let negocios = invoiceEncontrada.negocios || [];
            console.log("negocios originais:", negocios);

            if (!Array.isArray(negocios)) {
                console.log("negocios nao era array - convertendo:", negocios);
                negocios = [negocios];
            }

            const jaExiste = negocios.map(String).includes(String(dealId));
            console.log("jaExiste - dealId:", dealId, "existe:", jaExiste);

            if (jaExiste) {
                console.log("Negocio ja lancado na fatura:", invoiceEncontrada.id);
                console.log("FIM - JA EXISTE");
                return;
            }

            const tempoAntigo = Number(invoiceEncontrada.tempo || 0);
            console.log("tempoAntigo na fatura:", tempoAntigo);

            const novoTempo = tempoAntigo + tempoNegocio;
            console.log("novoTempo:", novoTempo, "=", tempoAntigo, "+", tempoNegocio);

            const novosNegocios = [...negocios, Number(dealId)];
            console.log("novosNegocios:", novosNegocios);

            const valorHora = Number(mapCompany.valorHora || 0);
            console.log("valorHora da empresa:", valorHora);

            const novoOpportunity = (novoTempo / 60) * valorHora;
            console.log("novoOpportunity:", novoOpportunity);
            console.log("formula: (", novoTempo, "/ 60) * ", valorHora, "=", novoOpportunity);

            const dadosUpdate = {
                ufCrm_SMART_INVOICE_1772718146: novoTempo,
                ufCrm_SMART_INVOICE_1772717699: novosNegocios,
                opportunity: novoOpportunity
            };
            console.log("Enviando updateInvoice:", dadosUpdate);

            await updateInvoice(invoiceEncontrada.id, dadosUpdate);
            console.log("Fatura atualizada:", invoiceEncontrada.id);
            console.log("FIM - FATURA ATUALIZADA");
            return;
        }

        console.log("CRIANDO NOVA FATURA");
        const valorHora = Number(mapCompany.valorHora || 0);
        console.log("valorHora nova fatura:", valorHora);

        const opportunityInicial = (tempoNegocio / 60) * valorHora;
        console.log("opportunityInicial:", opportunityInicial);
        console.log("formula: (", tempoNegocio, "/ 60) * ", valorHora, "=", opportunityInicial);

        const dadosNovaFatura = {
            title: `Fatura - ${mapCompany.title || mapCompany.companyTitle || "Empresa"}`,
            companyId: mapDeal.raw.COMPANY_ID,
            assignedById: executorId,
            dealId: dealId,
            tempo: tempoNegocio,
            opportunity: opportunityInicial
        };
        console.log("Enviando createInvoice:", dadosNovaFatura);

        const novaFatura = await createInvoice(dadosNovaFatura);
        console.log("Nova fatura criada ID:", novaFatura.id);

        let faturasEmpresa = mapCompany?.UF_CRM_1773391522 || [];
        console.log("faturasEmpresa originais:", faturasEmpresa);

        if (!Array.isArray(faturasEmpresa)) {
            console.log("faturasEmpresa nao era array - convertendo:", faturasEmpresa);
            faturasEmpresa = [faturasEmpresa];
        }

        faturasEmpresa = [...faturasEmpresa, Number(novaFatura.id)];
        console.log("faturasEmpresa atualizadas:", faturasEmpresa);

        await updateCompany(mapDeal.raw.COMPANY_ID, {
            UF_CRM_1773391522: faturasEmpresa
        });
        console.log("Empresa atualizada com nova fatura");
        console.log("FIM - NOVA FATURA CRIADA");
    }

};