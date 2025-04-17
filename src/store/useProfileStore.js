import { create } from "zustand";


const useProfileStore = create((set) => ({
    userId: null,
    isInitialized: false,
    profileImagePath: "/Default2.png", // 기본값
  
    setUserId: (id) => set({ userId: id }),
    setInitialized: (value) => set({ isInitialized: value }),
    setProfileImagePath: (path) => set({ profileImagePath: path }),
    logout: () => set({ userId: null, isInitialized: false, profileImagePath: "/Default2.png" }),
  }));

  export default useProfileStore;