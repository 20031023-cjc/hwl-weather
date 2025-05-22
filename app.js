const { useState, useEffect, useMemo } = React;

const API_KEY = "da7be22a064e8e36c8e9385be0d67fc4";

const cities = [
  { jp: "東京", cn: "东京", en: "Tokyo" },
  { jp: "ニューヨーク", cn: "纽约", en: "New York" },
  { jp: "ロンドン", cn: "伦敦", en: "London" },
  { jp: "パリ", cn: "巴黎", en: "Paris" },
  { jp: "上海", cn: "上海", en: "Shanghai" },
  { jp: "北京", cn: "北京", en: "Beijing" },
  { jp: "ソウル", cn: "首尔", en: "Seoul" },
  { jp: "台北", cn: "台北", en: "Taipei" },
  { jp: "福岡", cn: "福冈", en: "Fukuoka" },
  { jp: "福州", cn: "福州", en: "Fuzhou" },
  // 可继续补充更多城市
];

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
  cn: {
    placeholder: "请输入城市名称...",
    title: "世界天气搜索网站",
    langBtn: "日",
    loading: "加载中...",
    error: "找不到天气信息。",
    feels_like: "体感温度",
    humidity: "湿度",
    wind: "风速",
  },
  en: {
    placeholder: "Type city name...",
    title: "World Weather Search",
    langBtn: "日",
    loading: "Loading...",
    error: "Weather info not found.",
    feels_like: "Feels Like",
    humidity: "Humidity",
    wind: "Wind Speed",
  },
};

function App() {
  const [lang, setLang] = useState("ja");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fuse.js 搜索配置，支持3种语言的城市名搜索
  const fuse = useMemo(() => new Fuse(cities, {
    keys: ["jp", "cn", "en"],
    threshold: 0.3,
  }), []);

  useEffect(() => {
    if (query.length > 0) {
      const result = fuse.search(query);
      setSuggestions(result.map(r => r.item));
    } else {
      setSuggestions([]);
    }
  }, [query, fuse]);

  function fetchWeather(city) {
    setLoading(true);
    setError("");
    setWeather(null);

    // API请求时，优先用英文城市名（OpenWeatherMap支持）
    const cityName = city.en;
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`)
      .then(res => {
        setWeather(res.data);
        setLoading(false);
        setSuggestions([]);
        setQuery(""); // 选择后清空输入框
      })
      .catch(() => {
        setError(translations[lang].error);
        setLoading(false);
      });
  }

  function handleSelectCity(city) {
    fetchWeather(city);
  }

  function toggleLang() {
    if (lang === "ja") setLang("en");
    else if (lang === "en") setLang("cn");
    else setLang("ja");
  }

  return (
    <div className="app-container" style={{ fontSize: "16px" }}>
      <h1>{translations[lang].title}</h1>
      <button className="lang-select" onClick={toggleLang}>{translations[lang].langBtn}</button>
      <input
        type="text"
        className="search-input"
        placeholder={translations[lang].placeholder}
        value={query}
        onChange={e => setQuery(e.target.value)}
        spellCheck="false"
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map(city => (
            <li key={city.en} onClick={() => handleSelectCity(city)}>
              {city[lang]}
            </li>
          ))}
        </ul>
      )}

      {loading && <div className="loader"></div>}

      {weather && !loading && (
        <div className="weather-display" key={weather.id}>
          <div className="weather-city">{weather.name}</div>
          <img
            className="weather-icon"
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
            alt={weather.weather[0].description}
          />
          <div className="weather-temp">{Math.round(weather.main.temp)}°C</div>
          <div className="weather-desc">{weather.weather[0].description}</div>
          <div className="weather-details">
            <div>{translations[lang].feels_like}: {Math.round(weather.main.feels_like)}°C</div>
            <div>{translations[lang].humidity}: {weather.main.humidity}%</div>
            <div>{translations[lang].wind}: {weather.wind.speed}m/s</div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
