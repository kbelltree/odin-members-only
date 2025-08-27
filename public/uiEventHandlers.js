// Event handlers for client-side user interactions
document.addEventListener('DOMContentLoaded', () => {
  // Handle date formatting
  document.querySelectorAll('.formatTs').forEach((tsPlaceholder) => {
    const timestamp = tsPlaceholder.dataset.ts;
    tsPlaceholder.textContent = new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  });
  // Handle admin date formatting
  document.querySelectorAll('.formatAdminTs').forEach((td) => {
    const timestamp = td.dataset.adminTs;
    td.textContent = new Date(timestamp).toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  });
});
