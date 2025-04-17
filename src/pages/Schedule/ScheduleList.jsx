import React, { useState, useEffect } from 'react';
import AddCategory from './AddCategory';
import caxios from '../../Utils/caxios';
import './ScheduleList.css';
import CalendarDetail from './CalendarDetail';


const ScheduleList = ({ closeModal, onRefresh }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ isCalDetailOpen, setIsCalDetailOpen] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [getMyCalendar, setMyCalendar] = useState([]);
    const [getPublicCalendar, setPublicCalendar] = useState([]);
    const [getComCalendar, setGetComCalendar] = useState([]);
    const [userInfo, setUserInfo ] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    
    const handleModalOpen = (selectInfo) => {
        setSelectedInfo(selectInfo);
        setIsModalOpen(true);
    };
    
    useEffect(()=>{
        caxios.get("/mypage/info").then((resp)=>{
            setUserInfo(resp.data);
        }).catch((error) => {
            console.error("실패", error);
        });
        
    }, [refreshKey]);

    useEffect(() => {
        handleMyCal();
        handlePublicCal();
        handleComCal();
      }, [userInfo]);
    

    const handleMyCal = () => {
        if (!userInfo) return;
          
        caxios.get(`/calendar/myCal/${userInfo.emp_code_id}`).then((resp) => {
            setMyCalendar(resp.data);
    })};


    
    const handlePublicCal = () => {
        if (!userInfo) return;
        caxios.get(`/calendar/sharedList/${userInfo.emp_code_id}`).then((resp)=>{
                setPublicCalendar(resp.data);
    })};

        
    const handleComCal = () => {
        if (!userInfo) return;
        caxios.get(`/calendar/comCal/${userInfo.emp_code_id}`).then((resp) => {
            setGetComCalendar(resp.data);
    })};
    
 

    const handleClickMy = (e, calendar) => {
    e.preventDefault();
    setSelectedInfo(calendar);
    setIsCalDetailOpen(true);
    };

    const handleClickShare = (e, calendar) => {
        e.preventDefault();
        if(userInfo.emp_job_id >= 1010 || userInfo.emp_code_id == calendar.emp_id){
            setSelectedInfo(calendar);
            setIsCalDetailOpen(true);
        }else{
            alert("수정 및 삭제 권한이 없습니다.");
        }
        
        
        };
    
    const handleClick = (e, calendar) => {
        e.preventDefault();
        if(userInfo.emp_job_id >= 1013){
            setSelectedInfo(calendar);
            setIsCalDetailOpen(true); 
        }else{
            alert("수정 및 삭제 권한이 없습니다.");
        }
    };

    const handleRefreshAll = () => {
        setRefreshKey(prev => prev + 1);
        if (onRefresh) onRefresh();
      };



    return (
        <div className="accordion-container">
            <div>
                <button className="calendar-add-button" onClick={handleModalOpen}>캘린더 추가</button>
            </div>
            <div className="accordion" id="accordionExample">
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne" onClick={handleMyCal}>
                            내 캘린더
                        </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                            {
                                getMyCalendar
                                .filter((calendar)=>{
                                    if(calendar.public_code == 10){
                                        return calendar.emp_id == `${userInfo.emp_code_id}`;
                                    }
                                    return true;
                                })
                                .map((calendar, index) => (
                                    <div className="form-check" key={calendar.c_id} onClick={(e) => handleClickMy(e, calendar)}>
                                        <label className="form-check-label"style={{ display: 'inline-block', cursor: 'pointer', backgroundColor: `${calendar.color}` }}></label>
                                        <strong>{calendar.c_title}</strong>
                                    </div>
                                  ))
                            }
                        </div>
                    </div>
                </div>
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo" onClick={handlePublicCal}>
                            공유 캘린더
                        </button>
                    </h2>
                    <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                            
                            {
                                getPublicCalendar
                                .map((calendar) => (
                                    <div className="form-check" key={calendar.c_id} onClick={(e) => handleClickShare(e, calendar)}>
                                        <label className="form-check-label"style={{ display: 'inline-block', cursor: 'pointer', backgroundColor: `${calendar.color}` }}></label>
                                        <strong>{calendar.c_title}</strong>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree" onClick={handleComCal}>
                            회사 캘린더
                        </button>
                    </h2>
                    <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                            {
                                getComCalendar.map((calendar) => (
                                    <div className="form-check" key={calendar.c_id} onClick={(e) => handleClick(e, calendar)}>
                                        <label className="form-check-label"style={{ display: 'inline-block', cursor: 'pointer', backgroundColor: `${calendar.color}` }}></label>
                                        <strong>{calendar.c_title}</strong>
                                    </div>
                                  ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && (<AddCategory closeModal={() => setIsModalOpen(false)} selectedInfo={selectedInfo} onRefresh={handleRefreshAll}/>)}
            { isCalDetailOpen && ( <CalendarDetail closeModal={() => setIsCalDetailOpen(false)} selectedInfo={selectedInfo}  onRefresh={handleRefreshAll}/>)}

           
        </div>
    )

    


}



export default ScheduleList;


