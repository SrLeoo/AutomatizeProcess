const axios = require("axios");
const sendNotification = require('../../automations/geral/notifications');

async function clearNotifications() {
    try {
        const listResponse = await axios.get(
            `${process.env.BITRIX_WEBHOOK}im.notify.get`
        );

        const result = listResponse.data.result;
        const notifications = result.notifications || [];
        // console.log(`Encontradas ${notifications.length} notificações`);

        if (notifications.length === 0) {
            const userId = 1;
            const message = "Nenhuma notificação encontrada para deletar.";
            await sendNotification(userId, message);
            return;
        }

        // 2. Deleta todas por ID
        let deletedCount = 0;
        for (const notif of notifications) {
            await axios.post(
                `${process.env.BITRIX_WEBHOOK}im.notify.delete`,
                { ID: notif.id }
            );
            deletedCount++;
            // console.log(`Deletada ${deletedCount}: ID ${notif.id}`);
        }
        const userIdF = 1;
        const messageF = `Deletadas ${deletedCount} notificações.`;
        await sendNotification(userIdF, messageF);

    } catch (error) {
        console.error(
            "Erro ao limpar notificações:",
            error.response?.data || error.message
        );
        throw error;
    }
}


module.exports = clearNotifications;