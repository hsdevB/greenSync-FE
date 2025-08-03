import React, { useState, useEffect } from "react";
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const CITY = import.meta.env.VITE_CITY;
const LANG = import.meta.env.VITE_LANG;
const UNITS = import.meta.env.VITE_UNITS;

export default function OpenWheatherRain() {
    const [rain, setRain] = useState(0);

    useEffect(() => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${OPENWEATHER_API_KEY}&lang=${LANG}&units=${UNITS}`)
        .then(res => res.json())
        .then(data => {
            setRain(data.rain?.['1h'] ?? 0);
        });
    }, []);

    return (
        <div className="dashboard-card-value blue" style={{fontSize:'2rem', margin:'16px 0 4px 0', textAlign:'center'}}>
            {rain > 0 ? `${rain} mm` : "없음"}
        </div>
    )


}    