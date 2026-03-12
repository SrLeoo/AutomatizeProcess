const axios = require("axios");

async function clearNotifications() {
    try {

        const response = await axios.post(
            `${process.env.BITRIX_WEBHOOK}im.notify.delete`,
            {
                TAG: "SYSTEM_EVENT_42"
            }
        );

        console.log("Notificação removida com TAG");

        return response.data;

    } catch (error) {

        console.error(
            "Erro ao remover notificação:",
            error.response?.data || error.message
        );

        throw error;
    }
}

module.exports = clearNotifications;