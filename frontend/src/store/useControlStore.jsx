import { create } from 'zustand'; // redux보다 훨씬 가볍고 쓰기 쉬운 상태 라이브러리

const useControlStore = create((set, get) => ({
  water: false,
  fan: false,
  ledLevel: 3,
  temp1: 22,
  temp2: 22,
  temp3: 22,
  temp4: 22,
  humid1: 60,
  humid2: 60,
  humid3: 60,
  humid4: 60,
  autoMode: false,
  manualMode: true,

  setWater: (value) => set({ water: value }),
  setFan: (value) => set({ fan: value }),
  setLed: (value) => set({ ledLevel: value }),
  // 개별 온습도 설정 함수들
  setTemp1: (value) => set({ temp1: value }),
  setTemp2: (value) => set({ temp2: value }),
  setTemp3: (value) => set({ temp3: value }),
  setTemp4: (value) => set({ temp4: value }),
  setHumid1: (value) => set({ humid1: value }),
  setHumid2: (value) => set({ humid2: value }),
  setHumid3: (value) => set({ humid3: value }),
  setHumid4: (value) => set({ humid4: value }),

  setAutoMode: (val) => set({ autoMode: val }),
  setManualMode: (val) => set({ manualMode: val }),

  // 모든 값 로컬스토리지에 저장
  persistToLocal: () => {
    const state = get();
    const dataToSave = {
      water: state.water,
      fan: state.fan,
      ledLevel: state.ledLevel,
      temp1: state.temp1,
      temp2: state.temp2,
      temp3: state.temp3,
      temp4: state.temp4,
      humid1: state.humid1,
      humid2: state.humid2,
      humid3: state.humid3,
      humid4: state.humid4,
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
          temp1: parsed.temp1 ?? 22,
          temp2: parsed.temp2 ?? 22,
          temp3: parsed.temp3 ?? 22,
          temp4: parsed.temp4 ?? 22,
          humid1: parsed.humid1 ?? 60,
          humid2: parsed.humid2 ?? 60,
          humid3: parsed.humid3 ?? 60,
          humid4: parsed.humid4 ?? 60,
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
