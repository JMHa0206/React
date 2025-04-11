import React, { useState, useEffect } from 'react';
import AddCategory from './AddCategory';
import caxios from '../../Utils/caxios';

const ScheduleList = ({ closeModal }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [getMyCalendar, setMyCalendar] = useState([]);
    const [getPublicCalendar, setPublicCalendar] = useState([]);
    const [getComCalendar, setGetComCalendar] = useState([]);
    const [userInfo, setUserInfo ] = useState(null);
    const userId = sessionStorage.getItem("userId");
    
    
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
        
    }, [])
    

    const handleMyCal = () => {
        caxios.get("/calendar/myCal", {
            params: {
              public_code: 10  
            }}
        ).then((resp) => {
            setMyCalendar(resp.data);
    })};


    const [ sharedList, setSharedList] = useState([]);
    const handlePublicCal = () => {
        // const calCodes = resp.data.map(cal => cal.c_id);
    //     caxios.get("/calendar/publicCal", {
            
    //         params: {
    //             public_code: 20  
    //         }}
    //     ).then((resp) => {
    //         setPublicCalendar(resp.data);

        


    // })
    caxios.get(`/calendar/sharedList`).then((resp)=>{
                setPublicCalendar(resp.data);
            })
};

        
    const handleComCal = () => {
        caxios.get("/calendar/comCal", {
            params: {
                public_code: 30  
            }}
        ).then((resp) => {
            setGetComCalendar(resp.data);
    })};
    
    



    return (
        <div>
            <div>
                커스텀뷰 넣기
            </div>

            <div className="accordion" id="accordionExample">
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne" onClick={handleMyCal}>
                            내 캘린더
                        </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse">
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
                                    <div className="form-check form-switch" key={calendar.c_id}>
                                        <input className="form-check-input" type="checkbox" role="switch" id="switchCheckChecked" defaultChecked/>
                                        <label className="form-check-label" htmlFor="switchCheckChecked" style={{ display: 'inline-block', cursor: 'pointer', backgroundColor: `${calendar.color}` }}>
                                            <strong>{calendar.c_title}</strong>
                                        </label>
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
                    <div id="collapseTwo" className="accordion-collapse collapse">
                        <div className="accordion-body">
                            
                            {
                                getPublicCalendar
                                .filter((calendar)=>{
                                    if(calendar.public_code == 20){
                                        return calendar.deft_id == `${userInfo.emp_code_id}` || `${userInfo.deft_id}`;// 현재 캘린더 생성자일때 보여주고 있음.
                                    }
                                    return true;
                                })
                                .map((calendar) => (
                                    <div className="form-check form-switch" key={calendar.c_id}>
                                        <input className="form-check-input" type="checkbox" role="switch" id="switchCheckChecked" defaultChecked />
                                        <label className="form-check-label" htmlFor="switchCheckChecked" style={{ display: 'inline-block', cursor: 'pointer', backgroundColor: `${calendar.color}` }}>
                                            <strong>{calendar.c_title}</strong>
                                        </label>
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
                    <div id="collapseThree" className="accordion-collapse collapse">
                        <div className="accordion-body">
                            {
                                getComCalendar.map((calendar) => (
                                    <div className="form-check form-switch" key={calendar.c_id}>
                                        <input className="form-check-input" type="checkbox" role="switch" id="switchCheckChecked" defaultChecked />
                                        <label className="form-check-label" htmlFor="switchCheckChecked" style={{ display: 'inline-block', cursor: 'pointer', backgroundColor: `${calendar.color}` }}>
                                            <strong>{calendar.c_title}</strong>
                                        </label>
                                    </div>
                                  ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <button onClick={handleModalOpen}>캘린더 추가</button>

            </div>
            {isModalOpen && (<AddCategory closeModal={() => setIsModalOpen(false)} selectedInfo={selectedInfo} />)}
        </div>
    )


}



export default ScheduleList;


