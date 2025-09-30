// Select all elements with the class "spotify-login-btn"
document.querySelectorAll('.spotify-login-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the default link redirect

    const url = e.target.href; // Get the Spotify login URL from the button/link

    // Simple mobile device detection (userAgent + screen width fallback)
    const isMobile =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;

    if (isMobile) {
      // On mobile devices → redirect directly (better UX, popups often blocked)
      window.location.href = url;
    } else {
      // On desktop → open a popup window in the center of the screen
      const width = 400;
      const height = 500;
      const left = screen.width / 2 - width / 2;
      const top = screen.height / 2 - height / 2;

      window.open(
        url,
        'SpotifyLogin', // Popup window name
        `width=${width},height=${height},top=${top},left=${left}`
      );
    }
  });
});
