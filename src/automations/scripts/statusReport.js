const axios = require("axios");
const PDFDocument = require("pdfkit");

const getInvoice = require("../../services/bitrix/invoice/getInvoice");
const getDeal = require("../../services/bitrix/deal/getDeal");
const getCompany = require("../../services/bitrix/company/getCompany");

function formatDate(date) {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "-";
    }

    return d.toLocaleDateString("pt-BR");
}
l

function getPeriodo(date) {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "-";
    }

    const mes = d.toLocaleString("pt-BR", { month: "long" });
    const ano = d.getFullYear();

    return `${mes.charAt(0).toUpperCase() + mes.slice(1)}/${ano}`;
}

function formatHours(minutes) {
    return `${(Number(minutes || 0) / 60).toFixed(2)} h`;
}

function isValidHexColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(String(color || "").trim());
}

function getPrimaryColor(color) {
    if (isValidHexColor(color)) {
        return String(color).trim();
    }

    return "#2563EB";
}

function drawHeader(doc, empresaNome, primaryColor) {
    const pageWidth = doc.page.width;
    const margin = 50;

    doc
        .rect(0, 0, pageWidth, 95)
        .fill(primaryColor);

    doc
        .fillColor("#FFFFFF")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("Relatório de Horas", margin, 26, {
            width: pageWidth - margin * 2,
            align: "left"
        });

    doc
        .fillColor("#EAF2FF")
        .fontSize(11)
        .font("Helvetica")
        .text(empresaNome, margin, 58, {
            width: pageWidth - margin * 2,
            align: "left"
        });

    doc.y = 120;
}

function drawSummaryCard(doc, invoice, empresaNome, totalMinutos, primaryColor) {
    const x = 50;
    const y = doc.y;
    const w = 495;
    const h = 105;

    doc
        .roundedRect(x, y, w, h, 10)
        .fill("#F8FAFC");

    doc
        .lineWidth(1)
        .strokeColor("#E2E8F0")
        .roundedRect(x, y, w, h, 10)
        .stroke();

    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Resumo", x + 20, y + 15);

    doc
        .fillColor("#334155")
        .font("Helvetica")
        .fontSize(10)
        .text(`Fatura ID: ${invoice.id}`, x + 20, y + 40)
        .text(`Empresa: ${empresaNome}`, x + 20, y + 58)
        .text(`Período: ${getPeriodo(invoice.createdTime)}`, x + 20, y + 76);

    doc
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(22)
        .text(formatHours(totalMinutos), x + 325, y + 42, {
            width: 150,
            align: "right"
        });

    doc
        .fillColor("#64748B")
        .font("Helvetica")
        .fontSize(10)
        .text("Total de horas", x + 325, y + 72, {
            width: 150,
            align: "right"
        });

    doc.y = y + h + 25;
}

function drawTableHeader(doc, y, primaryColor) {
    doc
        .roundedRect(50, y, 495, 28, 6)
        .fill(primaryColor);

    doc
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Data", 65, y + 9, { width: 80 })
        .text("Title", 155, y + 9, { width: 270 })
        .text("Tempo", 445, y + 9, { width: 80, align: "right" });

    return y + 40;
}

function drawRow(doc, item, y, index) {
    const rowHeight = 42;
    const bgColor = index % 2 === 0 ? "#F8FAFC" : "#EEF4FF";

    doc
        .roundedRect(50, y, 495, rowHeight, 6)
        .fill(bgColor);

    doc
        .fillColor("#0F172A")
        .font("Helvetica")
        .fontSize(10)
        .text(item.dataFormatada, 65, y + 14, { width: 80 })
        .text(item.titulo, 155, y + 10, {
            width: 270,
            height: rowHeight - 8,
            ellipsis: true
        })
        .text(`${item.tempo} min`, 445, y + 14, {
            width: 80,
            align: "right"
        });

    return y + rowHeight + 8;
}

async function addPdfCommentToInvoice(invoiceId, pdfBuffer) {
    const base64 = pdfBuffer.toString("base64");

    await axios.post(`${process.env.BITRIX_WEBHOOK}crm.timeline.comment.add`, {
        fields: {
            ENTITY_ID: Number(invoiceId),
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

        let negocios = invoice.negocios || [];

        if (!Array.isArray(negocios)) {
            negocios = [negocios];
        }

        const dados = [];
        let totalMinutos = 0;

        for (const dealId of negocios) {
            const deal = await getDeal(dealId);
            const tempo = Number(deal.raw?.UF_CRM_1769023570 || 0);

            console.log(`Atividade ID: ${deal.id} | Título: ${deal.title}`);

            dados.push({
                id: deal.id,
                titulo: deal.title,
                data: deal.raw?.DATE_CREATE,
                dataFormatada: formatDate(deal.raw?.DATE_CREATE),
                tempo
            });

            totalMinutos += tempo;
        }

        const doc = new PDFDocument({
            margin: 50,
            size: "A4"
        });

        const buffers = [];
        doc.on("data", chunk => buffers.push(chunk));

        drawHeader(doc, empresaNome, primaryColor);
        drawSummaryCard(doc, invoice, empresaNome, totalMinutos, primaryColor);

        let currentY = drawTableHeader(doc, doc.y, primaryColor);

        dados.forEach((item, index) => {
            if (currentY > 740) {
                doc.addPage();
                drawHeader(doc, empresaNome, primaryColor);
                currentY = drawTableHeader(doc, doc.y, primaryColor);
            }

            currentY = drawRow(doc, item, currentY, index);
        });

        doc.end();

        const pdfBuffer = await new Promise((resolve, reject) => {
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", reject);
        });

        await addPdfCommentToInvoice(invoice.id, pdfBuffer);

        console.log("PDF gerado e anexado na fatura:", invoice.id);

        return {
            invoiceId: invoice.id,
            empresa: empresaNome,
            totalAtividades: dados.length,
            totalMinutos,
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