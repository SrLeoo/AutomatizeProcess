const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Bitrix pode enviar como JSON ou x-www-form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Webhook Automatize online."
  });
});

// Webhook principal do Bitrix
app.post("/", async (req, res) => {
  try {
    console.log("Novo webhook recebido do Bitrix");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    // Exemplos de campos que geralmente podem vir do Bitrix
    const event = req.body.event || null;
    const data = req.body.data || null;
    const ts = req.body.ts || null;

    // Aqui você pode tratar por tipo de evento
    if (event) {
      console.log("Evento recebido:", event);
    }

    // Resposta rápida para o Bitrix
    return res.status(200).json({
      success: true,
      message: "Webhook recebido com sucesso",
      receivedEvent: event,
      timestamp: ts
    });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);

    return res.status(500).json({
      success: false,
      message: "Erro interno ao processar webhook"
    });
  }
});

// Subir servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});