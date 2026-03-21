const sendNotification = require('../../automations/geral/notifications');

module.exports = async function quoteAdd(body) {
    const userId = 1;
    const message = "Nova cotação criada";
    await sendNotification(userId, message);

}
