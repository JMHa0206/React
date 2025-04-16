import detailStyle from './ResvDetail.module.css';
import caxios from '../../Utils/caxios';
import useScheduleStore from '../../store/useScheduleStore';



const ResvDetail = ({selectedResv, closeDetail, userInfo }) => {

    // const [userInfo,setUserInfo] = useState(null);
    // useEffect(()=>{
    //       caxios.get("/mypage/info")
    //       .then((resp) => {
    //         const info = resp.data;
    //         console.log("userInfo 확인:", info);
    //         setUserInfo(info);
    //       })
    //       .catch((error) => {
    //         console.error("유저 정보 로딩 실패", error);
    //       });
    // }, [])

    const { removeEvent } = useScheduleStore();
    const handleDelete = () => {
        console.log(selectedResv.id);
        removeEvent(selectedResv.id)
        caxios.delete(`/reserve/${selectedResv.id}`)
        .then(resp => {})
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
                    <div><strong>예약자:</strong>{selectedResv.extendedProps?.emp_id}</div>
                    <div><strong>날짜:</strong> {selectedResv.start.toISOString().substring(0, 10)}</div>
                    <div><strong>시간:</strong> {selectedResv.start.toISOString().substring(11, 16)} ~ {selectedResv.end.toISOString().substring(11, 16)}</div>
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