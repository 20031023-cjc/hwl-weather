const API_KEY = 'da7be22a064e8e36c8e9385be0d67fc4';

const translations = {
  ja: {
    title: '世界の天気を調べる',
    placeholder: '場所を入力してください...',
    humidity: '湿度',
    wind: '風速',
    langName: '日本語',
    noResults: '結果がありません',
    loading: '読み込み中...',
  },
  en: {
    title: 'Check Weather Worldwide',
    placeholder: 'Enter location...',
    humidity: 'Humidity',
    wind: 'Wind Speed',
    langName: 'English',
    noResults: 'No results found',
    loading: 'Loading...',
  },
  zh: {
    title: '查询全球天气',
    placeholder: '请输入地点...',
    humidity: '湿度',
    wind: '风速',
    langName: '中文',
    noResults: '未找到结果',
    loading: '加载中...',
  },
};

let currentLang = 'ja';

const elements = {
  title: document.getElementById('title'),
  searchInput: document.getElementById('searchInput'),
  suggestions: document.getElementById('suggestions'),
  weatherDisplay: document.getElementById('weatherDisplay'),
  cityName: document.getElementById('cityName'),
  temperature: document.getElementById('temperature'),
  weatherIcon: document.getElementById('weatherIcon'),
  weatherDesc: document.getElementById('weatherDesc'),
  humidity: document.getElementById('humidity'),
  wind: document.getElementById('wind'),
  loading: document.getElementById('loading'),
};

// 国际城市搜索（使用 OpenWeather API 内置城市）
async function searchCity(query) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric&lang=${currentLang}`;
  try {
    showLoading(true);
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();
    displayWeather(data);
  } catch {
    showNoResult();
  } finally {
    showLoading(false);
  }
}

function displayWeather(data) {
  const { name, weather, main, wind } = data;
  elements.cityName.textContent = name;
  elements.temperature.textContent = `${main.temp}°C`;
  elements.weatherIcon.src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  elements.weatherDesc.textContent = weather[0].description;
  elements.humidity.textContent = `${translations[currentLang].humidity}: ${main.humidity}%`;
  elements.wind.textContent = `${translations[currentLang].wind}: ${wind.speed} m/s`;
  elements.weatherDisplay.classList.remove('hidden');
}

function showLoading(show) {
  elements.loading.classList.toggle('hidden', !show);
  if (show) {
    elements.weatherDisplay.classList.add('hidden');
  }
}

function showNoResult() {
  elements.cityName.textContent = translations[currentLang].noResults;
  elements.temperature.textContent = '';
  elements.weatherIcon.src = '';
  elements.weatherDesc.textContent = '';
  elements.humidity.textContent = '';
  elements.wind.textContent = '';
  elements.weatherDisplay.classList.remove('hidden');
}

document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = e.target.value.trim();
    if (query) searchCity(query);
  }
});

document.querySelectorAll('.lang-switch button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLang = btn.getAttribute('data-lang');
    updateLang();
  });
});

function updateLang() {
  const t = translations[currentLang];
  elements.title.textContent = t.title;
  elements.searchInput.placeholder = t.placeholder;
  // If weather is showing, update text
  if (!elements.weatherDisplay.classList.contains('hidden') && elements.humidity.textContent) {
    const humidityText = elements.humidity.textContent.match(/\d+/)?.[0];
    const windText = elements.wind.textContent.match(/\d+(\.\d+)?/)?.[0];
    elements.humidity.textContent = `${t.humidity}: ${humidityText}%`;
    elements.wind.textContent = `${t.wind}: ${windText} m/s`;
  }
}

// 自动定位用户位置
window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=${currentLang}`;
      try {
        showLoading(true);
        const res = await fetch(url);
        const data = await res.json();
        displayWeather(data);
      } catch {
        console.error('自动定位天气失败');
      } finally {
        showLoading(false);
      }
    });
  }
});
