const axios = require("axios");

module.exports = async function dealUpdate(body) {
const dealId = body?.data?.FIELDS?.ID;

    axios.get(`${process.env.BITRIX_WEBHOOK}crm.deal.get?ID=${dealId}`)
        .then(response => {
            const dealData = response.data.result;

            const title = dealData.TITLE;
            const UF_CRM_1761801450 = dealData.UF_CRM_1761801450;

            if (UF_CRM_1761801450 === "185") {
                if (title.startsWith("♨️")) {
                    if (UF_CRM_1761801450 != "185") {
                        const updatedTitle = title.replace("♨️ ", "");
                        axios.post(`${process.env.BITRIX_WEBHOOK}crm.deal.update`, {
                            ID: dealId,
                            fields: {
                                TITLE: updatedTitle
                            }
                        });
                    }
                }
                const updatedTitle = `♨️ ${title}`;
                axios.post(`${process.env.BITRIX_WEBHOOK}crm.deal.update`, {
                    ID: dealId,
                    fields: {
                        TITLE: updatedTitle
            }
          }
        );

      }

    });
}
function mapDeal(dealData) {
    return {
        id: dealData.ID,
        title: dealData.TITLE,
        temperatura: dealData.UF_CRM_1761801450,
        raw: dealData
    };
}
