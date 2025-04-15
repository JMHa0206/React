
import React, { useState, useEffect } from 'react';
import resvStyle from './InputReserv.module.css'
import caxios from '../../Utils/caxios';



const InputResev = ({ closeModal, selectedInfo, resourceId, userInfo }) => {
  useEffect(() => {
    if (!resourceId || Number(resourceId) === 0) {
      alert("자원을 먼저 선택해주세요.");
      closeModal();
    }
  }, [resourceId, closeModal]);

    useEffect(() => {
      console.log("넘어온 리소스:", resourceId);
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
    caxios.post("/reserve/addReserve", reservation).catch((error) =>{
      console.error("예약 실패:", error);
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
            <div>
              예약 시간<br></br>
              시작
              <select name="resv_stime" value={resvInput.resv_stime} onChange={handleInput}>
                {Array.from({ length: 32 }, (_,i) => i +16).map((index) => {
                  const h = String(Math.floor(index / 2)).padStart(2, '0');
                  const m = index % 2 === 0 ? '00' : '30';
                  const time = `${h}:${m}`;
                  return <option key={time} value={time}>{time}</option>;
                })}
              </select>
              <br></br>
              종료
              <select name="resv_etime" value={resvInput.resv_etime} onChange={handleInput}>
                {Array.from({ length: 32 }, (_,i) => i +16).map((index) => {
                  const h = String(Math.floor(index / 2)).padStart(2, '0');
                  const m = index % 2 === 0 ? '00' : '30';
                  const time = `${h}:${m}`;
                  return <option key={time} value={time}>{time}</option>;
                })}
              </select>
            </div>
            <div>
              사용 목적
              <textarea
                name="resv_title"
                value={resvInput.resv_title}
                onChange={handleInput}
              />
            </div>
            <div className={resvStyle['modal-buttons']}>
              <button onClick={AddReservation}>저장</button>
            </div>
          </div>
        </div>
      )
}

export default InputResev;