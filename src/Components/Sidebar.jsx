import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import daxios from '../axios/axiosConfig';
import useAuthStore from '../store/useAuthStore';
import useWorkStore from '../store/useWorkStore';
import MainpageSchedule from '../pages/Schedule/MainpageSchedule';

const Sidebar = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0); // ✅ 결재 건수

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
    const fetchAll = async () => {
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

        // ✅ 결재 대기 문서 수 조회
        const empRes = await daxios.get("http://10.10.55.22/api/employee/code");
        const empCodeId = empRes.data;

        const countRes = await daxios.get(`http://10.10.55.22/api/edms/pending-count/${empCodeId}`);
        setPendingCount(countRes.data || 0);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        setIsCheckedIn(false);
        setIsCheckedOut(false);
        setTodayAttendanceId(null);
        setPendingCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
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
      const res = await daxios.post("http://221.150.27.169:8888/work/checkIn", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ 출근 완료:', res.data);
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
      const res = await daxios.post("http://221.150.27.169:8888/work/checkOut", {
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

  const handleActivityStart = async (type) => {
    const now = new Date().toISOString();
    setCurrentActivity(type);
    setActiveActivity(type);

    try {
      const res = await daxios.post("http://221.150.27.169:8888/work/start", {
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

        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ width: '50%' }} onClick={handleCheckIn} disabled={isCheckedIn || isCheckedOut}>출근</button>
              <button style={{ width: '50%' }} onClick={handleCheckOut} disabled={!isCheckedIn || isCheckedOut}>퇴근</button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ width: '50%' }} onClick={() => handleActivityStart("외근")} disabled={!isCheckedIn || isCheckedOut || activeActivity === "외근"}>외근</button>
              <button style={{ width: '50%' }} onClick={() => handleActivityStart("업무")} disabled={!isCheckedIn || isCheckedOut || activeActivity === "업무"}>업무</button>
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
        <h3>전자결재</h3>
        {pendingCount > 0 ? (
          <p
            onClick={() => window.location.href = "/mainpage/maincontent/approval/requested"}
            style={{ cursor: "pointer", textDecoration: "underline", color: "#0066cc" }}
          >
            🧾 현재 결재해야 할 문서: {pendingCount}건
          </p>
        ) : (
          <p>🧾 결재할 문서가 없습니다.</p>
        )}
      </div>

      <div className="sidebar">
        <MainpageSchedule />
      </div>
    </div>
  );
};

export default Sidebar;
