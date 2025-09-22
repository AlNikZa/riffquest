// Get references to form elements (might not exist everywhere)
const artistForm = document.getElementById('artist-form');
const artistNavbarForm = document.getElementById('artist-navbar-form');
const artistInput = document.getElementById('artist-input');
const artistNavbarInput = document.getElementById('artist-navbar-input');

const modalEl = document.getElementById('artistModal');
const modalBody = document.getElementById('choiceModalBody');

// Create the Bootstrap modal only if it exists in the DOM
const modal = modalEl ? new bootstrap.Modal(modalEl) : null;

// Modal action buttons
const viewAlbumsBtn = document.getElementById('viewAlbumsBtn');
const viewTracksBtn = document.getElementById('viewTracksBtn');
const viewInfoBtn = document.getElementById('viewInfoBtn');

// Collect only the forms that actually exist
const forms = [artistForm, artistNavbarForm].filter(Boolean);

// If there’s at least one form and the modal is present
if (forms.length > 0 && modal) {
  forms.forEach((form) => {
    form.addEventListener('submit', function (e) {
      // Check if the submit came from typing in the artist input
      if (
        document.activeElement === artistInput ||
        document.activeElement === artistNavbarInput
      ) {
        e.preventDefault(); // Prevent default submission

        // Show modal asking user what they want to see
        modalBody.textContent = `What do you want to see for "${document.activeElement.value}"?`;
        modal.show();

        const activeForm = document.activeElement.closest('form');

        // Handle "View Albums" click
        if (viewAlbumsBtn) {
          viewAlbumsBtn.onclick = () => {
            activeForm.action = '/artistAlbums';
            modal.hide();
            activeForm.submit();
          };
        }

        // Handle "View Tracks" click
        if (viewTracksBtn) {
          viewTracksBtn.onclick = () => {
            activeForm.action = '/artistTopTracks';
            modal.hide();
            activeForm.submit();
          };
        }

        // Handle "View Info" click
        if (viewInfoBtn) {
          viewInfoBtn.onclick = () => {
            activeForm.action = '/showArtist';
            modal.hide();
            activeForm.submit();
          };
        }
      }
    });
  });
}
