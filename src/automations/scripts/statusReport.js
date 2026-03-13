const axios = require("axios");
const PDFDocument = require("pdfkit");

const getInvoice = require("../../services/bitrix/invoice/getInvoice");
const getDeal = require("../../services/bitrix/deal/getDeal");
const getCompany = require("../../services/bitrix/company/getCompany");

function formatDate(date) {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
}

function getPeriodo(date) {
    const d = new Date(date);
    const mes = d.toLocaleString("pt-BR", { month: "long" });
    const ano = d.getFullYear();
    return `${mes}/${ano}`;
}

function addHeader(doc, empresaNome) {
    doc
        .fontSize(16)
        .fillColor("#333333")
        .text(empresaNome, 50, 30);

    doc
        .moveTo(50, 55)
        .lineTo(550, 55)
        .strokeColor("#cccccc")
        .stroke();
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

        const negocios = Array.isArray(invoice.negocios)
            ? invoice.negocios
            : [invoice.negocios];

        let totalMinutos = 0;
        const dados = [];

        for (const dealId of negocios) {
            const deal = await getDeal(dealId);

            const tempo = Number(deal.raw?.UF_CRM_1769023570 || 0);

            dados.push({
                id: dealId,
                titulo: deal.title,
                data: deal.raw?.DATE_CREATE,
                fase: deal.stageId,
                tempo
            });

            totalMinutos += tempo;
        }

        // ================= PDF =================

        const doc = new PDFDocument({ margin: 50 });

        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));

        doc.on("pageAdded", () => {
            addHeader(doc, empresaNome);
        });

        addHeader(doc, empresaNome);

        doc.moveDown(2);

        doc
            .fontSize(22)
            .fillColor("#000000")
            .text("Relatório de Horas", {
                align: "center"
            });

        doc.moveDown();

        doc.fontSize(12).text(`Fatura ID: ${invoiceId}`);
        doc.text(`Empresa: ${empresaNome}`);
        doc.text(`Período: ${getPeriodo(invoice.createdTime)}`);

        doc.moveDown(2);

        // ====== tabela ======

        doc
            .fontSize(12)
            .fillColor("#000000")
            .text("ID", 50)
            .text("Atividade", 100)
            .text("Data", 300)
            .text("Tempo", 380)
            .text("Status", 450);

        doc
            .moveTo(50, doc.y + 5)
            .lineTo(550, doc.y + 5)
            .stroke();

        doc.moveDown();

        dados.forEach(item => {
            doc
                .fontSize(10)
                .text(item.id, 50)
                .text(item.titulo, 100, doc.y - 12, { width: 180 })
                .text(formatDate(item.data), 300)
                .text(`${item.tempo} min`, 380)
                .text(item.fase, 450);

            doc.moveDown();
        });

        doc.moveDown();

        doc
            .fontSize(14)
            .fillColor("#000000")
            .text(`Total de Horas: ${(totalMinutos / 60).toFixed(2)} h`, {
                align: "right"
            });

        doc.end();

        const pdfBuffer = await new Promise(resolve => {
            doc.on("end", () => {
                resolve(Buffer.concat(buffers));
            });
        });

        const base64 = pdfBuffer.toString("base64");

        // ========= envia comentário =========

        await axios.post(`${process.env.BITRIX_WEBHOOK}crm.timeline.comment.add`, {
            fields: {
                ENTITY_ID: invoiceId,
                ENTITY_TYPE: "SMART_INVOICE",
                COMMENT: "📄 Relatório de horas gerado automaticamente.",
                FILES: [
                    {
                        name: `Relatorio_Horas_${invoiceId}.pdf`,
                        content: base64
                    }
                ]
            }
        });

        console.log("PDF gerado e anexado na fatura:", invoiceId);

    } catch (error) {
        console.error(
            "Erro ao gerar status report:",
            error.response?.data || error.message
        );
    }
};