import React, { useEffect, useState } from 'react';
import daxios from '../../axios/axiosConfig';
import styles from './Deptment.module.css';

const DeptAttendance = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [attendanceList, setAttendanceList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 5;

  // 📌 부서 목록 불러오기
  useEffect(() => {
        daxios.get("http://10.10.55.66/insa/departments")
      .then(res => {
        setDepartments(res.data);
      })
      .catch(err => {
        console.error("부서 목록 로딩 실패:", err);
      });
  }, []);

  // 📌 부서 변경 시 목록 초기화
  useEffect(() => {
    if (selectedDept) {
      setAttendanceList([]);
      setPage(1);
      setHasMore(true);
    }
  }, [selectedDept]);

  // 📌 출퇴근 데이터 불러오기
  useEffect(() => {
    if (!selectedDept || !hasMore) return;

    daxios.get(`http://10.10.55.66/insa/by-department`, {
      params: {
        deptId: selectedDept,
        page: page,
        size: pageSize
      }
    })
      .then(res => {
        const newData = res.data;
        setAttendanceList(prev => [...prev, ...newData]);
        if (newData.length < pageSize) {
          setHasMore(false);
        }
      })
      .catch(err => {
        console.error("근무기록 불러오기 실패:", err);
      });
  }, [selectedDept, page]);

  // 📌 스크롤 하단 도달 시 다음 페이지 로딩ㄷ
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 20 && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className={styles.container}>
      <h2>🏢 부서별 출/퇴근 및 근무 기록</h2>

      <div className={styles.filterSection}>
        <label htmlFor="deptSelect">부서 선택:</label>
        <select
          id="deptSelect"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">-- 부서를 선택하세요 --</option>
          {departments.map((dept) => (
            <option key={dept.dept_id} value={dept.dept_id}>
              {dept.dept_name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.listSection} onScroll={handleScroll}>
        <table className={styles.attendanceTable}>
          <thead>
            <tr>
              <th>이름</th>
              <th>부서</th>
              <th>날짜</th>
              <th>출근</th>
              <th>퇴근</th>
              <th>총 근무시간</th>
            </tr>
          </thead>
          <tbody>
            {attendanceList.length > 0 ? (
              attendanceList.map((record, idx) => (
                <tr key={idx}>
                  <td>{record.empName}</td>
                  <td>{record.deptName}</td>
                  <td>{record.workDate}</td>
                  <td>{record.checkInTime || '-'}</td>
                  <td>{record.checkOutTime || '-'}</td>
                  <td>{record.workHours}h</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeptAttendance;
