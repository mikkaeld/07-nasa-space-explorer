// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the button and gallery elements
const gallery = document.getElementById('gallery');

// NASA APOD API endpoint and demo key
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
const API_KEY = 'XtyQRAMqIreZc5TBBOF1TzahIthAaxdoyJuXR5X0'; // For demo purposes only

// Listen for button click to fetch images

// Modal functionality
const modal = document.getElementById('mediaModal');
const modalContent = modal.querySelector('.modal-content');
const modalMedia = modal.querySelector('.modal-media-container');
const modalDesc = modal.querySelector('.modal-description');
const modalClose = modal.querySelector('.modal-close');
const modalOverlay = modal.querySelector('.modal-overlay');

// Open modal with media and description
function openModal({ url, title, explanation, mediaType, thumb }) {
  modalMedia.innerHTML = '';
  modalDesc.innerHTML = '';
  if (mediaType === 'image') {
    modalMedia.innerHTML = `<img src="${url}" alt="${title}" />`;
  } else if (mediaType === 'video') {
    // Embed video (APOD videos are usually YouTube or Vimeo)
    let embedUrl = url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Convert to embed
      const ytId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      if (ytId && ytId[1]) embedUrl = `https://www.youtube.com/embed/${ytId[1]}`;
    } else if (url.includes('vimeo.com')) {
      const vimeoId = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoId && vimeoId[1]) embedUrl = `https://player.vimeo.com/video/${vimeoId[1]}`;
    }
    modalMedia.innerHTML = `<div style="position:relative;padding-bottom:56.25%;height:0;width:100%"><iframe src="${embedUrl}" title="${title}" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:8px;background:#222;"></iframe></div>`;
  }
  modalDesc.innerHTML = `<h2 style="color:var(--nasa-blue);font-size:1.3rem;margin-bottom:0.5rem;">${title}</h2><div>${explanation}</div>`;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

// Close modal
function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  modalMedia.innerHTML = '';
  modalDesc.innerHTML = '';
}

// Event delegation for gallery items
gallery.addEventListener('click', function(e) {
  const item = e.target.closest('.gallery-item');
  if (!item) return;
  const url = item.getAttribute('data-url');
  const title = decodeURIComponent(item.getAttribute('data-title'));
  const explanation = decodeURIComponent(item.getAttribute('data-explanation'));
  const mediaType = item.getAttribute('data-media-type');
  const thumb = item.getAttribute('data-thumb');
  openModal({ url, title, explanation, mediaType, thumb });
});

gallery.addEventListener('keydown', function(e) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('gallery-item')) {
    e.preventDefault();
    e.target.click();
  }
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
document.addEventListener('keydown', function(e) {
  if (modal.getAttribute('aria-hidden') === 'false' && (e.key === 'Escape' || e.key === 'Esc')) {
    closeModal();
  }
});

// --- HERO SECTION LOGIC ---
const heroSection = document.getElementById('heroSection');
const heroListenBtn = document.getElementById('heroListenBtn');
const explorerSection = document.getElementById('explorerSection');

// Fetch random images for hero background
function setRandomHeroBackground() {
  // Use a recent date range for more visually appealing images
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const start = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10); // last 30 days
  const url = `${NASA_API_URL}?api_key=${API_KEY}&start_date=${start}&end_date=${end}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const items = Array.isArray(data) ? data : [data];
      // Filter for images only
      const images = items.filter(item => item.media_type === 'image');
      if (images.length) {
        // Pick a random image
        const random = images[Math.floor(Math.random() * images.length)];
        // Preload the image, then set as background and hide splash
        const img = new window.Image();
        img.onload = function() {
          heroSection.style.backgroundImage = `url('${random.url}')`;
          // Hide splash after a short delay for smoothness
          setTimeout(() => {
            document.getElementById('splashScreen').classList.add('splash-hide');
          }, 300);
        };
        img.src = random.url;
      } else {
        heroSection.style.background = '#000';
        document.getElementById('splashScreen').classList.add('splash-hide');
      }
    })
    .catch(() => {
      heroSection.style.background = '#000';
      document.getElementById('splashScreen').classList.add('splash-hide');
    });
}
setRandomHeroBackground();

// Hide gallery by default
gallery.classList.remove('gallery-visible');
gallery.style.display = 'none';

function showGallery() {
  gallery.style.display = '';
  // Force reflow for transition
  void gallery.offsetWidth;
  gallery.classList.add('gallery-visible');
}

function hideGallery() {
  gallery.classList.remove('gallery-visible');
  setTimeout(() => { gallery.style.display = 'none'; }, 600);
}

// --- EXPLORER SECTION LOGIC ---
const recentBtn = document.getElementById('recentBtn');
const timelineBtn = document.getElementById('timelineBtn');

function renderGallery(items) {
  if (!items.length) {
        gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">😢</div><p>No space images found for this range.</p></div>`;
        return;
      }
  gallery.innerHTML = items.map(item => {
    const isImage = item.media_type === 'image';
    const isVideo = item.media_type === 'video';
    let mediaHtml = '';
    if (isImage) {
      mediaHtml = `<img src="${item.url}" alt="${item.title}" loading="lazy" />`;
    } else if (isVideo) {
      const thumb = item.thumbnail_url || 'https://img.icons8.com/ios-filled/100/0B3D91/play--v1.png';
      mediaHtml = `<div class="video-thumb-container"><img src="${thumb}" alt="${item.title} (video)" class="video-thumb" /><span class="video-play-icon">▶</span></div>`;
    }
    return `
      <div class="gallery-item" tabindex="0" data-title="${encodeURIComponent(item.title)}" data-date="${item.date}" data-explanation="${encodeURIComponent(item.explanation)}" data-url="${item.url}" data-media-type="${item.media_type}" data-thumb="${item.thumbnail_url ? encodeURIComponent(item.thumbnail_url) : ''}">
        ${mediaHtml}
        <div class="gallery-date">${item.date}</div>
        <div class="gallery-title">${item.title}</div>
        </div>
    `;
  }).join('');
}

recentBtn.addEventListener('click', () => {
  hideGallery();
  setTimeout(() => {
    gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading most recent images...</p></div>`;
    showGallery();
    // Get today's date and 8 days before (9 images)
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const start = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 8).toISOString().slice(0, 10);
    const url = `${NASA_API_URL}?api_key=${API_KEY}&start_date=${start}&end_date=${end}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : [data];
        // Sort by date descending, take last 9
        const sorted = items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 9);
        renderGallery(sorted);
        // Scroll after gallery is rendered and visible
        setTimeout(() => {
          gallery.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      })
      .catch(() => {
        gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">⚠️</div><p>Could not load images. Please try again later.</p></div>`;
      });
  }, 600);
});

timelineBtn.addEventListener('click', () => {
  const startDate = startInput.value;
  const endDate = endInput.value;
  if (!startDate || !endDate) {
    alert('Please select both a start and end date.');
    return;
  }
  hideGallery();
  setTimeout(() => {
    gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading images from timeline...</p></div>`;
    showGallery();
    const url = `${NASA_API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : [data];
        // Sort by date descending, take last 9
        const sorted = items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 9);
        renderGallery(sorted);
        // Scroll after gallery is rendered and visible
        setTimeout(() => {
          gallery.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      })
      .catch(() => {
      gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">⚠️</div><p>Could not load images. Please try again later.</p></div>`;
      });
  }, 600);
    });

// Make heroListenBtn scroll to explorerSection with smooth effect
heroListenBtn.addEventListener('click', function(e) {
  e.preventDefault();
  explorerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
