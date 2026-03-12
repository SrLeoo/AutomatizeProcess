const sendNotification = require('../../automations/geral/notifications');

module.exports = async function dealDelete(body) {
    const userId = 5;
    const message = "Negócio excluído";

    await sendNotification(userId, message);
    console.log("Fluxo de delete");
    
}