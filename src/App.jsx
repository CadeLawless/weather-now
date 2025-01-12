import React from "react";
import axios from "axios";
import API_KEY  from "./config";
import * as Utils from './utils';
import './App.css'


function App() {  
  const weatherReducer = (state, action ) => {
    switch (action.type) {
      case 'FETCH_WEATHER_INIT':
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case 'FETCH_WEATHER_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          isDay: action.payload.current.is_day === 1,
          isCloudy: ["Cloudy", "Overcast", "Fog", "Freezing Fog"].includes(action.payload.current.condition.text),
          isRainy:
            (["Mist", "Patchy light drizzle", "Light drizzle"].includes(action.payload.current.condition.text) || action.payload.current.condition.text.includes("rain")),
          data: action.payload,
        };
      case 'FETCH_WEATHER_FAILURE':
        return {
          ...state,
          isLoading: false,
          isError: true,
          isDay: null,
          isCloudy: null,
          isRainy: null,
        };
      default:
        throw new Error('Invalid action type');
    }
  };

  const [city, setCity] = Utils.useStorageState("city", "");
  const [state, setState] = Utils.useStorageState("state", "");
  const [submittedInformation, setSubmittedInformation] = React.useState(
    { "city": city, "state": state }
  );
  const [degreeType, setDegreeType] = Utils.useStorageState("degreeType", "F");

  const [weather, dispatchWeather] = React.useReducer(
    weatherReducer,
    { data: [], isDay: null, isLoading: false, isError: false }
  );

  const handleFetchWeather = React.useCallback(async () => {
    if(city || state){
      dispatchWeather({ type: 'FETCH_WEATHER_INIT' });

      try {
        const result = await axios.get(
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${submittedInformation.city},${submittedInformation.state}`
        );

        dispatchWeather({
          type: 'FETCH_WEATHER_SUCCESS',
          payload: result.data,
        });

      } catch {
        dispatchWeather({ type: 'FETCH_WEATHER_FAILURE' });
      }
    }
  }, [submittedInformation]);

  React.useEffect(() => {
    handleFetchWeather();
  }, [handleFetchWeather])

  const handleCityInput = (event) => setCity(event.target.value);

  const handleStateInput = (event) => setState(event.target.value);

  const handleSearchSubmit = (event) => {
    setSubmittedInformation({ "city": city, "state": state });
    event.preventDefault();
  };

  const toggleDegreeType = () => {
    setDegreeType((prevType) => (prevType === "F" ? "C" : "F"));
  };

  const weatherClass = weather.isDay === null ? [] : 
    weather.isDay ? 
      weather.isCloudy ? ["cloudy"] : 
      weather.isRainy ? ["rainy"] : ["day"] : 
    ["night"];

  document.body.classList.remove("day", "night", "cloudy", "rainy");
  if (weatherClass.length) {
    document.body.classList.add(...weatherClass);
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>WeatherNow</h1>
      <form onSubmit={handleSearchSubmit}>
        <div className="input-group">
          <Input
            type="search"
            placeholder="Enter city name"
            value={city}
            onChangeFn={handleCityInput}
          />
          <Input
            type="search"
            placeholder="Enter state name"
            value={state}
            onChangeFn={handleStateInput}
          />
        </div>
        <Button
          type='submit'
          disabled={!city && !state}
        >
          Get Weather
        </Button>
      </form>

      {weather.isError && <p>Something went wrong...</p>}

      {weather.isLoading ? (
        <p>Loading...</p>
      ) : (
        !weather.isError && weather.data?.location && weather.data?.current && (
          <div className="weather-cards-container">
            <div className="current-weather">
              <div>
                <Button onClickFn={toggleDegreeType} className='text'>
                  Switch to {degreeType === "F" ? "Celsius" : "Fahrenheit"}
                </Button>
              </div>
              <WeatherSummary weather={weather.data} degreeType={degreeType} />
            </div>
            <ForecastSummary weather={weather.data.forecast.forecastday[0]} degreeType={degreeType} />
          </div>
        )
      )}
    </div>
  );
}

const WeatherSummary = ({ weather, degreeType }) => {
  const dateFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZoneName: 'short'
  };

  const region = weather.location.region == weather.location.name
    ? weather.location.country
    : weather.location.region;

  return (
    <div className="weather-card">
      <div className="location">{weather.location.name}, {region}</div>
      <img src={weather.current.condition.icon} />
      <div className="hero temp">{Utils.findTemperature(weather.current, degreeType, 'temp')}°{degreeType}</div>
      <div>Feels Like: {Utils.findTemperature(weather.current, degreeType, 'feelslike')}°{degreeType}</div>
      <div>Condition: {weather.current.condition.text}</div>
      <div className="last-updated"><em>Last updated: {Utils.formatDate(weather.current.last_updated_epoch, {...dateFormatOptions, timeZone: weather.location.tz_id})}</em></div>
    </div>
  );
};
const ForecastSummary = ({ weather, degreeType }) => {  
  const dateFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };

  return (
    <div className="forecast-list weather-card">
      <h2>Hourly Forecast</h2>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Temp</th>
            <th>Feels Like</th>
            <th>Condition</th>
          </tr>
        </thead>
        <tbody>
        {weather.hour.map((hour) => {
          return (
            <tr key={hour.time_epoch}>
              <td>{Utils.formatDate(hour.time_epoch, dateFormatOptions)}</td>
              <td>{Utils.findTemperature(hour, degreeType, 'temp')}°{degreeType}</td>
              <td>{Utils.findTemperature(hour, degreeType, 'feelslike')}°{degreeType}</td>
              <td>{hour.condition.text}</td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

const Button = ({
  onClickFn = null,
  className='',
  type = 'button',
  disabled = false,
  children,
}) => (
  <button className={className} type={type} disabled={disabled} onClick={onClickFn !== null ? onClickFn : undefined}>{children}</button>
);

const Input = ({
  onChangeFn = null,
  value='',
  placeholder='',
  type = 'text',
  disabled = false,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    disabled={disabled}
    onChange={onChangeFn !== null ? onChangeFn : undefined}
  />
);

export default App
