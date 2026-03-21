const sendNotification = require('../../automations/geral/notifications');

module.exports = async function quoteUpdate(body) {
    const userId = 1;
    const message = "Cotação atualizada";
    console.log("quoteUpdate acionado:", "body: ", body);
    await sendNotification(userId, message);

}
