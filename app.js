const API_KEY = "da7be22a064e8e36c8e9385be0d67fc4";

const elements = {
  searchInput: document.getElementById("searchInput"),
  suggestions: document.getElementById("suggestions"),
  weatherSection: document.querySelector(".weather-section"),
  locationName: document.getElementById("locationName"),
  weatherIcon: document.getElementById("weatherIcon"),
  temp: document.getElementById("temp"),
  desc: document.getElementById("desc"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  langButtons: document.querySelectorAll(".lang-switch button"),
  title: document.getElementById("title"),
};

const LANGUAGES = {
  ja: {
    title: "世界の天気を調べる",
    placeholder: "場所を入力してください...",
    humidity: "湿度",
    wind: "風速",
  },
  en: {
    title: "Check Weather Worldwide",
    placeholder: "Enter a location...",
    humidity: "Humidity",
    wind: "Wind Speed",
  },
  zh: {
    title: "查询全球天气",
    placeholder: "请输入地点...",
    humidity: "湿度",
    wind: "风速",
  },
};

let currentLang = "ja";

// 语言切换
elements.langButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    if (btn.dataset.lang === currentLang) return;
    currentLang = btn.dataset.lang;
    updateLanguage();
  })
);

function updateLanguage() {
  const langData = LANGUAGES[currentLang];
  elements.title.textContent = langData.title;
  elements.searchInput.placeholder = langData.placeholder;
  elements.langButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
  clearWeather();
  clearSuggestions();
}

// 模糊搜索用示例城市数据（现实中可接入更完整的数据库或API）
const cities = [
  { name: { ja: "福岡", en: "Fukuoka", zh: "福州" }, lat: 33.5902, lon: 130.4017 },
  { name: { ja: "東京", en: "Tokyo", zh: "东京" }, lat: 35.6762, lon: 139.6503 },
  { name: { ja: "ニューヨーク", en: "New York", zh: "纽约" }, lat: 40.7128, lon: -74.006 },
  { name: { ja: "大阪", en: "Osaka", zh: "大阪" }, lat: 34.6937, lon: 135.5023 },
  { name: { ja: "福州", en: "Fuzhou", zh: "福州" }, lat: 26.0745, lon: 119.2965 },
  { name: { ja: "札幌", en: "Sapporo", zh: "札幌" }, lat: 43.0618, lon: 141.3545 },
  { name: { ja: "北京", en: "Beijing", zh: "北京" }, lat: 39.9042, lon: 116.4074 },
  // 可扩展更多城市...
];

// 输入时更新建议列表
elements.searchInput.addEventListener("input", () => {
  const input = elements.searchInput.value.trim().toLowerCase();
  if (!input) {
    clearSuggestions();
    return;
  }

  // 过滤城市名，模糊匹配当前语言名和其他两种语言名
  const filtered = cities.filter((city) => {
    return (
      city.name.ja.includes(input) ||
      city.name.en.toLowerCase().includes(input) ||
      city.name.zh.includes(input)
    );
  });

  showSuggestions(filtered.slice(0, 6));
});

function showSuggestions(list) {
  elements.suggestions.innerHTML = "";
  if (list.length === 0) {
    clearSuggestions();
    return;
  }

  list.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city.name[currentLang];
    li.addEventListener("click", () => {
      elements.searchInput.value = city.name[currentLang];
      clearSuggestions();
      fetchWeather(city.lat, city.lon);
    });
    elements.suggestions.appendChild(li);
  });
}

function clearSuggestions() {
  elements.suggestions.innerHTML = "";
  elements.suggestions.style.display = "none";
}

function clearWeather() {
  elements.weatherSection.hidden = true;
  elements.locationName.textContent = "";
  elements.weatherIcon.textContent = "";
  elements.temp.textContent = "";
  elements.desc.textContent = "";
  elements.humidity.textContent = "";
  elements.wind.textContent = "";
}

async function fetchWeather(lat, lon) {
  const langForApi = currentLang === "zh" ? "zh_cn" : currentLang; // API用zh_cn
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${langForApi}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("APIエラー");
    const data = await res.json();

    // 更新页面
    elements.locationName.textContent = data.name;
    elements.weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="weather icon" />`;
    elements.temp.textContent = `${Math.round(data.main.temp)}°C`;
    elements.desc.textContent = data.weather[0].description;
    elements.humidity.textContent = `${LANGUAGES[currentLang].humidity}: ${data.main.humidity}%`;
    elements.wind.textContent = `${LANGUAGES[currentLang].wind}: ${data.wind.speed} m/s`;

    elements.weatherSection.hidden = false;
  } catch (error) {
    alert("天気情報の取得に失敗しました。");
    clearWeather();
  }
}

// 初始化语言
updateLanguage();
