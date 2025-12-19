// public/authModals.js

document.addEventListener('DOMContentLoaded', function () {
  // === Spotify login button ===
  // Select all elements with class 'spotify-login-btn' and add a click listener
  document.querySelectorAll('.spotify-login-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default navigation
      window.location.href = btn.href; // Redirect to Spotify login
    });
  });

  // === Login modal ===
  const loginModalEl = document.getElementById('loginModal');
  if (loginModalEl && typeof bootstrap !== 'undefined') {
    const loginModal = new bootstrap.Modal(loginModalEl); // Initialize Bootstrap modal

    // When the login modal is shown, reset login flag on server
    loginModalEl.addEventListener('shown.bs.modal', async () => {
      try {
        await fetch('/auth/reset-login-flag', {
          method: 'POST',
          credentials: 'include', // Include cookies
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': window.csrfToken, // <-- CSRF token
          },
        });
      } catch (err) {
        console.error('❌ reset-login-flag failed: ', err);
      }
    });

    // Show the login modal if it exists
    loginModal.show();

    // Handle "Continue" button click inside login modal
    const loginContinueBtn = document.getElementById('loginContinue');
    if (loginContinueBtn) {
      loginContinueBtn.addEventListener('click', () => {
        // Reload the page to update UI/state after login
        window.location.reload();
      });
    }
  }

  // === Logout modal ===
  const logoutBtn = document.querySelector('.spotify-logout-btn');
  const confirmBtn = document.getElementById('confirmLogout');
  const logoutNoBtn = document.getElementById('logoutNo'); // Optional: "No" button
  const logoutModalEl = document.getElementById('logoutModal');

  if (logoutBtn && confirmBtn && logoutModalEl) {
    const logoutModal = new bootstrap.Modal(logoutModalEl); // Initialize modal

    // Show logout modal on logout button click
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent immediate redirect
      logoutModal.show();
    });

    // When user confirms logout
    confirmBtn.addEventListener('click', () => {
      logoutModal.hide(); // Hide modal first
      logoutModalEl.addEventListener(
        'hidden.bs.modal',
        async () => {
          try {
            await fetch('/auth/logout', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRF-Token': window.csrfToken,
              },
              body: `_csrf=${encodeURIComponent(window.csrfToken)}`,
            });
            window.location.href = '/';
          } catch (err) {
            console.error('❌ Logout failed: ', err);
          }
        },
        { once: true }
      );
    });

    // Optional: refresh page if user clicks "No" to restore UI
    if (logoutNoBtn) {
      logoutNoBtn.addEventListener('click', () => {
        window.location.reload(); // Uncomment if you want to refresh page
      });
    }
  }
});
