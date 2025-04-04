import { create } from "zustand";



const useAuthStore = create((set)=>({
    token : null,
    userId : null,
    isAuth: false,
    per_function :"U",
    per_secure:3,
    


    setAuth: (token, userId, per_function, per_secure)=>{
        set({token: token, userId: userId, isAuth: true, per_function: per_function, per_secure:per_secure});
        sessionStorage.setItem("token",token);
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("isAuth", true);
        sessionStorage.setItem("per_function",per_function);
        sessionStorage.setItem("per_secure",per_secure);
    },
    logout: ()=>{
        set({token:null, userId:null, isAuth:false, per_function:null, per_secure:0});
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("isAuth");
        sessionStorage.removeItem("per_function");
        sessionStorage.removeItem("per_secure");
    },
    initialize: ()=>{
        const token = sessionStorage.getItem("token");
        const userId = sessionStorage.getItem("userId");
        const isAuth = sessionStorage.getItem("isAuth");

        if(token && userId){
            set({token:token, userId:userId, isAuth: isAuth});
        }
    }
}))

export default useAuthStore;