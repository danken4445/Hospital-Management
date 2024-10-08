export const getCurrentTimestamp = () => {
  const now = new Date();
  return now.toLocaleString();
};
const formatDateToLocal = (date) => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
  return adjustedDate.toISOString().slice(0, 16).replace('T', ' ');
};
