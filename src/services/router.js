// Deals
const dealUpdate = require("../automations/deal/dealUpdate.js");
const dealAdd = require("../automations/deal/dealAdd.js");
const dealDelete = require("../automations/deal/dealDelete.js");
// Invoices
const invoiceUpdate = require("../automations/invoice/invoiceUpdate.js");
const invoiceAdd = require("../automations/invoice/invoiceAdd.js");
const invoiceDelete = require("../automations/invoice/invoiceDelete.js");

// Quotes
const quoteAdd = require("../automations/quote/quoteAdd.js");
const quoteUpdate = require("../automations/quote/quoteUpdate.js");
const quoteDelete = require("../automations/quote/quoteDelete.js");

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
    case "ONCRMDYNAMICITEMUPDATE":
      invoiceUpdate(body);
      break;

    case "ONCRMDYNAMICITEMADD":
      invoiceAdd(body);
      break;

    case "ONCRMDYNAMICITEMDELETE":
      invoiceDelete(body);
      break;

// ==
    case "ONCRMQUOTEADD":
      quoteAdd(body);
      break;
    case "ONCRMQUOTEUPDATE":
      quoteUpdate(body);
      break;
    case "ONCRMQUOTEDELETE":
      quoteDelete(body);
      break;
// =
    default:
      console.log("Evento não tratado:", event);
  }
};
