const sendNotification = require('../../automations/geral/notifications');

module.exports = async function dealAdd(body) {
    const userId = 5;
    const message = "Novo negócio criado";

    await sendNotification(userId, message);
    console.log("Fluxo de add");
    
}