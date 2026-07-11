/**
 * Formats an ISO-like local datetime string (e.g., "2026-07-11T10:16:00")
 * to a display string (e.g., "7/11/2026, 10:16 AM") timezone-agnostically,
 * without applying any local browser timezone offsets.
 * 
 * @param {string} dateString - The ISO datetime string from the backend
 * @returns {string} The formatted display date and time
 */
export const formatAppointmentDate = (dateString) => {
  if (!dateString) return '';
  try {
    // Expected format: YYYY-MM-DDTHH:mm:ss
    const [datePart, timePart] = dateString.split('T');
    if (!datePart || !timePart) {
      return new Date(dateString).toLocaleString();
    }
    const [year, month, day] = datePart.split('-');
    const timeParts = timePart.split(':');
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);

    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = minute < 10 ? `0${minute}` : minute;

    // Formatting matching standard American locale date representation
    return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}, ${displayHour}:${displayMinute} ${ampm}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date(dateString).toLocaleString();
  }
};
