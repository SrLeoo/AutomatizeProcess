const getInvoice = require("../../services/bitrix/invoice/getInvoice");
const getDeal = require("../../services/bitrix/deal/getDeal");

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