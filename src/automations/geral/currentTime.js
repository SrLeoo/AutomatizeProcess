module.exports = function CurrentTime() {
  const now = new Date();
      console.log('horas:', now);
  // Formato ISO
  return now.toISOString().replace('Z', '+03:00');  // Exemplo: "2026-03-26T11:40:00+03:00"

};
