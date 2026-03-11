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

app.listen(process.env.PORT, () => {
  console.log("Servidor iniciado");
});