const axios = require("axios");

async function clearNotifications() {
    try {
        // 1. Lista todas as notificações do usuário
        const listResponse = await axios.get(
            `${process.env.BITRIX_WEBHOOK}im.notify.get`
        );

        const result = listResponse.data.result;
        const notifications = result.notifications || [];
        console.log(`Encontradas ${notifications.length} notificações`);

        if (notifications.length === 0) {
            return { message: "Nenhuma notificação encontrada" };
        }

        // 2. Deleta todas por ID
        let deletedCount = 0;
        for (const notif of notifications) {
            await axios.post(
                `${process.env.BITRIX_WEBHOOK}im.notify.delete`,
                { ID: notif.id }
            );
            deletedCount++;
            console.log(`Deletada ${deletedCount}: ID ${notif.id}`);
        }

        return { message: `Deletadas ${deletedCount} notificações` };

    } catch (error) {
        console.error(
            "Erro ao limpar notificações:",
            error.response?.data || error.message
        );
        throw error;
    }
}

module.exports = clearNotifications;
