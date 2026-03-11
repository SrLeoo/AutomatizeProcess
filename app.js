const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT;

const webhookRouter = require("./src/router");

const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
    
  webhookRouter(req.body);
});

app.listen(process.env.PORT, () => {
  console.log("Servidor iniciado");
});