const API_KEY = "da7be22a064e8e36c8e9385be0d67fc4";
const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
const weatherDisplay = document.getElementById("weatherDisplay");
const cityNameEl = document.getElementById("cityName");
const weatherIconEl = document.getElementById("weatherIcon");
const temperatureEl = document.getElementById("temperature");
const weatherDescEl = document.getElementById("weatherDesc");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const loadingEl = document.getElementById("loading");
const favBtn = document.getElementById("favBtn");
const favoritesContainer = document.getElementById("favoritesContainer");
const favoritesList = document.getElementById("favoritesList");

let currentCity = null;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let lang = "ja"; // default language

// 翻译词典（简单示例）
const translations = {
  ja: {
    placeholder: "場所を入力してください...",
    humidity: "湿度",
    wind: "風速",
    favAdd: "☆ 收藏",
    favRemove: "★ 已收藏",
    favoritesTitle: "收藏的城市",
    loading: "読み込み中...",
  },
  en: {
    placeholder: "Enter location...",
    humidity: "Humidity",
    wind: "Wind",
    favAdd: "☆ Favorite",
    favRemove: "★ Favorited",
    favoritesTitle: "Favorite Cities",
    loading: "Loading...",
  },
  zh: {
    placeholder: "请输入地点...",
    humidity: "湿度",
    wind: "风速",
    favAdd: "☆ 收藏",
    favRemove: "★ 已收藏",
    favoritesTitle: "收藏的城市",
    loading: "加载中...",
  },
};

function t(key) {
  return translations[lang][key];
}

function setLanguage(newLang) {
  lang = newLang;
  searchInput.placeholder = t("placeholder");
  document.getElementById("title").textContent =
    lang === "ja"
      ? "世界の天気を調べる"
      : lang === "en"
      ? "World Weather Finder"
      : "全球天气查询";
  document.querySelector(".favorites-container h3").textContent = t("favoritesTitle");
  updateFavBtn();
  clearSuggestions();
}

document.querySelectorAll(".lang-switch button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".lang-switch button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    setLanguage(btn.dataset.lang);
  });
});

// 搜索自动联想
let debounceTimeout = null;
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (debounceTimeout) clearTimeout(debounceTimeout);
  if (!query) {
    clearSuggestions();
    return;
  }
  debounceTimeout = setTimeout(() => {
    fetchGeoSuggestions(query);
  }, 350);
});

function clearSuggestions() {
  suggestions.innerHTML = "";
  suggestions.classList.remove("visible");
}

// 用 OpenWeatherMap 的 Geo API 获取位置建议
async function fetchGeoSuggestions(query) {
  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      query
    )}&limit=5&appid=${API_KEY}&lang=${lang}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.length === 0) {
      clearSuggestions();
      return;
    }

    suggestions.innerHTML = "";
    data.forEach((place) => {
      const li = document.createElement("li");
      li.textContent = `${place.name}${place.state ? ", " + place.state : ""}, ${place.country}`;
      li.dataset.lat = place.lat;
      li.dataset.lon = place.lon;
      li.dataset.name = place.name;
      li.addEventListener("click", () => {
        clearSuggestions();
        searchInput.value = li.textContent;
        fetchWeatherByCoords(place.lat, place.lon, place.name);
      });
      suggestions.appendChild(li);
    });

    suggestions.classList.add("visible");
  } catch (error) {
    clearSuggestions();
    console.error("Geo API error:", error);
  }
}

async function fetchWeatherByCoords(lat, lon, cityName) {
  showLoading(true);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API error");
    const data = await res.json();
    currentCity = {
      name: cityName || data.name,
      lat,
      lon,
    };
    updateWeatherUI(data);
  } catch (e) {
    alert("天气数据获取失败");
    console.error(e);
  } finally {
    showLoading(false);
  }
}

