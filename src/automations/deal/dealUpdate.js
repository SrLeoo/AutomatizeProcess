const axios = require("axios");
const getDeal = require("../../services/bitrix/getDeal");

module.exports = function dealUpdate(body) {
    const dealId = body?.data?.FIELDS?.ID;
    if (!dealId) {
        return;
    }

    getDeal(dealId).then(map => {
        if (map.prioridade === "185") {
            if (!map.title.startsWith("♨️")) {
                const updatedTitle = `♨️ ${map.title}`;
                axios.post(`${process.env.BITRIX_WEBHOOK}crm.deal.update`, {
                    id: dealId,
                    fields: {
                        TITLE: updatedTitle
                    }
                });
            }

        } else {
            if (map.title.startsWith("♨️")) {
                const updatedTitle = map.title.replace("♨️ ", "");
                axios.post(`${process.env.BITRIX_WEBHOOK}crm.deal.update`, {
                    id: dealId,
                    fields: {
                        TITLE: updatedTitle
                    }
                });
            }
        }
    });
};