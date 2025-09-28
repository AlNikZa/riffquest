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

  // Function to fetch suggestions from backend
  const fetchArtists = async () => {
    const query = input.value.trim();
    if (!query) return; // Do nothing if input is empty

    try {
      const response = await fetch('/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const artists = await response.json(); // parse JSON array

      // Clear previous options
      datalist.innerHTML = '';

      // Populate datalist with new options
      artists.forEach((name) => {
        const option = document.createElement('option');
        option.value = name;
        datalist.appendChild(option);
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Wrap fetchArtists with debounce (400ms delay)
  const debouncedFetch = debounce(fetchArtists, 400);

  // Listen for input events on the input field
  input.addEventListener('input', debouncedFetch);
}

// Apply autocomplete conditionally based on element existence
if (document.querySelector('#artist-input')) {
  initAutocomplete('#artist-input', '#suggestions'); // main page input
}

if (document.querySelector('#artist-navbar-input')) {
  initAutocomplete('#artist-navbar-input', '#navbar-suggestions'); // navbar input on all pages
}
