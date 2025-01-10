import React from "react";
import axios from "axios";
import API_KEY  from "./config";
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
          data: action.payload,
        };
      case 'FETCH_WEATHER_FAILURE':
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      default:
        throw new Error('Invalid action type');
    }
  };

  const [city, setCity] = useStorageState("city", "");
  const [state, setState] = useStorageState("state", "");
  const [locationParams, setLocationParams] = React.useState(`${city},${state}`);

  const [weather, dispatchWeather] = React.useReducer(
    weatherReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchWeather = React.useCallback(async () => {
    if(city || state){
      dispatchWeather({ type: 'FETCH_WEATHER_INIT' });

      try {
        const result = await axios.get(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${locationParams}`
        );

        dispatchWeather({
          type: 'FETCH_WEATHER_SUCCESS',
          payload: result.data,
        });
      } catch {
        dispatchWeather({ type: 'FETCH_WEATHER_FAILURE' });
      }
    }
  }, [locationParams]);

  React.useEffect(() => {
    handleFetchWeather();
  }, [handleFetchWeather])

  const handleCityInput = (event) => setCity(event.target.value);

  const handleStateInput = (event) => setState(event.target.value);
  
  const handleSearchSubmit = (event) => {
    setLocationParams(`${city},${state}`);
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

      {weather.isError && <p>Something went wrong...</p>}

      {weather.isLoading ? (
        <p>Loading...</p>
      ) : (
        !weather.isError && weather.data?.location && weather.data?.current && <WeatherSummary weather={weather.data} />
      )}
    </div>
  );
}

const WeatherSummary = ({ weather }) => {  
  const date = new Date(weather.current.last_updated_epoch * 1000);

  const date_updated = date.toLocaleString('en-US');

  return (
    <div className="weather-card">
      <div className="location">{weather.location.name}, {weather.location.region}</div>
      <img src={weather.current.condition.icon} />
      <div className="hero temp">{Math.round(weather.current.temp_f)}°F</div>
      <div>Feels Like: {Math.round(weather.current.feelslike_f)}°F</div>
      <div>Condition: {weather.current.condition.text}</div>
      <div className="last-updated"><em>Last updated: {date_updated}</em></div>
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
