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
  }
));

export default useWorkStore;
