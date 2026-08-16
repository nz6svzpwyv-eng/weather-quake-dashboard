import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

const weatherCodeMap = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mostly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Cloudy', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  56: { label: 'Freezing drizzle', icon: '🌧️' },
  57: { label: 'Freezing drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌦️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain', icon: '🌧️' },
  67: { label: 'Freezing rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Heavy showers', icon: '🌧️' },
  82: { label: 'Heavy showers', icon: '🌧️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '🌨️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm hail', icon: '⛈️' },
  99: { label: 'Thunderstorm hail', icon: '⛈️' },
};

const uiText = {
  en: {
    liveMonitoring: 'Live monitoring',
    language: 'Language',
    searchPlaceholder: 'Search city or region',
    searchButton: 'Search',
    updated: 'Updated',
    useMyLocation: 'Use my location',
    currentConditions: 'Current conditions',
    live: 'LIVE',
    loadingWeather: 'Loading weather...',
    wind: 'Wind',
    humidity: 'Humidity',
    rain: 'Rain',
    radar: 'Radar',
    weatherRadar: 'Weather radar',
    seismicActivity: 'Seismic activity',
    earthquakes: 'Earthquakes',
    allMagnitudes: 'All magnitudes',
    events: 'events',
    filter: 'filter',
    movementPrediction: 'Movement prediction',
    futureMovementTimeline: 'Future movement timeline',
    now: 'Now',
    plus1_5h: '+1.5h',
    past: 'Past',
    future: 'Future',
    loadingRadar: 'Loading radar...',
    loadingQuakes: 'Loading quake data...',
    significantSeismic: '⚠️ Significant seismic activity nearby:',
    near: 'near',
    feelsLike: 'feels like',
    all: 'Any',
    locationNotFound: 'Location not found. Try a major city like Tokyo, Seattle, or London.',
  },
  es: {
    liveMonitoring: 'Monitoreo en vivo',
    language: 'Idioma',
    searchPlaceholder: 'Buscar ciudad o región',
    searchButton: 'Buscar',
    updated: 'Actualizado',
    useMyLocation: 'Usar mi ubicación',
    currentConditions: 'Condiciones actuales',
    live: 'EN VIVO',
    loadingWeather: 'Cargando clima...',
    wind: 'Viento',
    humidity: 'Humedad',
    rain: 'Lluvia',
    radar: 'Radar',
    weatherRadar: 'Radar meteorológico',
    seismicActivity: 'Actividad sísmica',
    earthquakes: 'Terremotos',
    allMagnitudes: 'Todas las magnitudes',
    events: 'eventos',
    filter: 'filtro',
    movementPrediction: 'Predicción de movimiento',
    futureMovementTimeline: 'Cronología del movimiento futuro',
    now: 'Ahora',
    plus1_5h: '+1.5h',
    past: 'Pasado',
    future: 'Futuro',
    loadingRadar: 'Cargando radar...',
    loadingQuakes: 'Cargando datos sísmicos...',
    significantSeismic: '⚠️ Hay actividad sísmica significativa cerca:',
    near: 'cerca de',
    feelsLike: 'sensación térmica',
    all: 'Cualquiera',
    locationNotFound: 'Ubicación no encontrada. Prueba una ciudad importante como Tokio, Seattle o Londres.',
  },
  fr: {
    liveMonitoring: 'Surveillance en direct',
    language: 'Langue',
    searchPlaceholder: 'Rechercher une ville ou une région',
    searchButton: 'Rechercher',
    updated: 'Mis à jour',
    useMyLocation: 'Utiliser ma position',
    currentConditions: 'Conditions actuelles',
    live: 'EN DIRECT',
    loadingWeather: 'Chargement de la météo...',
    wind: 'Vent',
    humidity: 'Humidité',
    rain: 'Pluie',
    radar: 'Radar',
    weatherRadar: 'Radar météo',
    seismicActivity: 'Activité sismique',
    earthquakes: 'Séismes',
    allMagnitudes: 'Toutes magnitudes',
    events: 'événements',
    filter: 'filtre',
    movementPrediction: 'Prévision du mouvement',
    futureMovementTimeline: 'Chronologie du mouvement futur',
    now: 'Maintenant',
    plus1_5h: '+1,5h',
    past: 'Passé',
    future: 'Futur',
    loadingRadar: 'Chargement du radar...',
    loadingQuakes: 'Chargement des séismes...',
    significantSeismic: '⚠️ Activité sismique importante à proximité :',
    near: 'près de',
    feelsLike: 'ressenti',
    all: 'Toute',
    locationNotFound: 'Emplacement introuvable. Essayez une grande ville comme Tokyo, Seattle ou Londres.',
  },
  de: {
    liveMonitoring: 'Live-Überwachung',
    language: 'Sprache',
    searchPlaceholder: 'Stadt oder Region suchen',
    searchButton: 'Suchen',
    updated: 'Aktualisiert',
    useMyLocation: 'Meinen Standort verwenden',
    currentConditions: 'Aktuelle Bedingungen',
    live: 'LIVE',
    loadingWeather: 'Wetter wird geladen...',
    wind: 'Wind',
    humidity: 'Luftfeuchtigkeit',
    rain: 'Regen',
    radar: 'Radar',
    weatherRadar: 'Wetterradar',
    seismicActivity: 'Seismische Aktivität',
    earthquakes: 'Erdbeben',
    allMagnitudes: 'Alle Magnituden',
    events: 'Ereignisse',
    filter: 'Filter',
    movementPrediction: 'Bewegungsvorhersage',
    futureMovementTimeline: 'Zukunfts-Zeitachse',
    now: 'Jetzt',
    plus1_5h: '+1,5h',
    past: 'Vergangenheit',
    future: 'Zukunft',
    loadingRadar: 'Radar wird geladen...',
    loadingQuakes: 'Erdbebendaten werden geladen...',
    significantSeismic: '⚠️ Bedeutende seismische Aktivität in der Nähe:',
    near: 'nahe',
    feelsLike: 'gefühlt wie',
    all: 'Alle',
    locationNotFound: 'Standort nicht gefunden. Probieren Sie eine große Stadt wie Tokio, Seattle oder London.',
  },
  ja: {
    liveMonitoring: 'ライブ監視',
    language: '言語',
    searchPlaceholder: '都市または地域を検索',
    searchButton: '検索',
    updated: '更新',
    useMyLocation: '現在地を使用',
    currentConditions: '現在の天候',
    live: 'ライブ',
    loadingWeather: '天気を読み込み中...',
    wind: '風',
    humidity: '湿度',
    rain: '雨',
    radar: 'レーダー',
    weatherRadar: '天気レーダー',
    seismicActivity: '地震活動',
    earthquakes: '地震',
    allMagnitudes: 'すべてのマグニチュード',
    events: '件',
    filter: 'フィルター',
    movementPrediction: '移動予報',
    futureMovementTimeline: '将来の動きのタイムライン',
    now: '現在',
    plus1_5h: '+1.5h',
    past: '過去',
    future: '未来',
    loadingRadar: 'レーダーを読み込み中...',
    loadingQuakes: '地震データを読み込み中...',
    significantSeismic: '⚠️ 近くで大きな地震活動があります:',
    near: '付近',
    feelsLike: '体感温度',
    all: 'すべて',
    locationNotFound: '場所が見つかりません。東京、シアトル、ロンドンなどの大都市をお試しください。',
  },
  zh: {
    liveMonitoring: '实时监测',
    language: '语言',
    searchPlaceholder: '搜索城市或地区',
    searchButton: '搜索',
    updated: '已更新',
    useMyLocation: '使用我的位置',
    currentConditions: '当前天气',
    live: '实时',
    loadingWeather: '正在加载天气...',
    wind: '风',
    humidity: '湿度',
    rain: '雨量',
    radar: '雷达',
    weatherRadar: '天气雷达',
    seismicActivity: '地震活动',
    earthquakes: '地震',
    allMagnitudes: '所有震级',
    events: '事件',
    filter: '筛选',
    movementPrediction: '移动预测',
    futureMovementTimeline: '未来移动时间轴',
    now: '现在',
    plus1_5h: '+1.5h',
    past: '过去',
    future: '未来',
    loadingRadar: '正在加载雷达...',
    loadingQuakes: '正在加载地震数据...',
    significantSeismic: '⚠️ 附近存在明显地震活动：',
    near: '附近',
    feelsLike: '体感',
    all: '任何',
    locationNotFound: '未找到位置。请尝试东京、西雅图或伦敦等大城市。',
  },
};

