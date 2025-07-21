export const formatCurrency = (amount) => {
  if (!amount) return 'Rp 0';
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
};