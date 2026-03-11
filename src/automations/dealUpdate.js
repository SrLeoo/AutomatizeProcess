const axios = require("axios");

module.exports = async function dealUpdate(body) {
    const dealId = body.data.ID;

    axios.get(`${process.env.BITRIX_WEBHOOK}crm.deal.get?ID=${dealId}`)
        .then(response => {
            const dealData = response.data.result;

            const title = dealData.TITLE;
            const UF_CRM_1761801450 = dealData.UF_CRM_1761801450;

            if (UF_CRM_1761801450 === "185") {
                if (title.startsWith("♨️")) {
                    console.log("Caiu aq ó")
                    return;
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
};
