import React, { useState } from "react";
import axios from "axios";
import { format } from 'date-fns';
import './App.css'

const useStorageState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value]);

  return [value, setValue];
};

const API_KEY = "88fdc987bf464765afd181157250801";


function App() {
  const [city, setCity] = useStorageState("city", "");
  const [state, setState] = useStorageState("state", "");
  const [weather, setWeather] = React.useState(null);

  const fetchWeather = async () => {
    if (city === "") return;

    try {
      const response = await axios.get(
        `https://api.weatherapi.com/v1/current.json`,
        {
          params: {
            key: API_KEY,
            q: `${city},${state}`,
          },
        }
      );
      setWeather(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setWeather(null);
    }
  };

  const handleCityInput = (event) => {
    setCity(event.target.value);
  };

  const handleStateInput = (event) => {
    setState(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    fetchWeather();

    event.preventDefault();
  };


  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>WeatherNow</h1>
      <form onSubmit={handleSearchSubmit}>
        <div className="input-group">
          <input
            type="search"
            placeholder="Enter city name"
            value={city}
            onChange={handleCityInput}
          />
          <input
            type="search"
            placeholder="Enter state name"
            value={state}
            onChange={handleStateInput}
          />
        </div>
        <Button
          type='submit'
          disabled={!city && !state}
        >
          Get Weather
        </Button>
      </form>

      {weather && (
        <WeatherSummary weather={weather} />
      )}
    </div>
  );
}

const WeatherSummary = ({ weather }) => {
  const date = new Date(weather.current.last_updated_epoch * 1000);

  const date_updated = date.toLocaleString('en-US');

  return (
    <div>
      <img src={weather.current.condition.icon} />
      <h2>{weather.location.name}, {weather.location.region}</h2>
      <p className="last-updated"><em>Last updated: {date_updated}</em></p>
      <p>Temperature: {Math.round(weather.current.temp_f)}°F</p>
      <p>Feels Like: {Math.round(weather.current.feelslike_f)}°F</p>
      <p>Condition: {weather.current.condition.text}</p>
    </div>
  );
};

const Button = ({
  onClickFn = null,
  type = 'button',
  disabled = false,
  children,
}) => (
  <button type={type} disabled={disabled} onClick={onClickFn !== null ? onClickFn : undefined}>{children}</button>
);


export default App
