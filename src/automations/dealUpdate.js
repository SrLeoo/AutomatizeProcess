module.exports = async function dealUpdate(body) {
    const dealId = body?.data?.FIELDS?.ID;

    getDeal(dealId).then(map => {
        alterarPrioridade(map, dealId);
    });
};

function alterarPrioridade(map, dealId) {
    let updatedTitle = null;

    if (map.prioridade === "185") {
        if (!map.title.startsWith("♨️")) {
            updatedTitle = `♨️ ${map.title}`;
        }
    } else {
        if (map.title.startsWith("♨️")) {
            updatedTitle = map.title.replace("♨️ ", "");
        }
    }

    if (!updatedTitle) {
        return;
    }

    axios.post(`${process.env.BITRIX_WEBHOOK}crm.deal.update`, {
        id: dealId,
        fields: {
            TITLE: updatedTitle
        }
    });
}

function teste(map, dealId) {
    console.log({
        step: "DEBUG_AUTOMACAO",
        dealId: dealId,
        prioridade: map?.prioridade,
        title: map?.title
    });
}