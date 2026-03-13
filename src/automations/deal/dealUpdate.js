const axios = require("axios");
const getDeal = require("../../services/bitrix/getDeal");
const getCompany = require("../../services/bitrix/getCompany");

module.exports = async function dealUpdate(body) {
    const dealId = body?.data?.FIELDS?.ID;
    console.log("dealUpdate acionada para o negócio ID:", dealId);

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
        console.log("Titulo da empresa:", mapCompany.title);
    }
};