const translatedWeatherCodeMap = {
  en: weatherCodeMap,
  es: {
    0: { label: 'Cielo despejado', icon: '☀️' },
    1: { label: 'Mayormente despejado', icon: '🌤️' },
    2: { label: 'Parcialmente nublado', icon: '⛅' },
    3: { label: 'Nublado', icon: '☁️' },
    45: { label: 'Niebla', icon: '🌫️' },
    48: { label: 'Niebla', icon: '🌫️' },
    51: { label: 'Llovizna ligera', icon: '🌦️' },
    53: { label: 'Llovizna', icon: '🌦️' },
    55: { label: 'Llovizna fuerte', icon: '🌧️' },
    56: { label: 'Llovizna helada', icon: '🌧️' },
    57: { label: 'Llovizna helada', icon: '🌧️' },
    61: { label: 'Lluvia ligera', icon: '🌦️' },
    63: { label: 'Lluvia', icon: '🌧️' },
    65: { label: 'Lluvia fuerte', icon: '🌧️' },
    66: { label: 'Lluvia helada', icon: '🌧️' },
    67: { label: 'Lluvia helada', icon: '🌧️' },
    71: { label: 'Nieve ligera', icon: '🌨️' },
    73: { label: 'Nieve', icon: '❄️' },
    75: { label: 'Nieve fuerte', icon: '❄️' },
    77: { label: 'Granizo', icon: '❄️' },
    80: { label: 'Lluvias', icon: '🌦️' },
    81: { label: 'Chubascos fuertes', icon: '🌧️' },
    82: { label: 'Chubascos fuertes', icon: '🌧️' },
    85: { label: 'Chubascos de nieve', icon: '🌨️' },
    86: { label: 'Fuertes chubascos de nieve', icon: '🌨️' },
    95: { label: 'Tormenta', icon: '⛈️' },
    96: { label: 'Tormenta con granizo', icon: '⛈️' },
    99: { label: 'Tormenta con granizo', icon: '⛈️' },
  },
  fr: {
    0: { label: 'Ciel dégagé', icon: '☀️' },
    1: { label: 'Peu nuageux', icon: '🌤️' },
    2: { label: 'Partiellement nuageux', icon: '⛅' },
    3: { label: 'Nuageux', icon: '☁️' },
    45: { label: 'Brouillard', icon: '🌫️' },
    48: { label: 'Brouillard', icon: '🌫️' },
    51: { label: 'Bruine légère', icon: '🌦️' },
    53: { label: 'Bruine', icon: '🌦️' },
    55: { label: 'Bruine forte', icon: '🌧️' },
    56: { label: 'Bruine verglaçante', icon: '🌧️' },
    57: { label: 'Bruine verglaçante', icon: '🌧️' },
    61: { label: 'Pluie légère', icon: '🌦️' },
    63: { label: 'Pluie', icon: '🌧️' },
    65: { label: 'Pluie forte', icon: '🌧️' },
    66: { label: 'Pluie verglaçante', icon: '🌧️' },
    67: { label: 'Pluie verglaçante', icon: '🌧️' },
    71: { label: 'Neige légère', icon: '🌨️' },
    73: { label: 'Neige', icon: '❄️' },
    75: { label: 'Neige forte', icon: '❄️' },
    77: { label: 'Grains de neige', icon: '❄️' },
    80: { label: 'Averses', icon: '🌦️' },
    81: { label: 'Fortes averses', icon: '🌧️' },
    82: { label: 'Fortes averses', icon: '🌧️' },
    85: { label: 'Averses de neige', icon: '🌨️' },
    86: { label: 'Fortes averses de neige', icon: '🌨️' },
    95: { label: 'Orage', icon: '⛈️' },
    96: { label: 'Orage et grêle', icon: '⛈️' },
    99: { label: 'Orage et grêle', icon: '⛈️' },
  },
  de: {
    0: { label: 'Klarer Himmel', icon: '☀️' },
    1: { label: 'Meistens klar', icon: '🌤️' },
    2: { label: 'Teilweise bewölkt', icon: '⛅' },
    3: { label: 'Bewölkt', icon: '☁️' },
    45: { label: 'Nebel', icon: '🌫️' },
    48: { label: 'Nebel', icon: '🌫️' },
    51: { label: 'Leichter Nieselregen', icon: '🌦️' },
    53: { label: 'Nieselregen', icon: '🌦️' },
    55: { label: 'Starker Nieselregen', icon: '🌧️' },
    56: { label: 'Gefrierender Nieselregen', icon: '🌧️' },
    57: { label: 'Gefrierender Nieselregen', icon: '🌧️' },
    61: { label: 'Leichter Regen', icon: '🌦️' },
    63: { label: 'Regen', icon: '🌧️' },
    65: { label: 'Starker Regen', icon: '🌧️' },
    66: { label: 'Gefrierender Regen', icon: '🌧️' },
    67: { label: 'Gefrierender Regen', icon: '🌧️' },
    71: { label: 'Leichter Schneefall', icon: '🌨️' },
    73: { label: 'Schnee', icon: '❄️' },
    75: { label: 'Starker Schneefall', icon: '❄️' },
    77: { label: 'Schneekörner', icon: '❄️' },
    80: { label: 'Regenschauer', icon: '🌦️' },
    81: { label: 'Starke Schauer', icon: '🌧️' },
    82: { label: 'Starke Schauer', icon: '🌧️' },
    85: { label: 'Schneeschauer', icon: '🌨️' },
    86: { label: 'Starke Schneeschauer', icon: '🌨️' },
    95: { label: 'Gewitter', icon: '⛈️' },
    96: { label: 'Gewitter mit Hagel', icon: '⛈️' },
    99: { label: 'Gewitter mit Hagel', icon: '⛈️' },
  },
  ja: {
    0: { label: '快晴', icon: '☀️' },
    1: { label: '晴れ', icon: '🌤️' },
    2: { label: '晴れ時々曇り', icon: '⛅' },
    3: { label: '曇り', icon: '☁️' },
    45: { label: '霧', icon: '🌫️' },
    48: { label: '霧', icon: '🌫️' },
    51: { label: '霧雨', icon: '🌦️' },
    53: { label: '霧雨', icon: '🌦️' },
    55: { label: '強い霧雨', icon: '🌧️' },
    56: { label: '凍結霧雨', icon: '🌧️' },
    57: { label: '凍結霧雨', icon: '🌧️' },
    61: { label: '小雨', icon: '🌦️' },
    63: { label: '雨', icon: '🌧️' },
    65: { label: '大雨', icon: '🌧️' },
    66: { label: '凍結雨', icon: '🌧️' },
    67: { label: '凍結雨', icon: '🌧️' },
    71: { label: '小雪', icon: '🌨️' },
    73: { label: '雪', icon: '❄️' },
    75: { label: '大雪', icon: '❄️' },
    77: { label: '霙', icon: '❄️' },
    80: { label: 'にわか雨', icon: '🌦️' },
    81: { label: '強いにわか雨', icon: '🌧️' },
    82: { label: '強いにわか雨', icon: '🌧️' },
    85: { label: 'にわか雪', icon: '🌨️' },
    86: { label: '強いにわか雪', icon: '🌨️' },
    95: { label: '雷雨', icon: '⛈️' },
    96: { label: '雹を伴う雷雨', icon: '⛈️' },
    99: { label: '雹を伴う雷雨', icon: '⛈️' },
  },
  zh: {
    0: { label: '晴朗', icon: '☀️' },
    1: { label: '大部晴朗', icon: '🌤️' },
    2: { label: '局部多云', icon: '⛅' },
    3: { label: '多云', icon: '☁️' },
    45: { label: '雾', icon: '🌫️' },
    48: { label: '雾', icon: '🌫️' },
    51: { label: '毛毛雨', icon: '🌦️' },
    53: { label: '毛毛雨', icon: '🌦️' },
    55: { label: '强毛毛雨', icon: '🌧️' },
    56: { label: '冻毛毛雨', icon: '🌧️' },
    57: { label: '冻毛毛雨', icon: '🌧️' },
    61: { label: '小雨', icon: '🌦️' },
    63: { label: '雨', icon: '🌧️' },
    65: { label: '大雨', icon: '🌧️' },
    66: { label: '冻雨', icon: '🌧️' },
    67: { label: '冻雨', icon: '🌧️' },
    71: { label: '小雪', icon: '🌨️' },
    73: { label: '雪', icon: '❄️' },
    75: { label: '大雪', icon: '❄️' },
    77: { label: '雪粒', icon: '❄️' },
    80: { label: '阵雨', icon: '🌦️' },
    81: { label: '强阵雨', icon: '🌧️' },
    82: { label: '强阵雨', icon: '🌧️' },
    85: { label: '阵雪', icon: '🌨️' },
    86: { label: '强阵雪', icon: '🌨️' },
    95: { label: '雷暴', icon: '⛈️' },
    96: { label: '伴有冰雹的雷暴', icon: '⛈️' },
    99: { label: '伴有冰雹的雷暴', icon: '⛈️' },
  },
};

