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

app.post("/clear-notification", async (req, res) => {

    console.log("Endpoint clear-notification chamado");


    // res.send("Notificações limpas com sucesso");
});

app.listen(process.env.PORT, () => {
  console.log("Servidor iniciado");
});