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


function isValidHexColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(String(color || "").trim());
}

function getPrimaryColor(color) {
    if (isValidHexColor(color)) {
        return String(color).trim();
    }

    return "#FFFFFF";
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

        const primaryColor = getPrimaryColor(invoice.corPdf);
        
        const valorDocumento = Number(invoice.opportunity || 0);

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
