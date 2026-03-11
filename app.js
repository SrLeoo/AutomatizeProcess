const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  console.log("Novo webhook recebido do Bitrix");
  console.log("Body recebido:");
  console.log(JSON.stringify(req.body, null, 2));

});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});