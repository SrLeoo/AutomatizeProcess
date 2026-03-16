const PDFDocument = require("pdfkit");


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


function formatHoursNumber(minutes) {
    return (Number(minutes || 0) / 60).toFixed(2);
}


function formatMoney(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(Number(value || 0));
}


function drawHeader(doc, empresaNome, primaryColor, invoiceId) {
    const pageWidth = doc.page.width;
    const margin = 50;

    // Header background
    doc
        .rect(0, 0, pageWidth, 95)
        .fill(primaryColor);

    // Título do relatório - CORRIGIDO: cor branca
    doc
        .fillColor("#FFFFFF")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("Relatório de Horas", margin, 26, {
            width: pageWidth - margin * 2 - 130,
            align: "left"
        });

    // Nome da empresa - CORRIGIDO: cor mais clara
    doc
        .fillColor("#E2E8F0")
        .fontSize(11)
        .font("Helvetica")
        .text(empresaNome, margin, 58, {
            width: pageWidth - margin * 2 - 130,
            align: "left"
        });

    // Badge da fatura
    const badgeWidth = 110;
    const badgeHeight = 38;
    const badgeX = pageWidth - margin - badgeWidth;
    
    doc
        .roundedRect(badgeX, 22, badgeWidth, badgeHeight, 8)
        .fill("#10B981");

    doc
        .fillColor("#FFFFFF")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`Fatura #${invoiceId}`, badgeX, 35, {
            width: badgeWidth,
            align: "center"
        });

    doc.y = 120;
}


function drawCard(doc, x, y, w, h) {
    doc
        .roundedRect(x, y, w, h, 10)
        .fill("#F8FAFC");

    doc
        .lineWidth(1)
        .strokeColor("#E2E8F0")
        .roundedRect(x, y, w, h, 10)
        .stroke();
}


function drawSummaryCards(doc, invoice, totalMinutos, totalAtividades, valorDocumento) {
    const startX = 50;
    const y = doc.y;
    const gap = 15;
    const cardWidth = 155;
    const cardHeight = 120;

    const mediaMinutos = totalAtividades > 0 ? totalMinutos / totalAtividades : 0;

    drawCard(doc, startX, y, cardWidth, cardHeight);
    drawCard(doc, startX + cardWidth + gap, y, cardWidth, cardHeight);
    drawCard(doc, startX + (cardWidth + gap) * 2, y, cardWidth, cardHeight);

    // Card 1 - Período de Faturamento
    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Período de Faturamento", startX + 15, y + 18);

    doc
        .fillColor("#334155")
        .font("Helvetica")
        .fontSize(10)
        .text(getPeriodo(invoice.createdTime), startX + 15, y + 48)
        .text(`Emissão: ${new Date(invoice.createdTime).toLocaleDateString("pt-BR")}`, startX + 15, y + 70);

    // Card 2 - Atividades - CORRIGIDO: posições Y mais para baixo
    const card2X = startX + cardWidth + gap;

    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Atividades", card2X + 15, y + 18);

    // Ajustado: começando em y + 50 (mais para baixo)
    doc
        .fillColor("#1E293B")
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(`${totalAtividades}`, card2X + 15, y + 50, { continued: true })
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#475569")
        .text(" atividades");

    doc
        .fillColor("#1E293B")
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(`${formatHoursNumber(mediaMinutos)} h`, card2X + 15, y + 72, { continued: true })
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#475569")
        .text(" média por atividade");

    doc
        .fillColor("#1E293B")
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(`${formatHoursNumber(totalMinutos)} h`, card2X + 15, y + 94, { continued: true })
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#475569")
        .text(" total de horas");

    // Card 3 - A receber
    const card3X = startX + (cardWidth + gap) * 2;

    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("A receber", card3X + 15, y + 18);

    doc
        .fillColor("#0F766E")
        .font("Helvetica-Bold")
        .fontSize(22)
        .text(formatMoney(valorDocumento), card3X + 15, y + 52);

    doc
        .fillColor("#475569")
        .font("Helvetica")
        .fontSize(10)
        .text("Valor do documento", card3X + 15, y + 86);

    doc.y = y + cardHeight + 25;
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
        .text("Título", 155, y + 9, { width: 270 })
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


function drawTotalFooter(doc, y, totalMinutos) {
    doc
        .roundedRect(50, y, 495, 34, 0)
        .fill("#F8FAFC");

    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Total:", 410, y + 11, {
            width: 50,
            align: "right"
        });

    doc
        .text(formatHours(totalMinutos), 465, y + 11, {
            width: 60,
            align: "right"
        });

    return y + 50;
}


function drawObservacoes(doc, y, valorDocumento) {
    doc
        .roundedRect(50, y, 495, 110, 8)
        .fill("#F8FAFC");

    doc
        .lineWidth(1)
        .strokeColor("#DCE7F3")
        .roundedRect(50, y, 495, 110, 8)
        .stroke();

    doc
        .fillColor("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Observações", 65, y + 16);

    doc
        .fillColor("#334155")
        .font("Helvetica")
        .fontSize(10)
        .text(
            `Relatório de horas referente aos serviços prestados no período informado. Valor total do documento: ${formatMoney(valorDocumento)}.`,
            65,
            y + 42,
            {
                width: 455,
                lineGap: 4
            }
        );
}


module.exports = async function generateReportHoursPdf({
    invoice,
    empresaNome,
    dados,
    totalMinutos,
    totalAtividades,
    valorDocumento,
    primaryColor
}) {
    const doc = new PDFDocument({
        margin: 50,
        size: "A4"
    });

    const buffers = [];
    doc.on("data", chunk => buffers.push(chunk));

    drawHeader(doc, empresaNome, primaryColor, invoice.id);
    drawSummaryCards(doc, invoice, totalMinutos, totalAtividades, valorDocumento);

    let currentY = drawTableHeader(doc, doc.y, primaryColor);

    dados.forEach((item, index) => {
        if (currentY > 700) {
            doc.addPage();
            drawHeader(doc, empresaNome, primaryColor, invoice.id);
            currentY = drawTableHeader(doc, doc.y, primaryColor);
        }

        currentY = drawRow(doc, item, currentY, index);
    });

    currentY = drawTotalFooter(doc, currentY, totalMinutos);

    if (currentY > 680) {
        doc.addPage();
        drawHeader(doc, empresaNome, primaryColor, invoice.id);
        currentY = doc.y;
    }

    drawObservacoes(doc, currentY, valorDocumento);

    doc.end();

    return await new Promise((resolve, reject) => {
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);
    });
};
