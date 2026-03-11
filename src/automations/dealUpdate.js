const axios = require("axios");

module.exports = async function dealUpdate(body) {
console.log("===== DEBUG DEAL ID =====");

console.log("body:", body);

console.log("body.data:", body?.data);

console.log("body.data.FIELDS:", body?.data?.FIELDS);

console.log("body.data.FIELDS.ID:", body?.data?.FIELDS?.ID);

const dealId = body?.data?.FIELDS?.ID;

if (!dealId) {
  console.log("⚠️ DEAL ID NÃO VEIO NO WEBHOOK");
} else {
  console.log("✅ DEAL ID RECEBIDO:", dealId);
}

console.log("=========================");

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
