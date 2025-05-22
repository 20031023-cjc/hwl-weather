// script.js
// Weather App with custom SVG icons, transition animations, and favorite cities

const API_KEY = 'da7be22a064e8e36c8e9385be0d67fc4';
const weatherContainer = document.getElementById('weatherContainer');
const cityInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
const loader = document.getElementById('loader');
const favoritesList = document.getElementById('favorites');

// Languages
const translations = {
  ja: {
    title: '世界の天気を調べる',
    placeholder: '場所を入力してください...',
    humidity: '湿度',
    wind: '風速',
    noResults: '結果がありません',
    fav: 'お気に入り',
  },
  en: {
    title: 'Check Weather Worldwide',
    placeholder: 'Enter location...',
    humidity: 'Humidity',
    wind: 'Wind Speed',
    noResults: 'No results found',
    fav: 'Favorites',
  },
  zh: {
    title: '查询全球天气',
    placeholder: '请输入地点...',
    humidity: '湿度',
    wind: '风速',
    noResults: '未找到结果',
    fav: '收藏夹',
  },
};

let currentLang = 'ja';

// Fetch weather using OpenWeather API
async function fetchWeather(city) {
  loader.style.display = 'block';
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${currentLang}`);
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();
    renderWeather(data);
  } catch (err) {
    alert(translations[currentLang].noResults);
  } finally {
    loader.style.display = 'none';
  }
}

// Render SVG weather icon and info
function renderWeather(data) {
  const icon = getWeatherSVG(data.weather[0].main);
  const html = `
    <div class="weather-card animate">
      <h2>${data.name}, ${data.sys.country}</h2>
      <div class="icon">${icon}</div>
      <div class="temp">${Math.round(data.main.temp)}°C</div>
      <div class="details">
        <p>${translations[currentLang].humidity}: ${data.main.humidity}%</p>
        <p>${translations[currentLang].wind}: ${data.wind.speed} m/s</p>
      </div>
      <button class="fav-btn" onclick="addFavorite('${data.name}')">★</button>
    </div>
  `;
  weatherContainer.innerHTML = html;
}

// Return SVG icons based on weather type
function getWeatherSVG(condition) {
  switch (condition.toLowerCase()) {
    case 'clear':
      return `<svg class="icon-sun" ...>...</svg>`;
    case 'clouds':
      return `<svg class="icon-cloud" ...>...</svg>`;
    case 'rain':
      return `<svg class="icon-rain" ...>...</svg>`;
    default:
      return `<svg class="icon-default" ...>...</svg>`;
  }
}

// Auto detect location
async function detectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=${currentLang}`);
      const data = await res.json();
      renderWeather(data);
    });
  }
}

// Add city to favorites
function addFavorite(city) {
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favs.includes(city)) favs.push(city);
  localStorage.setItem('favorites', JSON.stringify(favs));
  renderFavorites();
}

// Render favorite cities
function renderFavorites() {
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  favoritesList.innerHTML = '';
  favs.forEach(city => {
    const item = document.createElement('li');
    item.innerHTML = `<span>${city}</span> <button onclick="fetchWeather('${city}')">▶</button>`;
    favoritesList.appendChild(item);
  });
}

// Language switch
document.querySelectorAll('.lang-switch button').forEach(btn => {
  btn.onclick = () => {
    currentLang = btn.dataset.lang;
    document.getElementById('title').textContent = translations[currentLang].title;
    cityInput.placeholder = translations[currentLang].placeholder;
    document.getElementById('favTitle').textContent = translations[currentLang].fav;
  };
});

// Search listener
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') fetchWeather(cityInput.value.trim());
});

// Load
window.onload = () => {
  detectLocation();
  renderFavorites();
};
