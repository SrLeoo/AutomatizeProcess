const axios = require("axios");
const getInvoice = require("../../services/bitrix/invoice/getInvoice");
const getDeal = require("../../services/bitrix/deal/getDeal");

function sanitizePdfText(text) {
    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/[^\x20-\x7E]/g, "");
}

function buildSimplePdf(lines) {
    const safeLines = lines.map(sanitizePdfText);

    let y = 800;
    const lineHeight = 16;

    const contentLines = [
        "BT",
        "/F1 12 Tf",
        "50 800 Td"
    ];

    safeLines.forEach((line, index) => {
        if (index === 0) {
            contentLines.push(`(${line}) Tj`);
        } else {
            contentLines.push(`0 -${lineHeight} Td`);
            contentLines.push(`(${line}) Tj`);
        }
        y -= lineHeight;
    });

    contentLines.push("ET");

    const streamContent = contentLines.join("\n");
    const streamLength = Buffer.byteLength(streamContent, "utf8");

    const objects = [];

    objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
    objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
    objects.push(
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj"
    );
    objects.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj");
    objects.push(
        `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`
    );

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    for (const obj of objects) {
        offsets.push(Buffer.byteLength(pdf, "utf8"));
        pdf += obj + "\n";
    }

    const xrefOffset = Buffer.byteLength(pdf, "utf8");

    pdf += `xref
0 ${objects.length + 1}
0000000000 65535 f 
`;

    for (let i = 1; i < offsets.length; i++) {
        pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }

    pdf += `trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`;

    return Buffer.from(pdf, "utf8");
}

async function addPdfCommentToInvoice(invoiceId, fileName, pdfBuffer) {
    const base64File = pdfBuffer.toString("base64");

    return axios.post(`${process.env.BITRIX_WEBHOOK}crm.timeline.comment.add`, {
        fields: {
            ENTITY_ID: Number(invoiceId),
            ENTITY_TYPE: "DYNAMIC_31",
            COMMENT: "Status report em PDF gerado automaticamente.",
            FILES: [
                [fileName, base64File]
            ]
        }
    });
}

async function statusReport(invoiceId) {
    try {
        if (!invoiceId) {
            throw new Error("invoiceId não informado.");
        }

        const invoice = await getInvoice(invoiceId);

        let negocios = invoice.negocios || [];

        if (!Array.isArray(negocios)) {
            negocios = [negocios];
        }

        if (negocios.length === 0) {
            console.log(`Fatura ${invoiceId} não possui atividades vinculadas.`);
            return [];
        }

        const atividades = [];

        for (const dealId of negocios) {
            const deal = await getDeal(dealId);

            console.log(`Atividade ID: ${deal.id} | Título: ${deal.title}`);

            atividades.push({
                id: deal.id,
                title: deal.title
            });
        }

        const linhasPdf = [
            `Status Report - Fatura ${invoice.id}`,
            `Titulo da Fatura: ${invoice.title}`,
            `Data: ${new Date().toLocaleString("pt-BR")}`,
            " ",
            "Atividades:"
        ];

        for (const atividade of atividades) {
            linhasPdf.push(`ID: ${atividade.id} | Titulo: ${atividade.title}`);
        }

        const pdfBuffer = buildSimplePdf(linhasPdf);
        const fileName = `status-report-fatura-${invoice.id}.pdf`;

        await addPdfCommentToInvoice(invoice.id, fileName, pdfBuffer);

        console.log(`PDF gerado e anexado no comentário da fatura ${invoice.id}`);

        return atividades;
    } catch (error) {
        console.error(
            "Erro ao gerar status report:",
            error.response?.data || error.message
        );
        throw error;
    }
}

module.exports = statusReport;