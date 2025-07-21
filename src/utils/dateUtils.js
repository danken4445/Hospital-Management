import { format, parseISO } from 'date-fns';

export const formatDate = (dateString) => {
  const date = parseISO(dateString);
  return format(date, 'MMMM d, yyyy');
};

export const formatTime = (dateString) => {
  const date = parseISO(dateString);
  return format(date, 'h:mm a');
};

export const getCurrentDateTime = () => {
  return new Date().toISOString();
};

export const getDateFromTimestamp = (timestamp) => {
  return new Date(timestamp).toISOString();
};