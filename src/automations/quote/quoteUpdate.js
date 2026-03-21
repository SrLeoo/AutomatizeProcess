const quoteUpdate = require('../../automations/geral/notifications');

module.exports = async function quoteUpdate(body) {
    const userId = 1;
    const message = "Cotação atualizada";

    await sendNotification(userId, message);

}
