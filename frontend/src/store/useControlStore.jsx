import { create } from 'zustand'; // redux보다 훨씬 가볍고 쓰기 쉬운 상태 라이브러리

const useControlStore = create((set, get) => ({
  water: false,
  fan: false,
  ledLevel: 3,
  temp: 22,
  humid: 60,
  autoMode: false,
  manualMode: true,

  setWater: (value) => set({ water: value }),
  setFan: (value) => set({ fan: value }),
  setLed: (value) => set({ ledLevel: value }),
  setTemp: (value) => set({ temp: value }),
  setHumid: (value) => set({ humid: value }),
  setAutoMode: (val) => set({ autoMode: val }),
  setManualMode: (val) => set({ manualMode: val }),

  // 모든 값 로컬스토리지에 저장
  persistToLocal: () => {
    const state = get();
    const dataToSave = {
      water: state.water,
      fan: state.fan,
      ledLevel: state.ledLevel,
      temp: state.temp,
      humid: state.humid,
      autoMode: state.autoMode,
      manualMode: state.manualMode,
    };
    localStorage.setItem('controlStore', JSON.stringify(dataToSave));
  },

  // 로컬스토리지에서 복원
  restoreFromLocal: () => {
    const data = localStorage.getItem('controlStore');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        set({
          water: parsed.water ?? false,
          fan: parsed.fan ?? false,
          ledLevel: parsed.ledLevel ?? 3,
          temp: parsed.temp ?? 22,
          humid: parsed.humid ?? 60,
          autoMode: parsed.autoMode ?? false,
          manualMode: parsed.manualMode ?? true,
        });
      } catch (error) {
        console.error('localStorage 복원 실패:', error);
      }
    }
  },

  // 자동/수동 모드 토글 헬퍼 함수들
  toggleAutoMode: () => {
    const state = useControlStore.getState();
    set({ 
      autoMode: !state.autoMode,
      manualMode: state.autoMode // autoMode가 true였으면 manualMode는 false가 됨
    });
    useControlStore.getState().persistToLocal();
  },

  toggleManualMode: () => {
    const state = useControlStore.getState();
    set({ 
      manualMode: !state.manualMode,
      autoMode: state.manualMode // manualMode가 true였으면 autoMode는 false가 됨
    });
    useControlStore.getState().persistToLocal();
  },
}));

export default useControlStore;
