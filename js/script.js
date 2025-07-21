// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the button and gallery elements
const getImagesBtn = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// NASA APOD API endpoint and demo key
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
const API_KEY = 'XtyQRAMqIreZc5TBBOF1TzahIthAaxdoyJuXR5X0'; // For demo purposes only

// Listen for button click to fetch images
getImagesBtn.addEventListener('click', () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Show loading message
  gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading space images...</p></div>`;

  // Build the API URL with date range and key
  const url = `${NASA_API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch images from NASA APOD API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // If only one image is returned, wrap it in an array
      const images = Array.isArray(data) ? data : [data];

      // Filter out any items that are not images (sometimes APOD is a video)
      const imageItems = images.filter(item => item.media_type === 'image');

      // If no images found, show a message
      if (imageItems.length === 0) {
        gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">😢</div><p>No space images found for this range.</p></div>`;
        return;
      }

      // Build gallery HTML for each image
      gallery.innerHTML = imageItems.map(item => `
        <div class="gallery-item">
          <img src="${item.url}" alt="${item.title}" loading="lazy" />
          <p><strong>${item.title}</strong></p>
          <p>${item.date}</p>
          <p>${item.explanation}</p>
        </div>
      `).join('');
    })
    .catch(error => {
      // Show error message if something goes wrong
      gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">⚠️</div><p>Could not load images. Please try again later.</p></div>`;
      console.error('Error fetching NASA APOD images:', error);
    });
});