const defaultLocation = { name: 'Los Angeles, California', lat: 34.0522, lon: -118.2437 };
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
];

function getWeatherInfo(code, language = 'en') {
  const selectedMap = translatedWeatherCodeMap[language] || translatedWeatherCodeMap.en;
  return selectedMap[code] || selectedMap[0] || weatherCodeMap[code] || { label: 'Conditions', icon: '🌤️' };
}

async function fetchWeather(lat, lon, language = 'en') {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4&language=${language}`
  );
  return response.json();
}

async function searchLocation(query, language = 'en') {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=${language}&format=json`
  );
  const data = await response.json();

  if (!data.results || !data.results.length) {
    throw new Error('Location not found');
  }

  const result = data.results[0];

  return {
    name: `${result.name}${result.admin1 ? `, ${result.admin1}` : ''}${result.country ? `, ${result.country}` : ''}`,
    lat: result.latitude,
    lon: result.longitude,
  };
}

async function searchSuggestions(query, language = 'en') {
  if (!query.trim()) return [];

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=${language}&format=json`
  );
  const data = await response.json();
  return data.results || [];
}

async function fetchEarthquakes() {
  const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
  return response.json();
}

async function fetchWeatherAlerts(lat, lon) {
  try {
    const pointsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
    const pointsData = await pointsResponse.json();
    
    if (!pointsData.properties?.forecastZone) {
      return { features: [] };
    }

    const zoneId = pointsData.properties.forecastZone.split('/').pop();
    const alertsResponse = await fetch(`https://api.weather.gov/alerts/active?area=${zoneId}`);
    return alertsResponse.json();
  } catch (error) {
    console.warn('Weather alerts unavailable', error);
    return { features: [] };
  }
}

