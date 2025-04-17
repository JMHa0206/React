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
import useProfileStore from './store/useProfileStore'; // ✅ 프로필 상태
import axios from 'axios'; // ✅ axios import

Modal.setAppElement('#root');

const App = () => {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setProfileImagePath = useProfileStore((state) => state.setProfileImagePath); // ✅ 상태 setter

  useEffect(() => {
    initialize();
  }, []);

  // ✅ 로그인 완료 후 프로필 이미지 상태에 설정
  useEffect(() => {
    if (!isInitialized) return;

    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    axios.get("http://10.5.5.6/Employee/SelectMine", {
      params: { userId }
    })
      .then((resp) => {
        const empId = resp.data.emp_code_id;

        return axios.get("http://10.5.5.6/Employee/ProfileImg", {
          params: { empId }
        });
      })
      .then((imgResp) => {
        const fullPath = `http://10.5.5.6${imgResp.data}?t=${Date.now()}`; // ✅ 캐시 무력화
        setProfileImagePath(fullPath); // ✅ 상태에 저장 → Header 반영됨
      })
      .catch((err) => {
        console.error("프로필 이미지 로딩 실패", err);
        setProfileImagePath("/Default2.png"); // ✅ fallback
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
  console.log("Header 이미지 상태:", useProfileStore.getState().profileImagePath);

  return (
    <div className="app-container">
      <Routes>
        <Route path='/' element={<Index />} />

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
