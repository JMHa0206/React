import React, { useState } from 'react';
import './Sidebar.css';
import axios from 'axios';
import { format } from 'date-fns';

const Sidebar = () => {

  const [isCheckedIn, setIsCheckedIn] = useState(false); 
  const [isCheckedOut, setIsCheckedOut] = useState(false); 
  const [currentActivity, setCurrentActivity] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [outingTime, setOutingTime] = useState("");
  const [workTime, setWorkTime] = useState(""); 

  const handleCheckIn = async () => {
    const currentTime = new Date().toISOString();

    try {
      const response = await axios.post("http://10.10.55.69/work/checkIn", { checkInTime: currentTime });
      console.log('서버 응답:', response.data);
      setIsCheckedIn(true);
      setCurrentActivity("출근");
      setCheckInTime(currentTime); 
    } catch (error) {
      console.log('출근 시간 전송 오류', error);
    }
  };

  const handleCheckOut = async () => {
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

  const handleOuting = async () => {
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
  
  const handleWork = async () => {
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
    </div>
  );
};

export default Sidebar;