function formatDay(dateValue) {
  return new Date(dateValue).toLocaleDateString(undefined, { weekday: 'short' });
}

function WeatherMap({ lat, lon, overlayMode = 'standard', mapStyle = 'dark', compact = false, fullscreen = false }) {
  const [radarFrames, setRadarFrames] = useState([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [stateLines, setStateLines] = useState(null);

  useEffect(() => {
    async function loadStateLines() {
      try {
        const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        const data = await response.json();
        setStateLines(data);
      } catch (error) {
        console.warn('Country boundaries unavailable', error);
      }
    }
    loadStateLines();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadRadar() {
      try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await response.json();
        const allFrames = [...(data.radar?.past || []), ...(data.radar?.nowcast || [])].filter(
          (frame) => frame && frame.path && frame.time
        );

        if (active && allFrames.length) {
          const liveFrameIndex = allFrames.findIndex((frame) => frame.time >= Date.now() / 1000);
          const startingIndex = liveFrameIndex >= 0 ? liveFrameIndex : Math.max(0, allFrames.length - 1);
          setRadarFrames(allFrames);
          setFrameIndex(startingIndex);
        }
      } catch (error) {
        console.warn('Radar metadata unavailable', error);
      }
    }

    loadRadar();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!radarFrames.length || isScrubbing || !isPlaying) return undefined;

    const timer = setInterval(() => {
      setFrameIndex((current) => (current + 1) % radarFrames.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [radarFrames, isScrubbing, isPlaying]);

  const currentFrame = radarFrames[frameIndex] || radarFrames[radarFrames.length - 1];
  const radarUrl = currentFrame
    ? `https://tilecache.rainviewer.com${currentFrame.path}/256/{z}/{x}/{y}/2/1_0.png`
    : 'https://tilecache.rainviewer.com/v2/radar/aa2cfc7c7e98/256/{z}/{x}/{y}/2/1_0.png';

  const sliderMin = 0;
  const sliderMax = Math.max(radarFrames.length - 1, 0);
  const liveFrameIndex = radarFrames.findIndex((frame) => frame.time >= Date.now() / 1000);
  const forecastStartIndex = liveFrameIndex >= 0 ? liveFrameIndex : 0;
  const forecastWindowMinutes = radarFrames.length
    ? Math.max(
        0,
        Math.round((radarFrames[sliderMax].time - radarFrames[Math.max(forecastStartIndex, 0)].time) / 60)
      )
    : 0;
  const frameTimestamp = currentFrame?.time
    ? new Date(currentFrame.time * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : 'Live';

  const markerIndexes = radarFrames.length
    ? [0, Math.round(sliderMax * 0.25), Math.round(sliderMax * 0.5), Math.round(sliderMax * 0.75), sliderMax]
        .filter((value, index, values) => value >= 0 && value <= sliderMax && values.indexOf(value) === index)
    : [];

  return (
    <>
      <div className="radar-meta">
        <span>Movement prediction</span>
        <span>{frameTimestamp}</span>
      </div>
      <div className={`radar-map-shell map-mode-${overlayMode}`}>
        <MapContainer center={[lat, lon]} zoom={fullscreen ? 9 : 8} scrollWheelZoom className="leaflet-map">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url={
              mapStyle === 'terrain'
                ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                : mapStyle === 'satellite'
                  ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            }
          />
          <TileLayer attribution="RainViewer" url={radarUrl} opacity={0.82} />
          {mapStyle === 'satellite' && stateLines && (
            <GeoJSON data={stateLines} style={{ color: '#999999', weight: 1.5, opacity: 0.7, fillOpacity: 0 }} />
          )}
        </MapContainer>
      </div>

      <div className="radar-toolbar">
        <button type="button" className="map-mini-button" onClick={() => setIsPlaying((current) => !current)}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="map-mini-button" onClick={() => setFrameIndex((current) => (current === 0 ? radarFrames.length - 1 : current - 1))}>
          −10m
        </button>
        <button type="button" className="map-mini-button" onClick={() => setFrameIndex((current) => (current + 1) % radarFrames.length)}>
          +10m
        </button>
      </div>

      <div className="radar-legend">
        <span>Light</span>
        <div className="radar-legend-bar" />
        <span>Heavy</span>
      </div>

      <div className="radar-slider-wrap">
        <div className="radar-slider-header">
          <label className="radar-slider-label" htmlFor="radar-stepper">
            Future movement timeline
          </label>
          <span className="radar-forecast-window">+{Math.min(forecastWindowMinutes, 90)} min</span>
        </div>

        {markerIndexes.length > 0 && (
          <div className="radar-timeline-markers" aria-hidden="true">
            {markerIndexes.map((markerIndex) => {
              const markerFrame = radarFrames[markerIndex];
              const deltaMinutes = markerFrame && radarFrames[forecastStartIndex]
                ? Math.max(0, Math.round((markerFrame.time - radarFrames[forecastStartIndex].time) / 60))
                : 0;
              const left = sliderMax === 0 ? 0 : (markerIndex / sliderMax) * 100;

              return (
                <div className="radar-tick" key={`${markerIndex}-${markerFrame?.time}`} style={{ left: `${left}%` }}>
                  <span>+{deltaMinutes}m</span>
                </div>
              );
            })}
          </div>
        )}

        <input
          id="radar-stepper"
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={1}
          value={frameIndex}
          disabled={!radarFrames.length}
          onMouseDown={() => setIsScrubbing(true)}
          onTouchStart={() => setIsScrubbing(true)}
          onChange={(event) => setFrameIndex(Number(event.target.value))}
          onMouseUp={() => setIsScrubbing(false)}
          onTouchEnd={() => setIsScrubbing(false)}
          className="radar-slider"
        />
        <div className="radar-slider-scale">
          <span>Now</span>
          <span>+1.5h</span>
        </div>
      </div>

    </>
  );
}

function EarthquakeMap({ earthquakes, overlayMode = 'standard', mapStyle = 'dark', fullscreen = false }) {
  const points = earthquakes.slice(0, 25);

  return (
    <div className={`quake-map-shell map-mode-${overlayMode}`}>
      <MapContainer center={[20, 0]} zoom={fullscreen ? 4 : 3} scrollWheelZoom className="leaflet-map">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url={
            mapStyle === 'terrain'
              ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              : mapStyle === 'satellite'
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          }
        />

      {points.map((earthquake, index) => {
        const [lng, lat] = earthquake.geometry.coordinates;
        const magnitude = earthquake.properties.mag || 0;

        return (
          <CircleMarker
            key={`${earthquake.id}-${index}`}
            center={[lat, lng]}
            radius={Math.max(5, magnitude * 3)}
            pathOptions={{
              color: magnitude >= 5 ? '#f87171' : '#fbbf24',
              fillColor: magnitude >= 5 ? '#f87171' : '#fbbf24',
              fillOpacity: 0.8,
              weight: 1,
            }}
          >
            <Popup>
              <div>
                <strong>{earthquake.properties.place}</strong>
                <br />
                Magnitude: {magnitude}
                <br />
                {new Date(earthquake.properties.time).toLocaleString()}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
      </MapContainer>
    </div>
  );
}

function Dashboard() {
  const [location, setLocation] = useState(defaultLocation);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [magnitudeFilter, setMagnitudeFilter] = useState(0);
  const [language, setLanguage] = useState('en');
  const [weatherOverlay, setWeatherOverlay] = useState('standard');
  const [weatherMapStyle, setWeatherMapStyle] = useState('terrain');
  const [quakeMapStyle, setQuakeMapStyle] = useState('terrain');
  const [fullscreenMap, setFullscreenMap] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const text = uiText[language] || uiText.en;

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=${language}&format=json`
        );
        const data = await response.json();

        const area = data?.results?.[0];
        if (!area) return;

        setLocation({
          name: `${area.name}${area.country ? `, ${area.country}` : ''}`,
          lat: latitude,
          lon: longitude,
        });
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [language]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      const results = await searchSuggestions(query, language);
      setSuggestions(results.slice(0, 5));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, language]);

  const weatherQuery = useQuery({
    queryKey: ['weather', location.lat, location.lon, language],
    queryFn: () => fetchWeather(location.lat, location.lon, language),
    staleTime: 60_000,
  });

  const earthquakeQuery = useQuery({
    queryKey: ['earthquakes'],
    queryFn: fetchEarthquakes,
    staleTime: 120_000,
  });

  const weatherAlertsQuery = useQuery({
    queryKey: ['weatherAlerts', location.lat, location.lon],
    queryFn: () => fetchWeatherAlerts(location.lat, location.lon),
    staleTime: 60_000,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      weatherQuery.refetch();
      earthquakeQuery.refetch();
      weatherAlertsQuery.refetch();
    }, 60000);

    return () => clearInterval(timer);
  }, [weatherQuery, earthquakeQuery, weatherAlertsQuery]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 60000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showAlert]);

  const weatherData = weatherQuery.data;
  const quakeData = earthquakeQuery.data;
  const current = weatherData?.current;
  const daily = weatherData?.daily;
  const currentWeather = current ? getWeatherInfo(current.weather_code, language) : null;

  useEffect(() => {
    if (weatherData && location) {
      document.title = `StormWatch | ${location.name}`;
    }
  }, [location, weatherData]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      const result = await searchLocation(trimmed, language);
      setLocation(result);
      setQuery('');
      setSuggestions([]);
    } catch {
      alert(text.locationNotFound);
    }
  };

  const handleSuggestionPick = (item) => {
    const nextLocation = {
      name: `${item.name}${item.admin1 ? `, ${item.admin1}` : ''}${item.country ? `, ${item.country}` : ''}`,
      lat: item.latitude,
      lon: item.longitude,
    };

    setLocation(nextLocation);
    setQuery('');
    setSuggestions([]);
  };

  const forecastItems = daily
    ? daily.time.slice(0, 4).map((date, index) => ({
        date,
        code: daily.weather_code[index],
        high: daily.temperature_2m_max[index],
        low: daily.temperature_2m_min[index],
      }))
    : [];

  const earthquakeFeatures = quakeData?.features || [];
  const filteredEarthquakes = earthquakeFeatures.filter(
    (quake) => (quake.properties.mag ?? 0) >= magnitudeFilter
  );

  const strongestQuake = filteredEarthquakes.reduce((highest, quake) => {
    if (!highest || (quake.properties.mag ?? 0) > (highest.properties.mag ?? 0)) {
      return quake;
    }
    return highest;
  }, null);

  const updatedAt = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{text.liveMonitoring}</p>
          <h1>StormWatch</h1>
        </div>

        <div className="topbar-actions">
          <label className="language-picker" htmlFor="language-select">
            <span>{text.language}</span>
            <select
              id="language-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label="Select dashboard language"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="search-wrap">
          <form className="search-box" onSubmit={handleSearch}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="text"
              placeholder={text.searchPlaceholder}
              aria-label={text.searchPlaceholder}
            />
            <button type="submit">{text.searchButton}</button>
          </form>

            {suggestions.length > 0 && (
              <div className="search-suggestions" role="listbox">
                {suggestions.map((item) => (
                  <button
                    type="button"
                    key={`${item.name}-${item.latitude}-${item.longitude}`}
                    className="suggestion-item"
                    onClick={() => handleSuggestionPick(item)}
                  >
                    {item.name}
                    {item.country ? `, ${item.country}` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="toolbar">
        <div className="toolbar-badge">{text.updated} {updatedAt}</div>
        <button
          type="button"
          className="locate-button"
          onClick={() => {
            navigator.geolocation?.getCurrentPosition?.(async (position) => {
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=${language}&format=json`
              );
              const data = await response.json();
              const area = data?.results?.[0];
              if (area) {
                setLocation({
                  name: `${area.name}${area.country ? `, ${area.country}` : ''}`,
                  lat: latitude,
                  lon: longitude,
                });
              }
            });
          }}
        >
          {text.useMyLocation}
        </button>
      </div>

      {strongestQuake && strongestQuake.properties.mag >= 5.5 && showAlert && (
        <div className="alert-banner">
          ⚠️ Significant seismic activity nearby: M {strongestQuake.properties.mag} near {strongestQuake.properties.place}
        </div>
      )}

      {weatherAlertsQuery.data?.features && weatherAlertsQuery.data.features.length > 0 && (
        <div className="weather-alerts-section">
          <h3>Active Weather Alerts</h3>
          <div className="alerts-list">
            {weatherAlertsQuery.data.features.slice(0, 5).map((alert) => (
              <div key={alert.id} className="alert-item">
                <div className="alert-header">
                  <strong className="alert-event">{alert.properties.event}</strong>
                  <span className="alert-severity" data-severity={alert.properties.severity?.toLowerCase() || 'unknown'}>
                    {alert.properties.severity || 'Unknown'}
                  </span>
                </div>
                <p className="alert-description">{alert.properties.headline}</p>
                <div className="alert-meta">
                  <span>Until: {new Date(alert.properties.expires).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="dashboard">
        <section className="weather-panel panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">{text.currentConditions}</p>
              <h2>{location.name}</h2>
            </div>
            <span className="status-badge">{text.live}</span>
          </div>

          <div className="current-weather">
            <div>
              <div className="temp-row">
                <span className="temp">{current ? `${Math.round(current.temperature_2m)}°` : '--°'}</span>
                <span className="weather-icon" aria-label="Weather condition">
                  {currentWeather?.icon || '☀️'}
                </span>
              </div>
              <p className="summary">
                {currentWeather ? `${currentWeather.label} · ${text.feelsLike} ${Math.round(current.apparent_temperature)}°` : text.loadingWeather}
              </p>
            </div>

            <div className="weather-metrics">
              <div className="metric">
                <span>{text.wind}</span>
                <strong>{current ? `${Math.round(current.wind_speed_10m)} km/h` : '-- km/h'}</strong>
              </div>
              <div className="metric">
                <span>{text.humidity}</span>
                <strong>{current ? `${Math.round(current.relative_humidity_2m)}%` : '--%'}</strong>
              </div>
              <div className="metric">
                <span>{text.rain}</span>
                <strong>{current ? `${current.precipitation ?? 0} mm` : '-- mm'}</strong>
              </div>
            </div>
          </div>

          <div className="forecast">
            {forecastItems.map((item) => {
              const info = getWeatherInfo(item.code, language);
              return (
                <div key={item.date} className="forecast-card">
                  <span>{formatDay(item.date)}</span>
                  <strong>{info.icon}</strong>
                  <span>
                    {Math.round(item.high)}° / {Math.round(item.low)}°
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel map-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">{text.radar}</p>
              <h2>{text.weatherRadar}</h2>
            </div>
            <div className="panel-actions">
            <div className="overlay-toggle-group">
                <button type="button" className={weatherOverlay === 'standard' ? 'active' : ''} onClick={() => setWeatherOverlay('standard')}>Standard</button>
              </div>
              <div className="style-toggle-group">
                <button type="button" className={weatherMapStyle === 'terrain' ? 'active' : ''} onClick={() => setWeatherMapStyle('terrain')}>Terrain</button>
                <button type="button" className={weatherMapStyle === 'satellite' ? 'active' : ''} onClick={() => setWeatherMapStyle('satellite')}>Satellite</button>
              </div>
              <button type="button" className="fullscreen-button" onClick={() => setFullscreenMap('weather')}>Full screen</button>
            </div>
          </div>
          {weatherData ? <WeatherMap lat={location.lat} lon={location.lon} overlayMode={weatherOverlay} mapStyle={weatherMapStyle} fullscreen={false} /> : <div className="loading-box">{text.loadingRadar}</div>}
        </section>

        <section className="panel quake-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">{text.seismicActivity}</p>
              <h2>{text.earthquakes}</h2>
            </div>
            <div className="panel-actions">
              <div className="style-toggle-group">
                <button type="button" className={quakeMapStyle === 'terrain' ? 'active' : ''} onClick={() => setQuakeMapStyle('terrain')}>Terrain</button>
                <button type="button" className={quakeMapStyle === 'satellite' ? 'active' : ''} onClick={() => setQuakeMapStyle('satellite')}>Satellite</button>
              </div>
              <button type="button" className="fullscreen-button" onClick={() => setFullscreenMap('quake')}>Full screen</button>
            </div>
            <select
              className="filter-select"
              value={magnitudeFilter}
              onChange={(event) => setMagnitudeFilter(Number(event.target.value))}
              aria-label="Minimum earthquake magnitude"
            >
              <option value={0}>{text.allMagnitudes}</option>
              <option value={2.5}>M 2.5+</option>
              <option value={4.5}>M 4.5+</option>
              <option value={6}>M 6.0+</option>
            </select>
          </div>

          {quakeData ? <EarthquakeMap earthquakes={filteredEarthquakes} overlayMode="standard" mapStyle={quakeMapStyle} fullscreen={false} /> : <div className="loading-box">{text.loadingQuakes}</div>}

          <div className="quake-headline">
            <span className="status-badge subtle">{filteredEarthquakes.length} {text.events}</span>
            <span className="quake-caption">M {magnitudeFilter || text.all}+ {text.filter}</span>
          </div>

          <div className="quake-list">
            {filteredEarthquakes.slice(0, 8).map((quake) => (
              <div className="quake-item" key={quake.id}>
                <div>
                  <strong>{quake.properties.place}</strong>
                  <div className="quake-meta">{new Date(quake.properties.time).toLocaleString()}</div>
                </div>
                <span className="magnitude-pill">M {quake.properties.mag}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {fullscreenMap && (
        <div className="fullscreen-map-overlay" onClick={() => setFullscreenMap(null)}>
          <div className="fullscreen-map-panel" onClick={(event) => event.stopPropagation()}>
            <div className="fullscreen-map-header">
              <h3>{fullscreenMap === 'weather' ? text.weatherRadar : text.earthquakes}</h3>
              <button type="button" className="fullscreen-button" onClick={() => setFullscreenMap(null)}>Close</button>
            </div>
            {fullscreenMap === 'weather'
              ? <WeatherMap lat={location.lat} lon={location.lon} overlayMode={weatherOverlay} mapStyle={weatherMapStyle} compact={false} fullscreen={true} />
              : <EarthquakeMap earthquakes={filteredEarthquakes} overlayMode="standard" mapStyle={quakeMapStyle} fullscreen={true} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
