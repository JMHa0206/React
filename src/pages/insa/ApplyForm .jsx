import React, { useState, useEffect } from 'react';
import styles from './ApplyForm.module.css';
import daxios from '../../axios/axiosConfig';

const ApplyForm = () => {
  const [type, setType] = useState('휴가');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [showNotice, setShowNotice] = useState(true); // 👈 커스텀 경고창

  useEffect(() => {
    // 3초 뒤에 자동으로 닫기
    const timer = setTimeout(() => setShowNotice(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('type', type);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('reason', reason);

    if (type === '초과근무') {
      formData.append('startTime', startTime);
      formData.append('endTime', endTime);
    }

    if (file) {
      formData.append('file', file);
    }

    try {
      await daxios.post('http://10.5.5.6/insa/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(`${type} 신청 완료 ✅`);
      setStartDate('');
      setEndDate('');
      setStartTime('');
      setEndTime('');
      setReason('');
      setFile(null);
    } catch (err) {
      console.error('신청 실패', err);
      setMessage('❌ 신청 실패. 다시 시도해주세요.');
    }
  };

  return (
    <div className={styles.container}>
      {/* ✅ 개발 중 알림 메시지 */}
      {showNotice && (
        <div style={{
          backgroundColor: '#ffeeba',
          padding: '12px 16px',
          border: '1px solid #f5c6cb',
          color: '#856404',
          borderRadius: '6px',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          [인사관리] 🚧 현재 개발 중인 페이지입니다.
        </div>
      )}

      <h2>📌 휴가 / 출장 / 초과근무 신청</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label>신청 유형</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="휴가">휴가</option>
          <option value="출장">출장</option>
          <option value="초과근무">초과근무</option>
        </select>

        <label>시작일</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />

        <label>종료일</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />

        {type === '초과근무' && (
          <>
            <label>시작 시간</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />

            <label>종료 시간</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </>
        )}

        <label>사유</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="4" required />

        <label>파일 첨부</label>
        <input type="file" onChange={handleFileChange} multiple />

        <button type="submit">신청하기</button>

        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default ApplyForm;
