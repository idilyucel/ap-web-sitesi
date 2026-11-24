const form = document.querySelector('form');
const input = document.querySelector('#query');
const heading = document.querySelector('#heading');
const statusText = document.querySelector('#status');
const results = document.querySelector('#results');
const genres = { Drama: 'Dram', Thriller: 'Gerilim', Mystery: 'Gizem', Comedy: 'Komedi', Crime: 'Suç', Romance: 'Romantik', 'Science-Fiction': 'Bilim kurgu', Horror: 'Korku', Adventure: 'Macera', Action: 'Aksiyon' };
let currentRequest;

function showCard(show) {
  const card = document.createElement('article');
  const poster = document.createElement('div');
  poster.className = 'poster';
  poster.textContent = 'Afiş yok';
  if (show.image?.medium) {
    const image = document.createElement('img');
    image.alt = show.name + ' afişi';
    image.addEventListener('error', () => poster.textContent = 'Afiş yok');
    image.src = show.image.medium;
    poster.replaceChildren(image);
  }
  const details = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = show.name;
  const metadata = document.createElement('p');
  metadata.textContent = [show.premiered?.slice(0, 4), ...show.genres.map(genre => genres[genre] || genre)].filter(Boolean).join(' · ');
  const link = document.createElement('a');
  link.href = show.url;
  link.textContent = 'TVmaze’de incele';
  details.append(title, metadata, link);
  card.append(poster, details);
  return card;
}

async function searchShows(query = '') {
  currentRequest?.abort();
  const request = new AbortController();
  currentRequest = request;
  results.replaceChildren();
  heading.textContent = query ? 'Arama sonuçları' : 'Keşfedilecek diziler';
  statusText.textContent = 'Diziler yükleniyor…';
  try {
    const url = query
      ? 'https://api.tvmaze.com/search/shows?q=' + encodeURIComponent(query)
      : 'https://api.tvmaze.com/shows?page=0';
    const response = await fetch(url, { signal: request.signal });
    if (!response.ok) throw new Error('API isteği başarısız');
    const matches = await response.json();
    if (request !== currentRequest) return;
    const selected = query ? matches.map(match => match.show) : matches.filter(show => show.image?.medium).slice(0, 12);
    results.replaceChildren(...selected.map(showCard));
    statusText.textContent = selected.length ? '' : 'Dizi bulunamadı. Başka bir ad deneyebilirsin.';
  } catch (error) {
    if (error.name !== 'AbortError' && request === currentRequest) {
      statusText.textContent = 'Diziler yüklenemedi. Bağlantını kontrol edip tekrar ara.';
    }
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const query = input.value.trim();
  searchShows(query);
});
searchShows();
