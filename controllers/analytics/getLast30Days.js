/**
 * Generates an array of dates for the last 30 days.
 * @returns {Array<string>}
 */
const getLast30Days = () => {
  const dates = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

module.exports = {
  getLast30Days
};
