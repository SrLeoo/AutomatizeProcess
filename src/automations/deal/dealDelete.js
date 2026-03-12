const sendNotification = require('../../automations/geral/notifications');

module.exports = async function dealDelete(body) {
    const userId = 1;
    const message = "Negócio excluído";

    await sendNotification(userId, message);
    
}