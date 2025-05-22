// API Key
const API_KEY = 'da7be22a064e8e36c8e9385be0d67fc4';

// 多语言文本定义
const translations = {
  ja: {
    title: '世界の天気を調べる',
    placeholder: '場所を入力してください...',
    humidity: '湿度',
    wind: '風速',
    langName: '日本語',
    noResults: '結果がありません',
  },
  en: {
    title: 'Check Weather Worldwide',
    placeholder: 'Enter location...',
    humidity: 'Humidity',
    wind: 'Wind Speed',
    langName: 'English',
    noResults: 'No results found',
  },
  zh: {
    title: '查询全球天气',
    placeholder: '请输入地点...',
    humidity: '湿度',
    wind: '风速',
    langName: '中文',
    noResults: '未找到结果',
  },
};

// 模拟城市数据（支持拼音模糊+中文+日文+英文）
const cityList = [
  { name_ja: '東京', name_en: 'Tokyo', name_zh: '东京', pinyin: 'tokyo' },
  { name_ja: '福岡', name_en: 'Fukuoka', name_zh: '福冈', pinyin: 'fukuoka' },
  { name_ja: '大阪', name_en: 'Osaka', name_zh: '大阪', pinyin: 'osaka' },
  { name_ja: '札幌', name_en: 'Sapporo', name_zh: '札幌', pinyin: 'sapporo' },
  { name_ja: '京都', name_en: 'Kyoto', name_zh: '京都', pinyin: 'kyoto' },
  { name_ja: 'ニューヨーク', name_en: 'New York', name_zh: '纽约', pinyin: 'newyork' },
  { name_ja: '福州', name_en: 'Fuzhou', name_zh: '福州', pinyin: 'fuzhou' },
  { name_ja: '北京', name_en: 'Beijing', name_zh: '北京', pinyin: 'beijing' },
  { name_ja: '上海', name_en: 'Shanghai', name_zh: '上海', pinyin: 'shanghai' },
  { name_ja: '広州', name_en: 'Guangzhou', name_zh: '广州', pinyin: 'guangzhou' },
  { name_ja: '釜山', name_en: 'Busan', name_zh: '釜山', pinyin: 'busan' },
  // 更多城市可扩充...
];

// 当前语言状态
let currentLang = 'ja';

// 获取页面元素
const langButtons = document.querySelectorAll('.lang-switch button');
const titleEl = document.getElementById('title');
const searchInput = document.getElementById('searchInput');
const suggestionsEl = document.getElementById('suggestions');
const weatherDisplay = document.getElementById('weatherDisplay');
const cityNameEl = document.getElementById('cityName');
const temperatureEl = document.getElementById('temperature');
const weatherDescEl = document.getElementById('weatherDesc');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const weatherIconEl = document.getElementById('weatherIcon');

// 语言切换处理
langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.lang === currentLang) return;
    currentLang = btn.dataset.lang;
    updateLanguage();
    clearWeather();
    clearSuggestions();
    searchInput.value = '';
  });
});

function updateLanguage() {
  titleEl.textContent = translations[currentLang].title;
  searchInput.placeholder = translations[currentLang].placeholder;
  langButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

// 清空天气信息
function clearWeather() {
  weatherDisplay.classList.add('hidden');
  cityNameEl.textContent = '';
  temperatureEl.textContent = '';
  weatherDescEl.textContent = '';
  humidityEl.textContent = '';
  windEl.textContent = '';
  weatherIconEl.src = '';
  weatherIconEl.alt = '';
}

// 清空建议列表
function clearSuggestions() {
  suggestionsEl.innerHTML = '';
  suggestionsEl.classList.remove('visible');
}

// 模糊搜索城市
function fuzzySearch(query) {
  if (!query) return [];
  const q = query.trim().toLowerCase();
  const results = cityList.filter(city => {
    return (
      city.name_ja.includes(q) ||
      city.name_en.toLowerCase().includes(q) ||
      city.name_zh.includes(q) ||
      city.pinyin.includes(q)
    );
  });
  return results.slice(0, 6);
}

// 显示建议列表
function showSuggestions(list) {
  clearSuggestions();
  if (list.length === 0) {
    suggestionsEl.innerHTML = `<li class="no-results">${translations[currentLang].noResults}</li>`;
  } else {
    list.forEach(city => {
      const li = document.createElement('li');
      // 语言对应显示名称
      li.textContent = currentLang === 'ja' ? city.name_ja : currentLang === 'en' ? city.name_en : city.name_zh;
      li.dataset.name_en = city.name_en;
      li.addEventListener('click', () => {
        selectCity(city.name_en);
      });
      suggestionsEl.appendChild(li);
    });
  }
  suggestionsEl.classList.add('visible');
}

// 选中城市后查询天气
function selectCity(cityName) {
  searchInput.value = cityName;
  clearSuggestions();
  fetchWeather(cityName);
}

// 调用OpenWeatherMap API获取天气数据
async function fetchWeather(cityName) {
  clearWeather();
  weatherDisplay.classList.remove('hidden');
  cityNameEl.textContent = cityName;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      cityName
    )}&appid=${API_KEY}&units=metric&lang=${currentLang}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();

    temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDescEl.textContent = data.weather[0].description;
    humidityEl.textContent = `${translations[currentLang].humidity}: ${data.main.humidity}%`;
    windEl.textContent = `${translations[currentLang].wind}: ${data.wind.speed} m/s`;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIconEl.alt = data.weather[0].description;
  } catch (err) {
    cityNameEl.textContent = currentLang === 'ja' ? '都市が見つかりません' : currentLang === 'en' ? 'City not found' : '未找到城市';
    temperatureEl.textContent = '';
    weatherDescEl.textContent = '';
    humidityEl.textContent = '';
    windEl.textContent = '';
    weatherIconEl.src = '';
    weatherIconEl.alt = '';
  }
}

// 输入事件处理
search
