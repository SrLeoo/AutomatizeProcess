const axios = require('axios');

async function sendNotification(userId, message = ""){
    try {
        const response = await axios.post(`${process.env.BITRIX_WEBHOOK}im.notify.system.add`, {
            "USER_ID": userId,
            "MESSAGE": message
        });

    } catch (error) {
        console.error("Erro ao enviar notificação:", error);
        return null;
    }
}
module.exports = sendNotification;
