const sendNotification = require('../../automations/geral/notifications');

module.exports = async function dealAdd(body) {
    const userId = 1;
    const message = "Nova empresa criada";

    await sendNotification(userId, message);

}
