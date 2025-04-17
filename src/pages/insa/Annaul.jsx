import React, { useEffect, useState } from 'react';
import daxios from '../../axios/axiosConfig';
import styles from './Annal.module.css';
import useWorkStore from '../../store/useWorkStore';

const Annal = () => {
  const {
    checkInTime,
    checkOutTime,
    isCheckedOut,
    currentActivity
  } = useWorkStore();

  const [todayWorkedTime, setTodayWorkedTime] = useState("00:00:00");
  const [summaryData, setSummaryData] = useState({
    personalBusinessTrips: [],
    departmentLeaves: [],
    notCheckedInToday: [],
    overtimeList: []
  });

  useEffect(() => {
    let interval;
    if (checkInTime && !isCheckedOut) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - new Date(checkInTime)) / 1000);
        const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        const seconds = String(diff % 60).padStart(2, "0");
        setTodayWorkedTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else if (checkInTime && checkOutTime) {
      const diff = Math.floor((new Date(checkOutTime) - new Date(checkInTime)) / 1000);
      const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const seconds = String(diff % 60).padStart(2, "0");
      setTodayWorkedTime(`${hours}:${minutes}:${seconds}`);
    }

    return () => clearInterval(interval);
  }, [checkInTime, checkOutTime, isCheckedOut]);

  useEffect(() => {
    daxios.get("http://10.5.5.6/insa/admin-summary")
      .then(res => {
        setSummaryData(prev => ({ ...prev, ...res.data }));
      })
      .catch(err => {
        console.error("요약 정보 불러오기 실패:", err);
      });

    daxios.get("http://10.5.5.6/insa/overtime")
      .then(res => {
        console.log("오버 타임 데이터확인", res);
        setSummaryData(prev => ({ ...prev, overtimeList: res.data }));
      })
      .catch(err => {
        console.error("오버타임 불러오기 실패:", err);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>📊 휴가 / 출장 기록 관리</h2>
      </div>

      <div className={styles.summaryGrid}>
        {/* 📅 개인 출장 */}
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <h3>📅이 달 개인 출장</h3>
          </div>
          <ul>
            {summaryData.personalBusinessTrips.length > 0 ? (
              summaryData.personalBusinessTrips.map((trip, idx) => (
                <li key={idx}>{trip.empName} - {trip.date} ({trip.location})</li>
              ))
            ) : (
              <li>오늘 등록된 출장 없음</li>
            )}
          </ul>
        </div>

        {/* 🌿 부서 휴가 */}
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <h3>🌿 부서 휴가</h3>
          </div>
          <ul>
            {summaryData.departmentLeaves.length > 0 ? (
              summaryData.departmentLeaves.map((leave, idx) => (
                <li key={idx}>{leave.empName} - {leave.date} ({leave.type})</li>
              ))
            ) : (
              <li>이 달 휴가 등록 없음</li>
            )}
          </ul>
        </div>

        {/* ⏱️ 추가 근무 요약 */}
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <h3>⏱️ 추가 근무 (이번 달)</h3>
          </div>
          <ul>
            {summaryData.overtimeList.length > 0 ? (
              summaryData.overtimeList.map((item, idx) => (
                <li key={idx}>
                  {item.empName} ({item.deptName}) - 총근무 {item.workHours}h / 초과근무 {item.overtimeHours}h
                </li>
              ))
            ) : (
              <li>이 달 초과근무자 없음</li>
            )}
          </ul>
        </div>
      </div>

      {/* ❌ 출근 안 한 인원 */}
      <div className={styles.detailsSection}>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <h3>❌ 오늘 출근 안 한 인원</h3>
          </div>
          <ul>
            {summaryData.notCheckedInToday.length > 0 ? (
              summaryData.notCheckedInToday.map((emp, idx) => (
                <li key={idx}>{emp.empName} ({emp.deptName})</li>
              ))
            ) : (
              <li>모든 인원이 출근했습니다</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Annal;
