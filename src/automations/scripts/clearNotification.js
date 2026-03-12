const axios = require("axios");

async function clearNotifications() {
    try {
        // 1. Lista todas as notificações do usuário
        const listResponse = await axios.get(
            `${process.env.BITRIX_WEBHOOK}im.notify.get`
        );

        const notifications = listResponse.data.result || [];
        console.log(`Encontradas ${notifications.length} notificações`);

        if (notifications.length === 0) {
            return { message: "Nenhuma notificação encontrada" };
        }
    } catch (error) {
        console.error(
            "Erro ao listar notificações:",
            error.response?.data || error.message
        );
        throw error;
    }
}

module.exports = clearNotifications;