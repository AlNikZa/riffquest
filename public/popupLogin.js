// Select all elements with the class "spotify-login-btn"
document.querySelectorAll('.spotify-login-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default link behavior

    // const url = e.target.href; // Get the Spotify login URL
    const url = btn.href; // Use the button itself, not the event target
    window.location.href = url; // Always redirect
  });
});
document.addEventListener('DOMContentLoaded', function () {
  const modalEl = document.getElementById('loginModal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);

    modalEl.addEventListener('shown.bs.modal', async () => {
      await fetch('/reset-login-flag', { method: 'POST' });
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const modalEl = document.getElementById('loginModal');
  if (!modalEl) return;

  if (typeof bootstrap === 'undefined') {
    console.error('Bootstrap JS nije učitan');
    return;
  }

  const modal = new bootstrap.Modal(modalEl);

  modalEl.addEventListener('shown.bs.modal', async () => {
    try {
      await fetch('/reset-login-flag', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('reset-login-flag failed', err);
    }
  });

  modal.show();
});
