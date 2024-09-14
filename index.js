const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const searchInput = document.querySelector("[data-searchInput]");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorSection = document.querySelector(".error-container");
const errorMessage = document.querySelector("[error-Message]");

const parentWrapper = document.querySelector(".wrapper");
const tabColor = document.querySelector(".tab-container");

const date = new Date();
const hours = date.getHours();
const isAM = hours<12;

function setBackgroundChange(isAM){
    let backImage;
    if(isAM){
        backImage = `url('./assets/weather-night.jpg')`;
    }
    else{
        backImage = `url('./assets/weather-day.jpg')`;
        parentWrapper.classList.add("change-wrapper-color");
        tabColor.classList.add("change-tab-color");
    }
    parentWrapper.style.backgroundImage = backImage;
}
window.onload = () => setBackgroundChange(isAM);


// initially variable needs
let currentTab = userTab;
const API_KEY = "f981d0d59a218a31b3384fa57a117349";
if(isAM){
    currentTab.classList.add("current-tab");
}
else{
    currentTab.classList.add("current-tab-2");
}
getFromSessionStorage();

function switchTab(clickedTab){
    if(clickedTab != currentTab){
        if(isAM){
            currentTab.classList.remove("current-tab");
            currentTab = clickedTab;
            currentTab.classList.add("current-tab");
        }
        else{
            currentTab.classList.remove("current-tab-2");
            currentTab = clickedTab;
            currentTab.classList.add("current-tab-2");
            searchInput.style.backgroundColor = 'rgba(110, 172, 171, 0.8)';
        }

        // make searchForm tab visible
        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } 
        else{
            // make your Weather tab visible
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");

            // to print your weather check local storage for coordinates stored in session storage
            // if we have saved them there
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener('click', () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});


//check if coordinates are already present in local session storage
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

// function to fetch weather info based on user location coordinates
async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    
    // make grantAccessContainer invisible
    grantAccessContainer.classList.remove("active");

    // maker loader visible
    loadingScreen.classList.add("active");

    // make error section invisible
    errorSection.classList.remove("active");

    // API Call
    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        // use fetched data to display on UI
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        // pending  
    }
}

function capitalizeFirstLetter(string) {
    if (!string) return string; // Handle empty string case
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderWeatherInfo(weatherInfo){
    // first we have to fetch the element
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it in UI Elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;

    const descString = weatherInfo?.weather?.[0]?.description;
    desc.innerText = capitalizeFirstLetter(descString);

    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      alert("Geolocation is not supported by this browser");
    }
}
  
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener('click', getLocation);



searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === ""){
        return;
    }
    else{
        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorSection.classList.remove("active");

    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if(response.status === 404){ 
            throw response;
        }
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        errorSection.classList.add("active");
    }
}