const axios = require("axios");
const getDeal = require("../../services/bitrix/getDeal");
const sendNotification = require('../../automations/geral/notifications');

module.exports = async function dealUpdate(body) {
    const dealId = body?.data?.FIELDS?.ID;
    console.log("dealUpdate acionada para o negócio ID:", dealId);

    if (!dealId) {
        return;
    }

// Automação: Atualizar título do negócio com base na prioridade
    const map = await getDeal(dealId);

    if (map.prioridade === "185") {
        if (!map.title.startsWith("♨️")) {
            const updatedTitle = `♨️ ${map.title}`;
            await axios.post(`${process.env.BITRIX_WEBHOOK}crm.deal.update`, {
                id: dealId,
                fields: {
                    TITLE: updatedTitle
                }
            });
        }
    } else {
        if (map.title.startsWith("♨️")) {
            const updatedTitle = map.title.replace("♨️ ", "");
            await axios.post(`${process.env.BITRIX_WEBHOOK}crm.deal.update`, {
                id: dealId,
                fields: {
                    TITLE: updatedTitle
                }
            });
        }
    }

// Automação: Somar em fatura o tempo do negócio
    if (map.stageId === "WON") {
        const userId = 1;
        const message = "Negócio Att na fase ganho";

        await sendNotification(userId, message);
    }
};