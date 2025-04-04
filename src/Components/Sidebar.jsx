import React, { useState } from 'react';
import './Sidebar.css';
import axios from 'axios';
import { format } from 'date-fns';
import useAuthStore from '../store/useAuthStore';

const Sidebar = () => {

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [currentActivity, setCurrentActivity] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [outingTime, setOutingTime] = useState("");
  const [workTime, setWorkTime] = useState("");

  const handleCheckIn = async () => {   // 출근
    const currentTime = new Date().toISOString();
    // Zustand 스토어에서 토큰 가져오기
    const token = useAuthStore.getState().token;
    console.log(token," : token ddd");

    try {
      const response = await axios.post(
        "http://10.10.55.69/work/checkIn",
        { checkInTime: currentTime },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  // 토큰 추가
          }
        }
      );
      console.log('서버 응답:', response.data);
      setIsCheckedIn(true);
      setCurrentActivity("출근");
      setCheckInTime(currentTime);
    } catch (error) {
      console.log('출근 시간 전송 오류', error);
    }
  };

  const handleCheckOut = async () => {  // 퇴근근
    const currentTime = new Date().toISOString();

    try {
      const response = await axios.post("http://10.10.55.69/work/checkOut", { checkOutTime: currentTime });
      console.log('서버 응답:', response.data);
      setIsCheckedOut(true);
      setIsCheckedIn(false);
      setCurrentActivity("퇴근");
      setCheckOutTime(currentTime);
    } catch (error) {
      console.log('퇴근 시간 전송 오류', error);
    }
  };

  const handleOuting = async () => {  //업무
    const currentTime = new Date();

    const formattedTime = format(currentTime, 'yyyy-MM-dd HH:mm:ss');
    setOutingTime(formattedTime);
    setCurrentActivity("외근");
    console.log("외근 시간:", formattedTime);

    try {
      const response = await axios.post("http://10.10.55.69/work/outing", { outingTime: formattedTime });
      console.log('서버 응답:', response.data);
    } catch (error) {
      console.log('외근 시간 전송 오류', error);
    }
  };

  const handleWork = async () => {  // 외근 
    const currentTime = new Date();

    const formattedTime = format(currentTime, 'yyyy-MM-dd HH:mm:ss');
    setWorkTime(formattedTime);
    setCurrentActivity("업무");
    console.log("업무 시간:", formattedTime);

    try {
      const response = await axios.post("http://10.10.55.69/work/work", { workTime: formattedTime });
      console.log('서버 응답:', response.data);
    } catch (error) {
      console.log('업무 시간 전송 오류', error);
    }
  };

  return (
    <div className="container">


      <div className="sidebar">
        <h3>근무체크</h3>
        <div className="sidebar-item">🕒 출근시간: 09:00</div>
        <div className="sidebar-item">🏠 퇴근시간: 18:00</div>
        <div className="sidebar-item">📅 일정 없음</div>
        <button onClick={handleCheckIn} disabled={isCheckedIn || isCheckedOut}>출근</button>
        <button onClick={handleCheckOut} disabled={!isCheckedIn || isCheckedOut}>퇴근</button>
        <button onClick={handleOuting} disabled={!isCheckedIn || isCheckedOut}>외근</button>
        <button onClick={handleWork} disabled={!isCheckedIn || isCheckedOut}>업무</button>
        <div className="current-activity">
          {currentActivity && <p>현재 활동: {currentActivity}</p>}
        </div>
        <div className="time-logs">
          {checkInTime && <p>출근 시간: {new Date(checkInTime).toLocaleString()}</p>}
          {checkOutTime && <p>퇴근 시간: {new Date(checkOutTime).toLocaleString()}</p>}
          {outingTime && <p>외근 시간: {new Date(outingTime).toLocaleString()}</p>}
          {workTime && <p>업무 시간: {new Date(workTime).toLocaleString()}</p>}
        </div>
      </div>

      <div className="sidebar">
        <h3>전자결제</h3>
        <div>내용 알아서 추가해주세요!</div>
      </div>


      <div className="sidebar">
        <h3>일정</h3>
        <div>내용 알아서 추가해주세요!</div>

      </div>



    </div>
  );
};

export default Sidebar;