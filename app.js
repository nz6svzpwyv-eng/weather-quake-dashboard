const weatherMapEl = document.getElementById('weather-map');
const quakeListEl = document.getElementById('quake-list');
const quakeCountEl = document.getElementById('quake-count');
const locationInput = document.getElementById('location-input');
const locationForm = document.getElementById('location-form');
const locationNameEl = document.getElementById('location-name');
const currentTempEl = document.getElementById('current-temp');
const currentIconEl = document.getElementById('current-icon');
const currentSummaryEl = document.getElementById('current-summary');
const windSpeedEl = document.getElementById('wind-speed');
const humidityEl = document.getElementById('humidity');
const precipitationEl = document.getElementById('precipitation');
const forecastEl = document.getElementById('forecast');

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
  99: { label: 'Thunderstorm hail', icon: '⛈️' }
};

let weatherMap;
let quakeMap;

function formatDate(dateInput) {
  return new Date(dateInput).toLocaleDateString(undefined, { weekday: 'short' });
}

function getWeatherInfo(code) {
  return weatherCodeMap[code] || { label: 'Conditions', icon: '🌤️' };
}

function renderForecast(daily) {
  const dates = daily.time.slice(0, 4);
  const highs = daily.temperature_2m_max.slice(0, 4);
  const lows = daily.temperature_2m_min.slice(0, 4);
  const codes = daily.weather_code.slice(0, 4);

  forecastEl.innerHTML = dates
    .map((date, index) => {
      const weather = getWeatherInfo(codes[index]);
      return `
        <div class="forecast-card">
          <span>${formatDate(date)}</span>
          <strong>${weather.icon}</strong>
          <span>${Math.round(highs[index])}° / ${Math.round(lows[index])}°</span>
        </div>
      `;
    })
    .join('');
}

function renderWeather(data, placeName) {
  const current = data.current;
  const daily = data.daily;
  const currentCode = getWeatherInfo(current.weather_code);

  locationNameEl.textContent = placeName;
  currentTempEl.textContent = `${Math.round(current.temperature_2m)}°`;
  currentIconEl.textContent = currentCode.icon;
  currentSummaryEl.textContent = `${currentCode.label} · feels like ${Math.round(current.apparent_temperature)}°`;
  windSpeedEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  precipitationEl.textContent = `${current.precipitation ?? 0} mm`;

  renderForecast(daily);
}

async function searchLocation(query) {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
  const data = await res.json();

  if (!data.results || !data.results.length) {
    throw new Error('Location not found');
  }

  const result = data.results[0];
  return {
    lat: result.latitude,
    lon: result.longitude,
    name: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`
  };
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;
  const res = await fetch(url);
  return res.json();
}

function initWeatherMap() {
  weatherMap = L.map('weather-map', { zoomControl: true }).setView([34.0522, -118.2437], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(weatherMap);
}

function initQuakeMap() {
  quakeMap = L.map('earthquake-map', { zoomControl: true }).setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(quakeMap);
}

async function loadRadar(lat, lon) {
  if (!weatherMap) return;

  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    const data = await response.json();
    const latest = data.radar.past[data.radar.past.length - 1];
    const radarUrl = `${data.host}${latest.path}/256/{z}/{x}/{y}/2/1_0.png`;

    if (window.radarLayer) {
      weatherMap.removeLayer(window.radarLayer);
    }

    window.radarLayer = L.tileLayer(radarUrl, {
      opacity: 0.5,
      attribution: 'RainViewer'
    }).addTo(weatherMap);

    weatherMap.setView([lat, lon], 7);
  } catch (error) {
    console.warn('Radar could not load:', error);
  }
}

function renderEarthquakes(quakeData) {
  const features = quakeData.features || [];
  quakeCountEl.textContent = `${features.length} events`;

  if (quakeMap && typeof quakeMap.eachLayer === 'function') {
    quakeMap.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
        quakeMap.removeLayer(layer);
      }
    });
  }

  quakeListEl.innerHTML = features.slice(0, 8).map((quake) => {
    const { place, mag, time } = quake.properties;
    const [lng, lat] = quake.geometry.coordinates;

    const circle = L.circleMarker([lat, lng], {
      radius: Math.max(6, (mag || 1) * 3),
      color: mag >= 5 ? '#ef4444' : '#f59e0b',
      fillColor: mag >= 5 ? '#ef4444' : '#f59e0b',
      fillOpacity: 0.8,
      weight: 1
    }).bindPopup(`<strong>${place}</strong><br>Magnitude: ${mag}<br>${new Date(time).toLocaleString()}`);

    if (quakeMap) {
      circle.addTo(quakeMap);
    }

    return `
      <div class="quake-item">
        <div>
          <strong>${place}</strong>
          <div class="quake-meta">${new Date(time).toLocaleString()}</div>
        </div>
        <span class="magnitude-pill">M ${mag}</span>
      </div>
    `;
  }).join('');

  if (features.length && quakeMap) {
    const first = features[0];
    const [lng, lat] = first.geometry.coordinates;
    quakeMap.setView([lat, lng], 2);
  }
}

async function fetchEarthquakes() {
  const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
  return response.json();
}

async function updateDashboard(lat, lon, name) {
  const [weatherData, quakeData] = await Promise.all([
    fetchWeather(lat, lon),
    fetchEarthquakes()
  ]);

  renderWeather(weatherData, name);
  renderEarthquakes(quakeData);
  await loadRadar(lat, lon);
}

async function handleSearch(event) {
  event.preventDefault();

  const query = locationInput.value.trim();
  if (!query) return;

  try {
    const result = await searchLocation(query);
    await updateDashboard(result.lat, result.lon, result.name);
  } catch (error) {
    alert('Location not found. Try a major city name like Tokyo, Seattle, or London.');
  }
}

async function initializeDefault() {
  const defaultLocation = { lat: 34.0522, lon: -118.2437, name: 'Los Angeles, California' };
  await updateDashboard(defaultLocation.lat, defaultLocation.lon, defaultLocation.name);
}

locationForm.addEventListener('submit', handleSearch);

initWeatherMap();
initQuakeMap();
initializeDefault();
