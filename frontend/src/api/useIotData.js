import { useContext } from "react";
import { IotDataContext } from "./IotDataContext.jsx";

export function useIotData() {
    return useContext(IotDataContext);
}