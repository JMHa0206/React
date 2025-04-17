import detailStyle from './ResvDetail.module.css';
import caxios from '../../Utils/caxios';
import useScheduleStore from '../../store/useScheduleStore';
import { useEffect, useState } from 'react';



const ResvDetail = ({selectedResv, closeDetail, userInfo, onDeleteSuccess }) => {
    
    const { removeEvent } = useScheduleStore();
    const [ empName, setEmpName ] = useState('');
    console.log("selected정보 : " , selectedResv)
    useEffect(() => {
      caxios.get(`/reserve/getEmpName/${selectedResv.extendedProps.emp_id}`)
      .then(resp =>{
        setEmpName(resp.data);
      })

      // caxios.get(`/reserve/getDetail/${}`)
    }, [selectedResv])

    if (!selectedResv) return null;
    const startDateStr = selectedResv?.start ? new Date(selectedResv.start).toISOString().substring(0, 10) : '';
    const startTimeStr = selectedResv?.start ? new Date(selectedResv.start).toISOString().substring(11, 16) : '';
    const endTimeStr = selectedResv?.end ? new Date(selectedResv.end).toISOString().substring(11, 16) : '';

    const handleDelete = () => {
        console.log(selectedResv.id);
        removeEvent(selectedResv.id);

        caxios.delete(`/reserve/${selectedResv.id}`)
        .then(resp => {
          alert("예약이 삭제되었습니다.");
          onDeleteSuccess?.();
           
        })
        .catch((error) => {
          console.error("일정 삭제 실패", error);
        })
        closeDetail();
    };

    


    return (
        <div className={detailStyle['detail-overlay']}>
            <div className={detailStyle['detail-container']}>
            <div className={detailStyle.closeBtn}><button type="button" className="btn-close" aria-label="Close"  onClick={closeDetail}></button></div>
                {
                    <>
                    <div>예약 내용</div>
                    <div><strong>예약자:</strong>{empName}</div>
                    <div><strong>날짜:</strong> {startDateStr}</div>
                    <div><strong>시간:</strong> {startTimeStr} ~ {endTimeStr}</div>
                    <div><strong>사용 목적:</strong> {selectedResv.title}</div>
                    </>
                }
              
        
              <div id="editBtns" className={detailStyle['detail-buttons']}>
                {
                  userInfo && selectedResv.extendedProps?.emp_id == userInfo.emp_code_id ? <button onClick={handleDelete}>삭제</button> : <></>
                }
              </div>
            </div>
          </div>
    )
}

export default ResvDetail;