import detailStyle from './ResvDetail.module.css';
import caxios from '../../Utils/caxios';
import useScheduleStore from '../../store/useScheduleStore';
import { useEffect, useState } from 'react';



const ResvDetail = ({selectedResv, closeDetail, userInfo, onDeleteSuccess }) => {
    
    const { removeEvent } = useScheduleStore();
    const [ empName, setEmpName ] = useState('');
    const [ resvId, setResvId ] = useState(0);
    const [ resvDetail, setResvDetail ] = useState({});
    console.log("selected정보 : " , selectedResv.id);
    useEffect(() => {
      caxios.get(`/reserve/getEmpName/${selectedResv.extendedProps.emp_id}`)
      .then(resp =>{
        setEmpName(resp.data);
      })

      setResvId(selectedResv.id);
      caxios.get(`/reserve/getDetail/${selectedResv.id}`)
      .then(resp => {
        setResvDetail(resp.data);
      })

    }, [selectedResv])

    if (!selectedResv) return null;

    const handleDelete = () => {
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
                    <h3 style={{margin:'10px'}}>예약 내용</h3>
                    <div><strong>예약자:</strong>{empName}</div>
                    <div><strong>날짜:</strong> {resvDetail.resv_date}</div>
                    <div><strong>시간:</strong> {resvDetail.resv_stime} ~ {resvDetail.resv_etime}</div>
                    <div><strong>사용 목적:</strong> {resvDetail.resv_title}</div>
                    </>
                }
              
        
              <div id="editBtns" className={detailStyle['detail-buttons']}>
                {
                  userInfo && selectedResv.extendedProps?.emp_id == userInfo.emp_code_id ? <button onClick={handleDelete} className={detailStyle['delete-button']}>삭제</button> : <></>
                }
              </div>
            </div>
          </div>
    )
}

export default ResvDetail;