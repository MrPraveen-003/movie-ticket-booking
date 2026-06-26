export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Math.round(amount));
};

export const formatShowTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hourIn12 = hours % 12 || 12;
  return `${hourIn12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

export const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};
