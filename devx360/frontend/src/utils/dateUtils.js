const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatDate(dateString) {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return dateFormatter.format(date);
  } catch (error) {
    console.warn('Invalid date format:', dateString);
    return "N/A";
  }
}