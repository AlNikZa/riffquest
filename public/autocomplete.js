// public/autocomplete.js

function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}

function initAutocomplete(inputSelector, datalistSelector) {
  const input = document.querySelector(inputSelector);
  const datalist = document.querySelector(datalistSelector);

  // Exit if input or datalist does not exist on this page
  if (!input || !datalist) return;

  let currentSuggestions = [];
  let abortController = null;

  // Function to fetch suggestions from backend
  const fetchArtists = async () => {
    const query = input.value.trim();
    if (!query || query.length < 2) {
      datalist.innerHTML = '';
      currentSuggestions = [];
      return; // Do nothing if input is empty or too short
    }

    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    try {
      const response = await fetch(
        `/artists/suggestions?artist=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortController.signal,
        },
      );

      const result = await response.json();

      if (result.status === 'success') {
        const artists = result.data;
        currentSuggestions = artists;
        datalist.innerHTML = '';
        // Populate datalist with new options
        currentSuggestions.forEach((artist) => {
          const option = document.createElement('option');
          const displayName = artist.country
            ? `${artist.name} (${artist.country})`
            : `${artist.name}`;
          option.value = displayName;
          option.dataset.id = artist.id;
          datalist.appendChild(option);
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('❌ Autocomplete fetch failed:', err);
    }
  };

  // Wrap fetchArtists with debounce (400ms delay)
  const debouncedFetch = debounce(fetchArtists, 400);

  input.addEventListener('input', () => {
    const match = currentSuggestions.find((a) => {
      const displayName = a.country ? `${a.name} (${a.country})` : a.name;
      return displayName === input.value;
    });
    if (match) {
      if (abortController) abortController.abort();
      window.location.href = `/artists/${match.id}`;
      return;
    }

    // Listen for input events on the input field
    debouncedFetch();
  });
}

// Apply autocomplete conditionally based on element existence
if (document.querySelector('#artist-input')) {
  initAutocomplete('#artist-input', '#suggestions'); // main page input
}

if (document.querySelector('#artist-navbar-input')) {
  initAutocomplete('#artist-navbar-input', '#navbar-suggestions'); // navbar input on all pages
}
