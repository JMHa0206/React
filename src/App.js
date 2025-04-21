import React, { useEffect } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from '../src/store/useAuthStore';
import RouteFilter from './Components/filters/RouteFilter';
import Index from './pages/Index/Index';
import Mainpage from './pages/MainPage/Mainpage';
import MessengerPopupContainer from './Messages/MessengerPopupContainer';
import Header from './Components/Header';
import Modal from 'react-modal';
import './axios/axiosConfig';
import useProfileStore from './store/useProfileStore';
import axios from 'axios';

Modal.setAppElement('#root');

const App = () => {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setProfileImagePath = useProfileStore((state) => state.setProfileImagePath);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const userId = sessionStorage.getItem("userId");


    if (!userId) {
      console.warn("🚨 userId 없음. 프로필 요청 중단");
      return; 
    }

    axios.get("http://10.5.5.6/Employee/SelectMine", {
      params: { userId }
    })
      .then((resp) => {
        const empId = resp.data.emp_code_id;
        // 프로필 불러오기기
        return axios.get("http://10.5.5.6/Employee/ProfileImg", {
          params: { empId }
        });
      })
      .then((imgResp) => {
        const fullPath = `http://10.5.5.6${imgResp.data}?t=${Date.now()}`;
        setProfileImagePath(fullPath);
      })
      .catch((err) => {
        console.error("❌ 프로필 이미지 로딩 실패", err);
        setProfileImagePath("/Default2.png");
      });
  }, [isInitialized]);
  
  if (!isInitialized) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p className="message">잠시만 기다려주세요...</p>
      </div>
    );
  }


  return (
    <div className="app-container">
      <Routes>
        <Route path='/' element={<Index />} />

        {/* 🔐 로그인 여부 체크 */}
        <Route element={<RouteFilter />}>
          <Route path='/mainpage/*' element={<Mainpage />} />
          <Route path='/messenger/*' element={<MessengerPopupContainer />} />
          <Route path='/home/*' element={<Header />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
