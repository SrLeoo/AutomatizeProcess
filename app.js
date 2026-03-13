const express = require("express");
require("dotenv").config();

const webhookRouter = require("./src/services/router");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
    // console.log("Evento:", req.body?.event);
    // console.log("ID do card:", req.body?.data?.FIELDS?.ID);
    webhookRouter(req.body);
});


const clearNotifications = require("./src/automations/scripts/clearNotification.js");

app.post("/clear-notification", async (req, res) => {
    console.log("Endpoint clear-notification chamado");

    const result = await clearNotifications();

    res.status(200).send({
        success: true,
        message: "Notificação removida com sucesso",
        result
    });
});

const statusReport = require("./src/automations/scripts/statusReport.js");

app.post("/status-report", async (req, res) => {
    try {
        console.log("Endpoint status-report chamado");
        console.log("Body recebido:", req.body);
        console.log("Query recebida:", req.query);

        const invoiceId = req.body?.invoiceId || req.query?.invoiceId;

        const result = await statusReport(invoiceId);

        res.status(200).send({
            success: true,
            message: "Status report gerado com sucesso",
            result
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Erro ao gerar status report",
            error: error.response?.data || error.message
        });
    }
});

app.listen(process.env.PORT, () => {
  console.log("Servidor iniciado");
});