import React, { useEffect, useState } from 'react';
import daxios from '../../axios/axiosConfig';
import ProgressBar from './ProgressBar';
import styles from './insapage.module.css';
import useWorkStore from '../../store/useWorkStore';

const InsaPage = () => {
  const {
    checkInTime,
    checkOutTime,
    isCheckedOut,
    currentActivity
  } = useWorkStore();

  const [todayWorkedTime, setTodayWorkedTime] = useState("00:00:00");

  const [summary, setSummary] = useState({
    weeklyWorkedDays: 0,
    weeklyWorkHours: 0,
    averageCheckIn: "-",
    averageCheckOut: "-",
    consecutiveDays: 0,
    totalAnnual: 0,
    usedAnnual: 0,
    remainingAnnual: 0,
    expiringThisYear: 0,
    totalOvertime: 0
  });

  // ✅ 근무 요약 데이터 받아오기 (토큰 수동 포함)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken');
        console.log("📦 토큰 확인 (insaPage):", token);

        const res = await daxios.get("http://10.5.5.6/insa/summary", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("1");
        setSummary(res.data);
      } catch (err) {
        console.error("❌ 근무 요약 정보 로딩 실패", err);
      }
    };

    fetchSummary();
  }, []);

  // ✅ 오늘 근무 시간 실시간 계산
  useEffect(() => {
    let interval;
  
    if (checkInTime && !isCheckedOut) {
      // ⏱ 퇴근 전, 실시간 타이머
      interval = setInterval(() => {
        const now = new Date();
        const inTime = new Date(checkInTime);
  
        const diff = Math.floor((now - inTime) / 1000);
        const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        const seconds = String(diff % 60).padStart(2, "0");
  
        setTodayWorkedTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else if (checkInTime && checkOutTime) {
      // ⌛ 퇴근 후, 고정된 근무 시간 계산
      const inTime = new Date(checkInTime);
      const outTime = new Date(checkOutTime);
  
      if (outTime > inTime) {
        const diff = Math.floor((outTime - inTime) / 1000);
        const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        const seconds = String(diff % 60).padStart(2, "0");
  
        setTodayWorkedTime(`${hours}:${minutes}:${seconds}`);
      } else {
        setTodayWorkedTime("- -"); // ⛔ 시간 역전 방지
      }
    }
  
    return () => clearInterval(interval);
  }, [checkInTime, checkOutTime, isCheckedOut]);
  

  const progressPercent = (summary.weeklyWorkHours / 52) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>📊 주간 근태 요약</h2>
        <div className={styles.statusBadge}>
          {currentActivity || "대기 중"}
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <h3>📅 근무 현황</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.statRow}>
              <span>연속 근속일</span>
              <span className={styles.statValue}>{summary.consecutiveDays}일</span>
            </div>
            <div className={styles.statRow}>
              <span>오늘 근무 시간</span>
              <span className={styles.statValue}>{todayWorkedTime}</span>
            </div>
            <div className={styles.statRow}>
              <span>주 52시간</span>
              <span className={styles.statValue}>
                {summary.weeklyWorkHours}h / 52h
              </span>
            </div>
            <ProgressBar percent={progressPercent} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <h3>🌿 연차 현황</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.leaveGrid}>
              <div className={styles.leaveItem}>
                <span className={styles.leaveLabel}>총 연차</span>
                <span className={styles.leaveValue}>{summary.totalAnnual}일</span>
              </div>
              <div className={styles.leaveItem}>
                <span className={styles.leaveLabel}>사용</span>
                <span className={styles.leaveValue}>{summary.usedAnnual}일</span>
              </div>
              <div className={styles.leaveItem}>
                <span className={styles.leaveLabel}>잔여</span>
                <span className={styles.leaveValue}>{summary.remainingAnnual}일</span>
              </div>
              <div className={styles.leaveItem}>
                <span className={styles.leaveLabel}>소멸 예정</span>
                <span className={styles.leaveValue}>{summary.expiringThisYear}일</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.detailsSection}>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <h3>📈 근무 패턴 분석 (이번 주)</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.patternGrid}>
              <div className={styles.patternItem}>
                <div className={styles.iconWrapper}>🕘</div>
                <span className={styles.patternLabel}>평균 출근 시간</span>
                <span className={styles.patternValue}>{summary.averageCheckIn}</span>
              </div>
              <div className={styles.patternItem}>
                <div className={styles.iconWrapper}>🕕</div>
                <span className={styles.patternLabel}>평균 퇴근 시간</span>
                <span className={styles.patternValue}>{summary.averageCheckOut}</span>
              </div>
              <div className={styles.patternItem}>
                <div className={styles.iconWrapper}>📆</div>
                <span className={styles.patternLabel}>연속 근무 일수</span>
                <span className={styles.patternValue}>{summary.consecutiveDays}일</span>
              </div>
              <div className={styles.patternItem}>
                <div className={styles.iconWrapper}>⏱</div>
                <span className={styles.patternLabel}>누적 초과근무</span>
                <span className={styles.patternValue}>{summary.totalOvertime}시간</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsaPage;
