import React, { useState, useEffect } from "react";
import axios from "axios";
import { IotDataContext } from "./IotDataContext.jsx";

export function IotDataProvider({ children }) {
    const [iotData, setIotData] = useState(null);

    useEffect(() => {
        let timer;
        const fetchData = async () => {
            try {
                const res = await axios.get("/api/iotdata");
                setIotData(res.data);
            } catch {
                setIotData(null);
            }
        };
        fetchData();
        timer = setInterval(fetchData, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <IotDataContext.Provider value={iotData}>
            {children}
        </IotDataContext.Provider>
    );
}