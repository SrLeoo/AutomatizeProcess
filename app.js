const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT;

const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  try {
    console.log("Body recebido:");
    console.log(JSON.stringify(req.body, null, 2));

    const dealId = req.body.data.FIELDS.ID;

    // consulta deal no Bitrix
    const response = await axios.get(
      `${BITRIX_WEBHOOK}crm.deal.get?id=${dealId}`
    );

    console.log("Resposta do Bitrix:");
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log("Erro ao consultar deal:", error.message);
  }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});