const express = require("express");
require("dotenv").config();

const webhookRouter = require("./src/services/router");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  webhookRouter(req.body);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor iniciado");
});