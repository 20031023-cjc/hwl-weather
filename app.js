const { useState, useEffect, useMemo, useRef } = React;

const API_KEY = "da7be22a064e8e36c8e9385be0d67fc4";

// 城市数据示例（可扩充）
const cities = [
  { jp: "東京", cn: "东京", en: "Tokyo" },
  { jp: "大阪", cn: "大阪", en: "Osaka" },
  { jp: "福岡", cn: "福冈", en: "Fukuoka" },
  { jp: "福州", cn: "福州", en: "Fuzhou" },
  { jp: "ニューヨーク", cn: "纽约", en: "New York" },
  { jp: "ロンドン", cn: "伦敦", en: "London" },
  { jp: "パリ", cn: "巴黎", en: "Paris" },
  { jp: "上海", cn: "上海", en: "Shanghai" },
  { jp: "北京", cn: "北京", en: "Beijing" },
  { jp: "ソウル", cn: "首尔", en: "Seoul" },
  { jp: "台北", cn: "台北", en: "Taipei" },
  // 你可以自行再往这里加更多城市，支持模糊匹配
];

// 多语言文本
const translations = {
  ja: {
    placeholder: "都市名を入力してください...",
    title: "世界の天気検索サイト",
    langBtn: "EN",
    loading: "読み込み中...",
    error: "天気情報が見つかりません。",
    feels_like: "体感温度",
    humidity: "湿度",
    wind: "風速",
  },
  en: {
    placeholder: "Enter city name...",
    title: "Global Weather Finder",
    langBtn: "中文",
    loading: "Loading...",
    error: "Weather info not found.",
    feels_like: "Feels Like",
    humidity: "Humidity",
    wind: "Wind Speed",
  },
  cn: {
    placeholder: "请输入城市名...",
    title: "全球天气查询",
    langBtn: "日本語",
    loading: "加载中...",
    error: "未找到天气信息。",
    feels_like: "体感温度",
    humidity: "湿度",
    wind: "风速",
  },
};

function App() {
  const [lang, setLang] = useState("ja"); // 默认日语
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 设置Fuse.js用于模糊搜索，匹配所有语言字段
  const fuse = useMemo(() => {
    return new Fuse(cities, {
      keys: ["jp", "cn", "en"],
      threshold: 0.3,
    });
  }, []);

  // 监听查询变化，实时更新建议列表
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const results = fuse.search(query);
    setSuggestions(results.slice(0, 7).map(r => r.item));
  }, [query]);

  // 选择城市，获取天气
  const selectCity = (city) => {
    setQuery(city[lang]);
    setSuggestions([]);
    fetchWeather(city.en);
  };

  // 切换语言
  const toggleLang = () => {
    setLang(prev => (prev === "ja" ? "en" : prev === "en" ? "cn" : "ja"));
    setSuggestions([]);
    setWeather(null);
    setError(null);
  };

  // 请求天气数据
  async function fetchWeather(cityName) {
    if (!cityName) return;
    setLoading(true);
    setError(null);
    setWeather(null);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=${lang}`;
      const res = await axios.get(url);
      setWeather(res.data);
    } catch {
      setError(translations[lang].error);
    } finally {
      setLoading(false);
    }
  }

  // 天气图标URL
  function weatherIcon(code) {
    return `https://openweathermap.org/img/wn/${code}@2x.png`;
  }

  return (
    <div className="app-container">
      <button className="lang-select" onClick={toggleLang}>{translations[lang].langBtn}</button>
      <h1>{translations[lang].title}</h1>
      <div style={{ position: "relative" }}>
        <input
          className="search-input"
          type="text"
          placeholder={translations[lang].placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list" role="listbox">
            {suggestions.map((c, i) => (
              <li key={i} onClick={() => selectCity(c)}>
                {c[lang]} / {c.en}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <div className="loader"></div>}

      {error && <p style={{textAlign: "center", marginTop: "1rem"}}>{error}</p>}

      {weather && (
        <div className="weather-display" aria-live="polite">
          <div className="weather-city">
            {weather.name}, {weather.sys.country}
          </div>
          <img
            className="weather-icon"
            src={weatherIcon(weather.weather[0].icon)}
            alt={weather.weather[0].description}
          />
          <div className="weather-temp">{Math.round(weather.main.temp)}°C</div>
          <div className="weather-desc">{weather.weather[0].description}</div>
          <div className="weather-details">
            <div>
              {translations[lang].feels_like}
              <br />
              {Math.round(weather.main.feels_like)}°C
            </div>
            <div>
              {translations[lang].humidity}
              <br />
              {weather.main.humidity}%
            </div>
            <div>
              {translations[lang].wind}
              <br />
              {Math.round(weather.wind.speed)} m/s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
