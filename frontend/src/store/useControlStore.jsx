import { create } from 'zustand'; // redux보다 훨씬 가볍고 쓰기 쉬운 상태 라이브러리

const useControlStore = create((set) => ({
  water: false,
  fan: false,
  ledLevel: 3,
  temp: 22,
  humid: 60,

  setWater: (value) => set({ water: value }),
  setFan: (value) => set({ fan: value }),
  setLed: (value) => set({ ledLevel: value }),
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
        ledLevel: data.ledLevel,
        temp: data.temp,
        humid: data.humid,
      });
    }
  }
}));

export default useControlStore;
