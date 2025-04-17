
import React, { useState, useEffect } from 'react';
import resvStyle from './InputReserv.module.css'
import caxios from '../../Utils/caxios';



const InputResev = ({ closeModal, selectedInfo, resourceId, userInfo, onSuccess }) => {
  useEffect(() => {
    if (!resourceId || Number(resourceId) === 0) {
      alert("자원을 먼저 선택해주세요.");
      closeModal();
    }
  }, [resourceId, closeModal]);

    useEffect(() => {
      console.log("전달된 자원 ID:", resourceId);
    }, [resourceId]);
  
    useEffect(() => {
      if (selectedInfo) {
        const date = selectedInfo.startStr.substring(0, 10);  // yyyy-mm-dd
        const stime = selectedInfo.startStr.substring(11, 16); // HH:mm
        const etime = selectedInfo.endStr.substring(11, 16);   // HH:mm
    
        setResvInput(prev => ({
          ...prev,
          resv_date: date,
          resv_stime: stime,
          resv_etime: etime
        }));
      }
    }, [selectedInfo]);


  const [resvInput, setResvInput] = useState({
    resv_id : 0,
    resource_id : 0,
    resv_emp: 0,
    resv_date:'',
    resv_stime: '',
    resv_etime: '',
    resv_title: ''
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setResvInput((prev) => ({ ...prev, [name]: value }));
  };


  const AddReservation = () => {
    const start = new Date(`2000-01-01T${resvInput.resv_stime}`);
    const end = new Date(`2000-01-01T${resvInput.resv_etime}`);

    if (start >= end) {
      alert("시작 시간은 종료 시간보다 이전이어야 합니다.");
      return;
    }

    const reservation = {
      resv_id: 0,
      resource_id: Number(resourceId),
      resv_emp: userInfo.emp_code_id,
      resv_date: `${resvInput.resv_date}`,
      resv_stime: `${resvInput.resv_stime}`,
      resv_etime: `${resvInput.resv_etime}`,
      resv_title: resvInput.resv_title
    };
    console.log("저장 전 예약 내용:", reservation);
    caxios.post("/reserve/addReserve", reservation)
    .then(() => {
      alert("예약이 완료되었습니다.");
      if (onSuccess) onSuccess();
    })
    .catch((error) =>{
      if (error.response?.status === 409) {
        alert("⚠️ 이미 예약된 시간입니다. 다른 시간대를 선택해 주세요.");
      } else {
        alert("예약 중 오류가 발생했습니다.");
      }
    })
    closeModal();

    };



    return (
        <div className={resvStyle['modal-overlay']}>
          <div className={resvStyle['modal-container']}>
            <div className={resvStyle.closeBtn}>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
            </div>
            <h2>예약 하기</h2>
            
            <div>
              날짜
              <input className="resv_date" type="date" value={resvInput.resv_date} onChange={handleInput} />
            </div>
            예약 시간
            <div className={resvStyle.timeRow}>
              
            <div className={resvStyle.timeItem}>
                <label>시작</label>
                <select name="resv_stime" value={resvInput.resv_stime} onChange={handleInput} className={resvStyle.dropDown}>
                  {Array.from({ length: 32 }, (_,i) => i +16).map((index) => {
                    const h = String(Math.floor(index / 2)).padStart(2, '0');
                    const m = index % 2 === 0 ? '00' : '30';
                    const time = `${h}:${m}`;
                    return <option key={time} value={time}>{time}</option>;
                  })}
                </select>
                </div>
                <div className={resvStyle.timeItem}>
                <label>종료</label>
                <select name="resv_etime" value={resvInput.resv_etime} onChange={handleInput} className={resvStyle.dropDown}>
                  {Array.from({ length: 32 }, (_,i) => i +16).map((index) => {
                    const h = String(Math.floor(index / 2)).padStart(2, '0');
                    const m = index % 2 === 0 ? '00' : '30';
                    const time = `${h}:${m}`;
                    return <option key={time} value={time}>{time}</option>;
                  })}
                </select>
            </div>
          </div>
            <div>
            <label>사용목적</label>
              <textarea 
                name="resv_title"
                className={resvStyle.inputText}
                value={resvInput.resv_title}
                onChange={handleInput}
              />
            </div>
            <div className={resvStyle['modal-buttons']}>
              <button onClick={AddReservation} className={resvStyle.saveBtn}>저장</button>
            </div>
          </div>
        </div>
      )
}

export default InputResev;