function updateWeatherUI(data) {
  // 动画切换
  gsap.fromTo(
    weatherDisplay,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
  );

  weatherDisplay.classList.remove("hidden");
  cityNameEl.textContent = data.name;

  temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;

  weatherDescEl.textContent =
    data.weather[0].description.charAt(0).toUpperCase() +
    data.weather[0].description.slice(1);

  humidityEl.textContent = `${t("humidity")}: ${data.main.humidity}%`;
  windEl.textContent = `${t("wind")}: ${Math.round(data.wind.speed)} m/s`;

  setWeatherIcon(data.weather[0].icon);

  updateFavBtn();
  updateFavoritesList();
  favoritesContainer.classList.toggle("hidden", favorites.length === 0);
}

function setWeatherIcon(iconCode) {
  // OpenWeatherMap icon code 简单映射为内置 SVG
  const icons = {
    "01d": sunnySVG(),
    "01n": nightSVG(),
    "02d": partlyCloudySVG(),
    "02n": partlyCloudyNightSVG(),
    "03d": cloudySVG(),
    "03n": cloudySVG(),
    "04d": overcastSVG(),
    "04n": overcastSVG(),
    "09d": rainSVG(),
    "09n": rainSVG(),
    "10d": rainSunSVG(),
    "10n": rainMoonSVG(),
    "11d": thunderSVG(),
    "11n": thunderSVG(),
    "13d": snowSVG(),
    "13n": snowSVG(),
    "50d": mistSVG(),
    "50n": mistSVG(),
  };

  weatherIconEl.innerHTML = icons[iconCode] || sunnySVG();
}

// 简单示例 SVG 图标 (可继续扩展和优化)

function sunnySVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#FFD93B" xmlns="http://www.w3.org/2000/svg" aria-label="晴れ">
      <circle cx="32" cy="32" r="14"/>
      <g stroke="#FFD93B" stroke-width="4" stroke-linecap="round">
        <line x1="32" y1="2" x2="32" y2="14"/>
        <line x1="32" y1="50" x2="32" y2="62"/>
        <line x1="2" y1="32" x2="14" y2="32"/>
        <line x1="50" y1="32" x2="62" y2="32"/>
        <line x1="12" y1="12" x2="20" y2="20"/>
        <line x1="44" y1="44" x2="52" y2="52"/>
        <line x1="12" y1="52" x2="20" y2="44"/>
        <line x1="44" y1="20" x2="52" y2="12"/>
      </g>
    </svg>
  `;
}

function nightSVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#FFF" xmlns="http://www.w3.org/2000/svg" aria-label="夜">
      <path d="M43 32a15 15 0 1 1-24-13 20 20 0 0 0 24 13z" fill="#f0f0f0" />
    </svg>
  `;
}

function partlyCloudySVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#FFC107" xmlns="http://www.w3.org/2000/svg" aria-label="晴れ時々曇り">
      <circle cx="24" cy="24" r="10"/>
      <ellipse cx="44" cy="40" rx="16" ry="12" fill="#ccc"/>
    </svg>
  `;
}

function partlyCloudyNightSVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#FFF" xmlns="http://www.w3.org/2000/svg" aria-label="夜の晴れ時々曇り">
      <path d="M20 28a10 10 0 1 1 12-15 16 16 0 0 0-12 15z" fill="#ddd"/>
      <ellipse cx="44" cy="40" rx="16" ry="12" fill="#777"/>
    </svg>
  `;
}

function cloudySVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#ccc" xmlns="http://www.w3.org/2000/svg" aria-label="曇り">
      <ellipse cx="32" cy="36" rx="22" ry="14"/>
    </svg>
  `;
}

function overcastSVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#999" xmlns="http://www.w3.org/2000/svg" aria-label="厚い曇り">
      <ellipse cx="32" cy="36" rx="28" ry="18"/>
    </svg>
  `;
}

function rainSVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#00BCD4" xmlns="http://www.w3.org/2000/svg" aria-label="雨">
      <ellipse cx="32" cy="36" rx="28" ry="18"/>
      <line x1="20" y1="48" x2="20" y2="60" stroke="#03A9F4" stroke-width="4" stroke-linecap="round"/>
      <line x1="32" y1="48" x2="32" y2="60" stroke="#03A9F4" stroke-width="4" stroke-linecap="round"/>
      <line x1="44" y1="48" x2="44" y2="60" stroke="#03A9F4" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `;
}

function rainSunSVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#FFC107" xmlns="http://www.w3.org/2000/svg" aria-label="雨時々晴れ">
      <circle cx="20" cy="20" r="8"/>
      <ellipse cx="44" cy="36" rx="22" ry="14" fill="#00BCD4"/>
      <line x1="16" y1="32" x2="16" y2="44" stroke="#03A9F4" stroke-width="4" stroke-linecap="round"/>
      <line x1="24" y1="32" x2="24" y2="44" stroke="#03A9F4" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `;
}

function rainMoonSVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#EEE" xmlns="http://www.w3.org/2000/svg" aria-label="雨の夜">
      <path d="M30 28a12 12 0 1 1 20-10 18 18 0 0 0-20 10z" fill="#90CAF9"/>
      <line x1="22" y1="40" x2="22" y2="52" stroke="#42A5F5" stroke-width="4" stroke-linecap="round"/>
      <line x1="30" y1="40" x2="30" y2="52" stroke="#42A5F5" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `;
}

function thunderSVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#FFEB3B" xmlns="http://www.w3.org/2000/svg" aria-label="雷">
      <polygon points="24,2 44,30 32,30 42,62 20,34 32,34" />
    </svg>
  `;
}

function snowSVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#90CAF9" xmlns="http://www.w3.org/2000/svg" aria-label="雪">
      <circle cx="32" cy="32" r="14" stroke="#42A5F5" stroke-width="4" fill="none"/>
      <line x1="32" y1="10" x2="32" y2="54" stroke="#42A5F5" stroke-width="4"/>
      <line x1="10" y1="32" x2="54" y2="32" stroke="#42A5F5" stroke-width="4"/>
      <line x1="14" y1="14" x2="50" y2="50" stroke="#42A5F5" stroke-width="4"/>
      <line x1="14" y1="50" x2="50" y2="14" stroke="#42A5F5" stroke-width="4"/>
    </svg>
  `;
}

function mistSVG() {
  return `
    <svg viewBox="0 0 64 64" fill="#B0BEC5" xmlns="http://www.w3.org/2000/svg" aria-label="霧">
      <rect x="10" y="28" width="44" height="8" rx="4" ry="4"/>
      <rect x="6" y="36" width="52" height="8" rx="4" ry="4"/>
    </svg>
  `;
}

function updateFavBtn() {
  if (!currentCity) return;
  const isFav = favorites.some(
    (f) => f.name === currentCity.name && f.lat === currentCity.lat && f.lon === currentCity.lon
  );
  favBtn.textContent = isFav ? t("favRemove") : t("favAdd");
}

favBtn.addEventListener("click", () => {
  if (!currentCity) return;
  const idx = favorites.findIndex(
    (f) => f.name === currentCity.name && f.lat === currentCity.lat && f.lon === currentCity.lon
  );
  if (idx === -1) {
    favorites.push(currentCity);
  } else {
    favorites.splice(idx, 1);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavBtn();
  updateFavoritesList();
  favoritesContainer.classList.toggle("hidden", favorites.length === 0);
});

function updateFavoritesList() {
  favoritesList.innerHTML = "";
  favorites.forEach((fav) => {
    const li = document.createElement("li");
    li.textContent = fav.name;
    li.addEventListener("click", () => {
      fetchWeatherByCoords(fav.lat, fav.lon, fav.name);
    });
    favoritesList.appendChild(li);
  });
}

function showLoading(isLoading) {
  loadingIndicator.style.display = isLoading ? "block" : "none";
}

// 页面加载时，设置默认语言和显示收藏列表
setLanguage(lang);
updateFavoritesList();
favoritesContainer.classList.toggle("hidden", favorites.length === 0);

export {};  
