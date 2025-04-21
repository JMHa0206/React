import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import daxios from '../axios/axiosConfig';
import useAuthStore from '../store/useAuthStore';
import useWorkStore from '../store/useWorkStore';
import MainpageSchedule from '../pages/Schedule/MainpageSchedule';

const Sidebar = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const {
    checkInTime,
    checkOutTime,
    isCheckedIn,
    isCheckedOut,
    currentActivity,
    activeActivity,
    setActiveActivity,
    setCheckInTime,
    setCheckOutTime,
    setIsCheckedIn,
    setIsCheckedOut,
    setCurrentActivity
  } = useWorkStore();

  const [todayAttendanceId, setTodayAttendanceId] = useState(null);
  const [todayWorkedTime, setTodayWorkedTime] = useState("00:00:00");

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
          setIsCheckedIn(!checkOut);
          setIsCheckedOut(!!checkOut);

          if (checkOut) {
            setCheckOutTime(new Date(checkOut));
          }
        } else {
          setCheckInTime(null);
          setCheckOutTime(null);
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

  const handleCheckIn = async () => {
    const currentTime = new Date().toISOString();
    try {
      const res = await daxios.post("http://10.5.5.6/work/checkIn", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setIsCheckedIn(true);
      setCheckInTime(new Date(currentTime));
      setCurrentActivity("출근");
      setActiveActivity("");
    } catch (error) {
      console.error('❌ 출근 실패', error);
    }
  };

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

      setIsCheckedOut(true);
      setIsCheckedIn(false);
      setCheckOutTime(new Date(currentTime));
      setCurrentActivity("퇴근");
    } catch (error) {

    }
  };

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

        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px'}}>
              <button style={{width:'50%'}} onClick={handleCheckIn} disabled={isCheckedIn || isCheckedOut}>출근</button>
              <button style={{width:'50%'}}  onClick={handleCheckOut} disabled={!isCheckedIn || isCheckedOut}>퇴근</button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{width:'50%'}}  onClick={() => handleActivityStart("외근")} disabled={!isCheckedIn || isCheckedOut || activeActivity === "외근"}>외근</button>
              <button  style={{width:'50%'}} onClick={() => handleActivityStart("업무")} disabled={!isCheckedIn || isCheckedOut || activeActivity === "업무"}>업무</button>
            </div>
          </>
        )}

        <div className="current-activity">
          {currentActivity && <p>현재 활동: {currentActivity}</p>}
        </div>

        <div className="time-logs">
          <p>총 근무 시간: {todayWorkedTime}</p>

          {checkInTime && (
            <p>출근 시간: {new Date(checkInTime).toLocaleString("ko-KR", {
              hour12: true
            })}</p>
          )}

          {/* ✅ 퇴근 시간 조건 */}
          {checkOutTime &&
            isCheckedOut &&
            new Date(checkOutTime).toDateString() === new Date().toDateString() ? (
            <p>퇴근 시간: {new Date(checkOutTime).toLocaleString("ko-KR", {
              hour12: true
            })}</p>
          ) : (
            // ✅ 퇴근하지 않은 경우 보여줄 메시지
            isCheckedIn && !isCheckedOut && (
              <p>퇴근하지 않았습니다.</p>
            )
          )}
        </div>
      </div>

      

      <div className="sidebar">
        <MainpageSchedule />
      </div>
    </div>
  );
};

export default Sidebar;
