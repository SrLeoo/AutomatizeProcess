const dealUpdate = require("../automations/deal/dealUpdate.js");
const dealAdd = require("../automations/deal/dealAdd.js");
const dealDelete = require("../automations/deal/dealDelete.js");

const invoiceUpdate = require("../automations/invoice/invoiceUpdate.js");
const invoiceAdd = require("../automations/invoice/invoiceAdd.js");
const invoiceDelete = require("../automations/invoice/invoiceDelete.js");

module.exports = function router(body) {
  const event = body.event;

  if (!event) return;

  console.log("Evento recebido:", event);

// ==
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
// ==
    case "ONCRMINVOICEUPDATE":
      invoiceUpdate(body);
      break;

    case "ONCRMINVOICEADD":
      invoiceAdd(body);
      break;

    case "ONCRMINVOICEDELETE":
      invoiceDelete(body);
      break;
// ==

    default:
      console.log("Evento não tratado:", event);
  }
};