const dealUpdate = require("../automations/dealUpdate.js");
const dealAdd = require("../automations/dealAdd.js");
const dealDelete = require("../automations/dealDelete.js");

module.exports = function router(body) {
  const event = body.event;

  if (!event) return;

  console.log("Evento recebido:", event);

  switch (event) {
    case "ONCRMDEALUPDATE":
      dealUpdate(body);
      break;

    case "ONCRMDEALADD":
      dealAdd(body);
      break;

    case "ONCRMDEALDELETE":
      dealDelete(body);
      break;

    default:
      console.log("Evento não tratado:", event);
  }
};