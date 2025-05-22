// --- Constants ---
const API_KEY = "da7be22a064e8e36c8e9385be0d67fc4";
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const CITY_LIST_URL = "https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json";

// --- Elements ---
const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
const weatherDisplay = document.getElementById("weatherDisplay");
const weatherIcon = document.getElementById("weatherIcon");
const temperatureEl = document.getElementById("temperature");
const weatherDescriptionEl = document.getElementById("weatherDescription");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("windSpeed");
const favoriteBtn = document.getElementById("favoriteBtn");
const favoritesList = document.getElementById("favoritesList");
const loadingEl = document.getElementById("loading");

// --- Variables ---
let cities = [];  // 所有城市列表
let currentCity = null;
let favorites = [];

// --- 初始化 ---
async function init() {
  showLoading(true);
  // 加载城市数据（第一次加载）
  cities = await fetchCities();
  // 载入收藏
  loadFavorites();
  // 自动定位
  locateAndShowWeather();
  showLoading(false);
}

// --- 加载城市数据 ---
async function fetchCities() {
  try {
    const res = await fetch(CITY_LIST_URL);
    if (!res.ok) throw new Error("城市数据加载失败");
    const data = await res.json();
    // 简化数据结构，方便搜索
    return data.map(c => ({
      name: c.name,
      country: c.country,
      lat: c.lat,
      lon: c.lng || c.lon,
    }));
  } catch (err) {
    console.error(err);
    alert("城市数据加载失败，请刷新重试");
    return [];
  }
}

// --- 自动定位 ---
function locateAndShowWeather() {
  if (!navigator.geolocation) {
    alert("浏览器不支持定位功能，无法自动定位天气");
    return;
  }
  showLoading(true);
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    // 用经纬度请求天气
    await fetchAndShowWeatherByCoords(lat, lon);
    showLoading(false);
  }, () => {
    alert("定位失败，您可以手动搜索城市");
    showLoading(false);
  }, {timeout: 8000});
}

// --- 搜索城市 ---
function searchCities(query) {
  if (!query || query.length < 2) {
    clearSuggestions();
    return [];
  }
  const q = query.toLowerCase();
  // 模糊搜索，名字或国家代码匹配
  return cities.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.country && c.country.toLowerCase().includes(q))
  ).slice(0, 15); // 最多15条建议
}

// --- 渲染建议列表 ---
function showSuggestions(list) {
  suggestions.innerHTML = "";
  if (!list.length) {
    suggestions.classList.remove("visible");
    return;
  }
  list.forEach(city => {
    const li = document.createElement("li");
    li.textContent = `${city.name}, ${city.country}`;
    li.tabIndex = 0;
    li.addEventListener("click", () => {
      selectCity(city);
    });
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter") selectCity(city);
    });
    suggestions.appendChild(li);
  });
  suggestions.classList.add("visible");
}

// --- 清空建议 ---
function clearSuggestions() {
  suggestions.innerHTML = "";
  suggestions.classList.remove("visible");
}

// --- 选择城市，加载天气 ---
async function selectCity(city) {
  currentCity = city;
  searchInput.value = `${city.name}, ${city.country}`;
  clearSuggestions();
  showLoading(true);
  await fetchAndShowWeather(city.name, city.country);
  showLoading(false);
}

// --- 获取天气数据（城市名） ---
async function fetchAndShowWeather(cityName, countryCode) {
  try {
    const q = countryCode ? `${cityName},${countryCode}` : cityName;
    const url = `${WEATHER_API_URL}?q=${encodeURIComponent(q)}&appid=${API_KEY}&units=metric&lang=zh_cn`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("天气数据获取失败");
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    alert("无法获取天气数据，请重试");
    console.error(err);
  }
}

// --- 获取天气数据（经纬度） ---
async function fetchAndShowWeatherByCoords(lat, lon) {
  try {
    const url = `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=zh_cn`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("天气数据获取失败");
    const data = await res.json();
    currentCity = {name: data.name, country: data.sys.country};
    searchInput.value = `${currentCity.name}, ${currentCity.country}`;
    displayWeather(data);
  } catch (err) {
    alert("无法获取天气数据，请重试");
    console.error(err);
  }
}

// --- 显示天气信息 ---
function displayWeather(data) {
  // 温度
  temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
  // 天气描述（中文）
  weatherDescriptionEl.textContent = data.weather[0].description;
  // 湿度
  humidityEl.textContent = `湿度: ${data.main.humidity}%`;
  // 风速
  windSpeedEl.textContent = `风速: ${data.wind.speed} m/s`;
  // 天气图标 SVG 替换
  setWeatherIcon(data.weather[0].icon);
  // 显示容器
  weatherDisplay.classList.remove("hidden");
  // 切换收藏按钮状态
  updateFavoriteBtn();
}

