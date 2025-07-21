import React, { useState, useEffect } from "react";
const OPENWEATHER_API_KEY = "58ae922a8ae59948dca89a2e0120c426";
const CITY = "Seoul";
const LANG = "kr";
const UNITS = "metric";

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