import React from 'react';
import style from './ReserveMain.module.css';
import MeetingRoom from '../Reserve/MeetingRoom';
import Vehicle from '../Reserve/Vehicle';
import Equipment from '../Reserve/Equipment';
import MyReservation from '../Reserve/MyReservation';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './fullcalendar.css';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import caxios from '../../Utils/caxios';


const ReserveMain = () => {
  const location = useLocation();

  const [userInfo,setUserInfo] = useState(null);
  useEffect(()=>{
        caxios.get("/mypage/info")
        .then((resp) => {
          const info = resp.data;
          console.log("userInfo 확인:", info);
          setUserInfo(info);
        })
        .catch((error) => {
          console.error("유저 정보 로딩 실패", error);
        });
  }, [])

  return (

    <div className={style.reservContainer}>
      <div className={style.subcontainer}>
        {
          location.pathname !== '/mainpage/maincontent/reserve/myReservation' && (<h2>예약하기</h2>)
        }
        
        <div className={style.reservArea}>
        <Routes>
        <Route path='/' element={<MeetingRoom userInfo={userInfo}/>} />
        <Route path='110' element={<MeetingRoom userInfo={userInfo}/>} />
        <Route path='120' element={<Vehicle userInfo={userInfo}/>} />
        <Route path='130' element={<Equipment userInfo={userInfo}/>} />
        <Route path='myReservation' element={<MyReservation userInfo={userInfo}/>} />
        </Routes>
        </div>
      </div>
    </div>
  );
};

export default ReserveMain;