// --- 设置天气图标，替换成SVG ---
function setWeatherIcon(iconCode) {
  // openweathermap icon code 对应SVG
  // 这里提供常用图标的简单替换，更多图标可以扩展
  const iconMap = {
    "01d": `<svg viewBox="0 0 64 64" fill="#f5d742"><circle cx="32" cy="32" r="14"/></svg>`,  // 晴天（白天）
    "01n": `<svg viewBox="0 0 64 64" fill="#aab8c2"><circle cx="32" cy="32" r="14"/></svg>`,  // 晴天（夜晚）
    "02d": `<svg viewBox="0 0 64 64" fill="#f5d742"><circle cx="32" cy="32" r="12"/><circle cx="44" cy="24" r="10" fill="#cfdde6"/></svg>`,  // 少云白天
    "02n": `<svg viewBox="0 0 64 64" fill="#aab8c2"><circle cx="32" cy="32" r="12"/><circle cx="44" cy="24" r="10" fill="#778899"/></svg>`,  // 少云夜晚
    "03d": `<svg viewBox="0 0 64 64" fill="#b0c4de"><circle cx="32" cy="32" r="14"/></svg>`,  // 多云
    "03n": `<svg viewBox="0 0 64 64" fill="#778899"><circle cx="32" cy="32" r="14"/></svg>`,
    "04d": `<svg viewBox="0 0 64 64"><rect x="12" y="22" width="40" height="20" fill="#a0acc9" rx="6"/></svg>`,  // 阴天
    "04n": `<svg viewBox="0 0 64 64"><rect x="12" y="22" width="40" height="20" fill="#52617a" rx="6"/></svg>`,
    "09d": `<svg viewBox="0 0 64 64" fill="#4a90e2"><path d="M20 44h24v4H20z"/></svg>`,  // 小雨
    "09n": `<svg viewBox="0 0 64 64" fill="#2c3e50"><path d="M20 44h24v4H20z"/></svg>`,
    "10d": `<svg viewBox="0 0 64 64" fill="#3d9be9"><path d="M18 44h28v6H18z"/></svg>`,  // 阵雨
    "10n": `<svg viewBox="0 0 64 64" fill="#2c3e50"><path d="M18 44h28v6H18z"/></svg>`,
    "11d": `<svg viewBox="0 0 64 64" fill="#f39c12"><path d="M32 10v44"/></svg>`,  // 雷暴
    "11n": `<svg viewBox="0 0 64 64" fill="#d35400"><path d="M32 10v44"/></svg>`,
    "13d": `<svg viewBox="0 0 64 64" fill="#e0eaf1"><circle cx="32" cy="32" r="14"/></svg>`,  // 雪
    "13n": `<svg viewBox="0 0 64 64" fill="#a0b8c9"><circle cx="32" cy="32" r="14"/></svg>`,
    "50d": `<svg viewBox="0 0 64 64" fill="#bdbdbd"><ellipse cx="32" cy="32" rx="20" ry="10"/></svg>`,  // 雾
    "50n": `<svg viewBox="0 0 64 64" fill="#6b6b6b"><ellipse cx="32" cy="32" rx="20" ry="10"/></svg>`,
  };
  weatherIcon.innerHTML = iconMap[iconCode] || iconMap["01d"];
}

// --- 收藏功能 ---
// 载入收藏
function loadFavorites() {
  const saved = localStorage.getItem("favorites");
  favorites = saved ? JSON.parse(saved) : [];
  renderFavorites();
}

// 保存收藏
function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// 渲染收藏列表
function renderFavorites() {
  favoritesList.innerHTML = "";
  favorites.forEach(city => {
    const btn = document.createElement("button");
    btn.className = "fav-city-btn";
    btn.textContent = `${city.name}, ${city.country}`;
    btn.addEventListener("click", () => {
      selectCity(city);
    });
    favoritesList.appendChild(btn);
  });
}

// 添加或移除收藏
function toggleFavorite() {
  if (!currentCity) return;
  const index = favorites.findIndex(c => c.name === currentCity.name && c.country === currentCity.country);
  if (index >= 0) {
    // 移除收藏
    favorites.splice(index, 1);
  } else {
    // 添加收藏
    favorites.push(currentCity);
  }
  saveFavorites();
  renderFavorites();
  updateFavoriteBtn();
}

// 更新收藏按钮状态
function updateFavoriteBtn() {
  if (!currentCity) {
    favoriteBtn.textContent = "收藏";
    favoriteBtn.disabled = true;
    return;
  }
  const isFav = favorites.some(c => c.name === currentCity.name && c.country === currentCity.country);
  favoriteBtn.textContent = isFav ? "取消收藏" : "收藏";
  favoriteBtn.disabled = false;
}

// --- loading ---
function showLoading(flag) {
  loadingEl.style.display = flag ? "flex" : "none";
}

// --- 事件绑定 ---
searchInput.addEventListener("input", e => {
  const query = e.target.value.trim();
  if (query.length < 2) {
    clearSuggestions();
    return;
  }
  const results = searchCities(query);
  showSuggestions(results);
});

favoriteBtn.addEventListener("click", toggleFavorite);

document.addEventListener("click", (e) => {
  // 点击输入框以外区域关闭建议框
  if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
    clearSuggestions();
  }
});

// --- 启动 ---
init();
