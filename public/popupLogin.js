// Select all elements with the class "spotify-login-btn"
document.querySelectorAll('.spotify-login-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default link behavior

    const url = e.target.href; // Get the Spotify login URL
    window.location.href = url; // Always redirect
  });
});
