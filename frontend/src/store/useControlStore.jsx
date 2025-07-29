import { create } from 'zustand';

const useControlStore = create((set) => ({
  // 초기 상태 (API를 통해 덮어쓰여질 값들)
  water: false,
  fan: false,
  ledLevel: 3,
  temp1: 0,
  humid1: 0,
  autoMode: true,
  manualMode: false,
  
  /**
   * 컴포넌트가 처음 로드될 때 또는 전체 상태를 동기화할 때 사용
   * API 응답으로 받은 전체 상태 객체를 한 번에 적용
   */
  setState: (newState) => set((state) => ({ ...state, ...newState })),

  /**
   * 개별 제어 액션을 위한 setter 함수들
   * 사용자가 컨트롤을 조작하는 즉시 UI에 반영하기 위해 사용 (낙관적 업데이트)
   * 이 함수들은 UI를 먼저 변경하고, 실제 API 요청은 컴포넌트에서 처리
   */
  setWater: (value) => set({ water: value }),
  setFan: (value) => set({ fan: value }),
  setLed: (value) => set({ ledLevel: value }),
  setTemp1: (value) => set({ temp1: value }),
  setHumid1: (value) => set({ humid1: value }),
}));

export default useControlStore;
