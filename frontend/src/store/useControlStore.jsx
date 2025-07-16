// store/controlStore.js
import { create } from 'zustand'; // redux보다 훨씬 가볍고 쓰기 쉬운 상태 라이브러리

const useControlStore = create((set) => ({
  water: false,
  fan: false,
  led: 3,
  temp: 22,
  humid: 60,

  setWater: (value) => set({ water: value }),
  setFan: (value) => set({ fan: value }),
  setLed: (value) => set({ led: value }),
  setTemp: (value) => set({ temp: value }),
  setHumid: (value) => set({ humid: value }),

  // 모든 값 로컬스토리지에 저장
  persistToLocal: () => {
    const state = useControlStore.getState();
    localStorage.setItem('controlStore', JSON.stringify(state));
  },

  // 로컬스토리지에서 복원
  restoreFromLocal: () => {
    const data = JSON.parse(localStorage.getItem('controlStore'));
    if (data) {
      set({
        water: data.water,
        fan: data.fan,
        led: data.led,
        temp: data.temp,
        humid: data.humid,
      });
    }
  }
}));

export default useControlStore;
