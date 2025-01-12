import React from "react";

export const formatDate = (unixDate, options={}) => {
    const date = new Date(unixDate * 1000);
    const formattedDate = date.toLocaleString('en-US', options);
    return formattedDate;
};

export const findTemperature = (weather, degreeType, field) => {
    const temperature = degreeType === "F" 
        ? Math.round(weather[field+'_f']) 
        : Math.round(weather[field+'_c']);
    return temperature;
};

export const useStorageState = (key, initialState) => {
    const [value, setValue] = React.useState(
      localStorage.getItem(key) || initialState
    );
  
    React.useEffect(() => {
      localStorage.setItem(key, value);
    }, [value]);
  
    return [value, setValue];
  };
  
export const useStorageRef = (key, initialState) => {
    const ref = React.useRef(
      localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
      localStorage.setItem(key, ref.current);
    });
  
    return ref;
  };
  
