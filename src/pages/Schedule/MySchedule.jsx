// src/components/Sidebar.jsx
import { formatDate } from '@fullcalendar/core';
import { useState, useEffect } from 'react';
import useScheduleStore from '../../store/useScheduleStore';
import caxios from '../../Utils/caxios';

const MySchedule = () => {

    const { events, setEvents, addEvents } = useScheduleStore();
    const [ userInfo, setUserInfo ] = useState({});
    const [eventInput, setEventInput] = useState({
        id: '',
        title: '',
        start_date: '',
        end_date: '',
        startTime: '',
        endTime: '',
        content: '',
        color: '',
        c_id: 1,
        emp_id: 0
    });
    
    useEffect(()=>{
        caxios.get("/mypage/info")
        .then((resp)=>{
          const info = resp.data;
          console.log(info);
          setUserInfo(info);
    
          
          setEventInput((prev) => ({
            ...prev,
            emp_id: info.emp_code_id
          }));
    
        }).catch((error) => {
            console.error("실패", error);
        });
    
        
    }, [])
    
    
    useEffect(() => {
        setEvents([]);
        caxios.get('/schedule/comEvents').then((resp) => {
            
          const getComEvents = resp.data;
          getComEvents.map((event) => ({
            id:event.id,
            title: event.title,
            start: `${event.start_date}`,
            end: `${event.end_date}`,
            allDay: false,
            extendedProps: {
              c_id: event.c_id,
              color: event.color
            }
          }));
          addEvents(getComEvents);
        }).catch((error) => {
          console.error("일정 정보 불러오기 실패", error);
        })
    
    }, [userInfo.emp_code_id])
    
    
    
    useEffect(() => {
          if (!userInfo.emp_code_id) return;
          console.log("유저인포 값 확인 : " + userInfo.emp_code_id);
          
        caxios.get(`/schedule/myEvents/${userInfo.emp_code_id}`).then((resp)=>{
          
          
          const getMyEvents = resp.data.map((event) => ({
            id:event.id,
            title: event.title,
            start: `${event.start_date}`,
            end: `${event.end_date}`,
            allDay: false,
            extendedProps: {
              c_id: event.c_id,
              color: event.color
            }
          }));
          addEvents(getMyEvents);
        }).catch((error) => {
          console.error("일정 정보 불러오기 실패", error);
        })
        
    }, [userInfo.emp_code_id])
    
    
    useEffect(() => {
        if (!userInfo.emp_code_id) return;
        console.log("유저인포 값 확인 : " + userInfo.emp_code_id);
        
        caxios.get(`/schedule/shareEvents/${userInfo.emp_code_id}`).then((resp)=>{
        console.log("공유 일정 목록 : " + resp.data);
        
        const shareEvents = resp.data.map((event) => ({
          id:event.id,
          title: event.title,
          start: `${event.start_date}`,
          end: `${event.end_date}`,
          allDay: false,
          extendedProps: {
            c_id: event.c_id,
            color: event.color
          }
        }));
        addEvents(shareEvents);
      }).catch((error) => {
        console.error("일정 정보 불러오기 실패", error);
      })
      
    }, [userInfo.emp_code_id])

    
    
    return (
        <div className='demo-app-sidebar'>
        <div className='demo-app-sidebar-section'>
            <h2>나의 일정 ({events.length})</h2>
            <div className="tableContainer">
                <table>
                <tr><td>예정된 일정</td></tr>
                {events.map((event, index) => (
                    <SidebarEvent key={index} event={event} />
                ))}
                </table>
            </div>
        </div>
        </div>
    );
};



const SidebarEvent = ({ event}) => {
  return (
            <tr>
                <td><b>{event.title}</b></td>
                <td><i>{new Date(event.start).toLocaleDateString('ko-KR')}</i></td>
            </tr>
  );

};

export default MySchedule;
