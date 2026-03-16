const axios = require("axios");

const getInvoice = require("../../../services/bitrix/invoice/getInvoice");
const getDeal = require("../../../services/bitrix/deal/getDeal");
const getCompany = require("../../../services/bitrix/company/getCompany");

const generateReportHoursPdf = require("./template");

function formatDate(date) {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "-";
    }

    return d.toLocaleDateString("pt-BR");
}

function parseBitrixMoney(value) {
    if (!value) return 0;

    if (typeof value === "number") return value;

    if (typeof value === "string") {
        // Tenta múltiplos formatos do Bitrix
        const cleaned = value.toString().replace(/[^\d,.]/g, '');
        return Number(cleaned.replace(',', '.')) || 0;
    }

    return 0;
}

function isValidHexColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(String(color || "").trim());
}

function getPrimaryColor(color) {
    if (isValidHexColor(color)) {
        return String(color).trim();
    }

    return "#FFFFFF"; // Branco ao invés do azul feio
}

async function addPdfCommentToInvoice(invoiceId, pdfBuffer) {
    const base64 = pdfBuffer.toString("base64");

    await axios.post(`${process.env.BITRIX_WEBHOOK}crm.timeline.comment.add`, {
        fields: {
            ENTITY_ID: Number(invoiceId),
            ENTITY_TYPE: "SMART_INVOICE",
            COMMENT: "Relatório de horas gerado automaticamente.",
            FILES: [
                {
                    name: `Relatorio_Horas_${invoiceId}.pdf`,
                    content: base64
                }
            ]
        }
    });
}

module.exports = async function statusReport(invoiceId) {
    try {
        if (!invoiceId) {
            throw new Error("invoiceId não informado.");
        }

        const invoice = await getInvoice(invoiceId);
        const company = await getCompany(invoice.companyId);

        const empresaNome =
            company.title ||
            company.companyTitle ||
            "Empresa";

        const primaryColor = getPrimaryColor(invoice.corPdf); // Agora branco
        const valorDocumento = parseBitrixMoney(
            invoice.raw?.OPPORTUNITY_WITH_CURRENCY || 
            invoice.raw?.OPPORTUNITY || 
            0 // Fallback para 0 se não encontrar
        );

        console.log("DEBUG valorDocumento raw:", invoice.raw?.OPPORTUNITY_WITH_CURRENCY);
        console.log("DEBUG valorDocumento final:", valorDocumento);

        let negocios = invoice.negocios || [];

        if (!Array.isArray(negocios)) {
            negocios = [negocios];
        }

        const dados = [];
        let totalMinutos = 0;

        for (const dealId of negocios) {
            const deal = await getDeal(dealId);
            const tempo = Number(deal.raw?.UF_CRM_1769023570 || 0);

            dados.push({
                id: deal.id,
                titulo: deal.title,
                data: deal.raw?.DATE_CREATE,
                dataFormatada: formatDate(deal.raw?.DATE_CREATE),
                tempo
            });

            totalMinutos += tempo;
        }

        const totalAtividades = dados.length;

        const pdfBuffer = await generateReportHoursPdf({
            invoice,
            empresaNome,
            dados,
            totalMinutos,
            totalAtividades,
            valorDocumento,
            primaryColor
        });

        await addPdfCommentToInvoice(invoice.id, pdfBuffer);

        console.log("PDF gerado e anexado na fatura:", invoice.id);

        return {
            invoiceId: invoice.id,
            empresa: empresaNome,
            totalAtividades,
            totalMinutos,
            valorDocumento,
            corAplicada: primaryColor
        };
    } catch (error) {
        console.error(
            "Erro ao gerar status report:",
            error.response?.data || error.message
        );
        throw error;
    }
};
