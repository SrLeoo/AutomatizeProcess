const axios = require("axios");

function getDeal(dealId) {
    return axios
        .get(`${process.env.BITRIX_WEBHOOK}crm.deal.get?id=${dealId}`)
        .then(response => {
            const dealData = response.data.result;

            return {
                id: dealData.ID,
                title: dealData.TITLE,
                prioridade: dealData.UF_CRM_1761801450
            };
        });
}

module.exports = async function dealUpdate(body) {
    const dealId = body?.data?.FIELDS?.ID;

    getDeal(dealId).then(map => {
        if (map.prioridade === "185") {
            if (!map.title.startsWith("♨️")) {
                // console.log("Adicionando prioridade negócio:", dealId);
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
                // console.log("Removendo prioridade negócio:", dealId);
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