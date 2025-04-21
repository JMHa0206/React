import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWorkStore = create(persist(
  (set) => ({
    checkInTime: null,
    checkOutTime: null,
    isCheckedIn: false,
    isCheckedOut: false,
    currentActivity: "",
    activeActivity: "",
    setCheckInTime: (time) => set({ checkInTime: time }),
    setCheckOutTime: (time) => set({ checkOutTime: time }),
    setIsCheckedIn: (status) => set({ isCheckedIn: status }),
    setIsCheckedOut: (status) => set({ isCheckedOut: status }),
    setCurrentActivity: (activity) => set({ currentActivity: activity }),
    setActiveActivity: (activity) => set({ activeActivity: activity }),
  }),
  {
    name: 'work-storage',
    getStorage: () => sessionStorage,

    // ✅ 날짜가 바뀌면 자동 초기화
    migrate: (persistedState, version) => {
      const today = new Date().toDateString();
      const storedCheckInTime = persistedState?.state?.checkInTime;

      if (storedCheckInTime && new Date(storedCheckInTime).toDateString() !== today) {
        // 날짜가 다르면 상태 초기화
        return {
          ...persistedState,
          state: {
            checkInTime: null,
            checkOutTime: null,
            isCheckedIn: false,
            isCheckedOut: false,
            currentActivity: "",
            activeActivity: "",
          }
        };
      }

      return persistedState;
    }
  }
));

export default useWorkStore;
