const apiKey = "91a266d943272615ba1914c7807737b6";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const home = document.getElementById("home-screen");
const dash = document.getElementById("dashboard");
const cBtn = document.getElementById("c-btn");
const fBtn = document.getElementById("f-btn");

let tempC = 0, feelsC = 0, currentUnit = "C";

searchBtn.addEventListener("click", searchWeather);
cityInput.addEventListener("keydown", (e) => { if (e.key === "Enter") searchWeather(); });

function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) return;
    fetchWeather(city);
}

cBtn.addEventListener("click", () => { currentUnit = "C"; toggleUnits(cBtn, fBtn); });
fBtn.addEventListener("click", () => { currentUnit = "F"; toggleUnits(fBtn, cBtn); });

function toggleUnits(active, inactive) {
    active.classList.add("active");
    inactive.classList.remove("active");
    updateTempUI();
}

async function fetchWeather(city) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        if (!res.ok) throw new Error("City not found");
        const data = await res.json();

        tempC = data.main.temp;
        feelsC = data.main.feels_like;

        document.getElementById("city-name").innerText = `${data.name}, ${data.sys.country}`;
        document.getElementById("weather-desc").innerText = data.weather[0].description;
        document.getElementById("main-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        document.getElementById("current-date").innerText = new Date().toDateString();
        document.getElementById("humidity").innerText = data.main.humidity + "%";
        document.getElementById("wind").innerText = Math.round(data.wind.speed * 3.6) + " km/h";
        document.getElementById("pressure").innerText = data.main.pressure + " hPa";
        document.getElementById("visibility").innerText = (data.visibility / 1000) + " km";

        const tOpts = { hour: "2-digit", minute: "2-digit" };
        document.getElementById("sunrise").innerText = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], tOpts);
        document.getElementById("sunset").innerText = new Date(data.sys.sunset * 1000).toLocaleTimeString([], tOpts);

        updateTempUI();
        fetchForecasts(data.coord.lat, data.coord.lon);

        home.classList.add("hidden");
        dash.classList.remove("hidden");
    } catch (err) { alert(err.message); }
}

function updateTempUI() {
    const isC = currentUnit === "C";
    const t = isC ? Math.round(tempC) : Math.round(tempC * 9/5 + 32);
    const f = isC ? Math.round(feelsC) : Math.round(feelsC * 9/5 + 32);
    document.getElementById("main-temp").innerText = `${t}°`;
    document.getElementById("feels-like").innerText = `Feels like ${f}°${currentUnit}`;
}

async function fetchForecasts(lat, lon) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    const data = await res.json();

    // Hourly
    const hourly = document.getElementById("hourly-container");
    hourly.innerHTML = data.list.slice(0, 8).map(item => `
        <div class="hour-card">
            <div>${new Date(item.dt * 1000).getHours()}:00</div>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
            <div style="font-weight:bold">${Math.round(item.main.temp)}°</div>
        </div>
    `).join('');

    // Daily
    const daily = document.getElementById("daily-container");
    daily.innerHTML = data.list.filter((_, i) => i % 8 === 0).map(d => `
        <div class="daily-item">
            <div style="width:40px">${new Date(d.dt * 1000).toLocaleDateString("en-US", { weekday: "short" })}</div>
            <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png">
            <div style="flex:1; margin-left:10px">${d.weather[0].main}</div>
            <div style="font-weight:bold">${Math.round(d.main.temp_max)}°/${Math.round(d.main.temp_min)}°</div>
        </div>
    `).join('');
    
    // UV (Fixed API call)
    const uvRes = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const uvData = await uvRes.json();
    document.getElementById("uv-box").innerText = uvData.value;
}

const themeBtn = document.getElementById("theme-toggle");

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    themeBtn.innerText = 
        document.body.classList.contains("dark-theme") ? "☀️" : "🌙";
});
