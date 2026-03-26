module.exports = function currentTime() {
  const now = new Date();
  console.log('horas:', now);
  return now.toISOString();
};
