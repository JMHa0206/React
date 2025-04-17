import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import daxios from '../axios/axiosConfig';
import useAuthStore from '../store/useAuthStore';
import useWorkStore from '../store/useWorkStore';
import MainpageSchedule from '../pages/Schedule/MainpageSchedule';

const Sidebar = () => {
  const { token } = useAuthStore();
  // const [activeActivity, setActiveActivity] = useState(null); 이거구나!!! 왜 상태변화가 저장안되나했네
  const [loading, setLoading] = useState(true);

  const {
    checkInTime,
    checkOutTime,
    isCheckedIn,
    isCheckedOut,
    currentActivity,
    activeActivity, // 업무나 외근도 상태변화 유지
    setActiveActivity,  //
    setCheckInTime,
    setCheckOutTime,
    setIsCheckedIn,
    setIsCheckedOut,
    setCurrentActivity
  } = useWorkStore();

  const [todayAttendanceId, setTodayAttendanceId] = useState(null);
  const [todayWorkedTime, setTodayWorkedTime] = useState("00:00:00");


  // ✅ checkInTime 이거 App.js로 빼기ㄷ

  useEffect(() => {
    const fetchCheckInData = async () => {
      try {
        const res1 = await daxios.get("http://10.5.5.6/work/checkInTime", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const checkIn = res1.data?.checkInTime;
        const checkOut = res1.data?.checkOutTime;


        if (checkIn) {
          setCheckInTime(new Date(checkIn));
          setIsCheckedIn(!checkOut); // 퇴근 안 했으면 출근 상태 유지
          setIsCheckedOut(!!checkOut);
        } else {
          setCheckInTime(null);
          setIsCheckedIn(false);
          setIsCheckedOut(false);
        }

      } catch (error) {
        console.error("출근 정보 가져오기 실패", error);
        setIsCheckedIn(false);
        setIsCheckedOut(false);
        setTodayAttendanceId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckInData();
  }, [token]);

  // ✅ 근무 시간 타이머
  useEffect(() => {
    let interval;

    if (checkInTime && !isCheckedOut) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(checkInTime);
        const diff = Math.floor((now - start) / 1000);

        const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        const seconds = String(diff % 60).padStart(2, "0");

        setTodayWorkedTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else if (checkInTime && checkOutTime) {
      const start = new Date(checkInTime);
      const end = new Date(checkOutTime);
      const diff = Math.floor((end - start) / 1000);

      const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const seconds = String(diff % 60).padStart(2, "0");

      setTodayWorkedTime(`${hours}:${minutes}:${seconds}`);
    }

    return () => clearInterval(interval);
  }, [checkInTime, checkOutTime, isCheckedOut]);

  // ✅ 출근 처리
  const handleCheckIn = async () => {
    const currentTime = new Date().toISOString();
    console.log(token+"(토큰오냐?)");
    try {
      const res = await daxios.post("http://10.5.5.6/work/checkIn", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ 출근 완료:', res.data);
      setIsCheckedIn(true);
      setCheckInTime(new Date(currentTime));
      setCurrentActivity("출근");
    } catch (error) {
      console.error('❌ 출근 실패', error);
    }
  };

  // ✅ 퇴근 처리
  const handleCheckOut = async () => {
    const currentTime = new Date().toISOString();

    try {
      const res = await daxios.post("http://10.5.5.6/work/checkOut", {
        checkOutTime: currentTime
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ 퇴근 완료:', res.data);
      setIsCheckedOut(true);
      setIsCheckedIn(false);
      setCheckOutTime(new Date(currentTime));
      setCurrentActivity("퇴근");
    } catch (error) {
      console.log('❌ 퇴근 실패', error);
    }
  };

  // ✅ 외근 / 업무 시작
  const handleActivityStart = async (type) => {
    const now = new Date().toISOString();
    setCurrentActivity(type);
    setActiveActivity(type);

    try {
      const res = await daxios.post("http://10.5.5.6/work/start", {
        attendance_id: todayAttendanceId,
        activity_type: type,
        start_time: now
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`${type} 시작`, res.data);
    } catch (error) {
      console.error(`${type} 요청 실패`, error);
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h3>근무체크</h3>
        <div className="sidebar-item">🕒 출근시간: 09:00</div>
        <div className="sidebar-item">🏠 퇴근시간: 18:00</div>
        <div className="sidebar-item">📅 일정 없음</div>

        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <>
            <button onClick={handleCheckIn} disabled={isCheckedIn || isCheckedOut}>출근</button>
            <button onClick={handleCheckOut} disabled={!isCheckedIn || isCheckedOut}>퇴근</button>
            <button onClick={() => handleActivityStart("외근")} disabled={!isCheckedIn || isCheckedOut || activeActivity === "외근"}>외근</button>
            <button onClick={() => handleActivityStart("업무")} disabled={!isCheckedIn || isCheckedOut || activeActivity === "업무"}>업무</button>
          </>
        )}

        <div className="current-activity">
          {currentActivity && <p>현재 활동: {currentActivity}</p>}
        </div>
        <div className="time-logs">
          <p>총 근무 시간: {todayWorkedTime}</p>
          {checkInTime && <p>출근 시간: {checkInTime.toLocaleString()}</p>}
          {checkOutTime && <p>퇴근 시간: {checkOutTime.toLocaleString()}</p>}
        </div>
      </div>

      <div className="sidebar">
        <h3>전자결제</h3>
        <div>내용 알아서 추가해주세요!</div>
      </div>

      <div className="sidebar">
        <MainpageSchedule />
      </div>
    </div>
  );
};

export default Sidebar;
