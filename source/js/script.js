let cities = null
let icon = null


let $ = document
const searchBtn = $.getElementById('search')
const searchBar = $.querySelector('.search-bar')
const suggestionUl = $.querySelector('.suggestionUl')
const suggestionsBox = $.querySelector('.suggestionsBox')
const weatherInfoBox = $.getElementById('weatherInfoBox')
const weatherLoadingBox = $.querySelector('.weather')
const cardBox = $.querySelector('.card')




searchBar.addEventListener('keyup', async () => {
  await countryCityNames();
  suggestionUl.innerHTML = '';
  cardBox.className = 'card'
  if (searchBar.value) {
    suggestionsBox.classList.remove('display-none')
    suggestionUl.classList.add('active-block'); //working
    suggestionsBox.classList.add('active-block'); //working

    let searchValue = searchBar.value.toLowerCase();

    const suggestedCitiesPromises = cities.map(async city => {
      let mainCity = city.city;

      return mainCity.toLowerCase().includes(searchValue) ? city : null;
    });
    const suggestedCities = await Promise.all(suggestedCitiesPromises);

    const filteredCities = suggestedCities.filter(city => city !== null);

    filteredCities.forEach(city => {
      suggestionUl.insertAdjacentHTML('beforeend', `<li class="ulItems" onclick="searchBoxFiller(event)">${city.city}</li>`);
    });
  } else {
    suggestionUl.classList.remove('active-block');
    suggestionsBox.classList.remove('active-block');
    weatherInfoBox.classList.add('loading');
    console.log('input is empty');
  }
});


searchBtn.addEventListener('click', function () {
  showWeather()
  // suggestionUl.style.display = 'none'
})

window.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    console.log('test');
    
    showWeather()
    // suggestionsBox.className = ''
    // .classList.add('active-block')
  }
})

async function countryCityNames() {
  await fetch('https://countriesnow.space/api/v0.1/countries/population/cities')
    .then(response => response.json())
    .then(async (data) => {
      cities = await data.data
    })
}

async function showWeather() {
  
  weatherInfoBox.innerHTML = ''
  if (searchBar.value) {

    let mainCity = searchBar.value.toLowerCase()

    await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${mainCity}&appid=fd677e74ca706d4bfa9f71394daed7c7`, {
      method: 'GET'
    })
      .then(res => res.json())
      .then(data => {
        fetch(`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`, {
          method: 'GET'
        })
          .then(res => {
            icon = res.url

            if (data.weather[0].icon.includes('n') === true) {
              cardBox.classList.remove('day')
              cardBox.classList.add('night')
            } else {
              cardBox.classList.remove('night')
              cardBox.classList.add('day')
            }

            weatherInfoBox.classList.remove('loading')

            let searchedCityWeather = data

            //C = k - 273.15
            let weatherToCelsius = parseInt(searchedCityWeather.main.temp) - 273.15
            let weatherToCelsiusRounded = Math.round(weatherToCelsius)
            let weatherToFahrenheit = (9 / 5) * weatherToCelsiusRounded + 32
            let weatherToFahrenheitRounded = Math.round(weatherToFahrenheit)
            let fixedInput = inputEditor(searchBar.value)


            weatherInfoBox.insertAdjacentHTML('beforeend', `
              <h2 class="city">Weather in ${fixedInput}</h2>
          <h1 class="temp">${weatherToCelsiusRounded}°C</h1>
          <h1 class="temp">${weatherToFahrenheitRounded}°F</h1>
          <div class="flex">
            <img src="${icon}" alt="" class="icon" />
            <div class="weatherDescriptionBox">    
            <div class="description">Main: ${data.weather[0].main}</div>
            <div class="description">Description: ${data.weather[0].description}</div>
            </div>
          </div>
          <div class="humidity">Humidity: ${data.main.humidity}%</div>
          <div class="wind">Wind speed: ${data.wind.speed} km/h</div>`)
            suggestionsBox.classList.add('display-none')
            searchBar.value = ''
          })
      })

      .catch(() => {
        weatherLoadingBox.innerHTML = 'City not found'
      })
  }
}
function inputEditor(cityName){
  return cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase()
}
function searchBoxFiller(event) {
  let selectedCity = event.target.innerHTML
  searchBar.value = selectedCity

  // suggestionsBox.classList.remove('active-block')
  showWeather()

}

