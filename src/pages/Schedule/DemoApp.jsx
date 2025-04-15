import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import calenderStyle from './DemoApp.module.css';
import caxios from '../../Utils/caxios';
import useScheduleStore from '../../store/useScheduleStore';
import koLocale from '@fullcalendar/core/locales/ko';



const DemoApp = ({ onRefresh, reloadKey }) => {
  const [showWeekends, setShowWeekends] = useState(true);
  const { events, addEvent, setEvents, addEvents, removeEvent } = useScheduleStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
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

  const [userInfo, setUserInfo ] = useState({});

  useEffect(()=>{
    caxios.get("/mypage/info").then((resp)=>{
      const info = resp.data;
      console.log(info);
      setUserInfo(info);
      
      setEventInput((prev) => ({
        ...prev,
        emp_id: info.emp_code_id
      }));
      console.log("인포 값 확인 : " + info.emp_code_id);

    }).catch((error) => {
        console.error("실패", error);
    });

    
}, [reloadKey])


  useEffect(() => {
    setEvents([]);
    caxios.get('/schedule/comEvents').then((resp) => {
      const getComEvents = resp.data.map((event) => ({
        id:event.id,
        title: event.title,
        start: `${event.start_date}T${event.startTime}`,
        end: `${event.end_date}T${event.endTime}`,
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

  }, [userInfo.emp_code_id, reloadKey])



    useEffect(() => {
      if (!userInfo.emp_code_id) return;
      console.log("유저인포 값 확인 : " + userInfo.emp_code_id);
      
    caxios.get(`/schedule/myEvents/${userInfo.emp_code_id}`).then((resp)=>{
      
      
      const getMyEvents = resp.data.map((event) => ({
        id:event.id,
        title: event.title,
        start: `${event.start_date}T${event.startTime}`,
        end: `${event.end_date}T${event.endTime}`,
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
    
  }, [userInfo.emp_code_id, reloadKey])


  useEffect(() => {
    if (!userInfo.emp_code_id) return;
    console.log("유저인포 값 확인 : " + userInfo.emp_code_id);
    
  caxios.get(`/schedule/shareEvents/${userInfo.emp_code_id}`).then((resp)=>{
    console.log("공유 일정 목록 : " + resp.data);
    
    const shareEvents = resp.data.map((event) => ({
      id:event.id,
      title: event.title,
      start: `${event.start_date}T${event.startTime}`,
      end: `${event.end_date}T${event.endTime}`,
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
  
}, [userInfo.emp_code_id, reloadKey])



  const [weekendsVisible, setWeekendsVisible] = useState(true);

  


  const handleInput = (e) => {
    const { name, value } = e.target;
    
    setEventInput((prev) => ({ ...prev, [name]: name === 'c_id' ? Number(value) : value }));
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedInfo(selectInfo);
    setIsModalOpen(true);
    
  };

 
 

  const handleAddEvent = () => {
    
    const calendarApi = selectedInfo.view.calendar;
    calendarApi.unselect();

    const newEvent = {
      id: Date.now().toString(),
      c_id: eventInput.c_id,
      title: eventInput.title,
      start: `${eventInput.start_date}T${eventInput.startTime}`,
      end: `${eventInput.end_date}T${eventInput.endTime}`,
      allDay: false,
      color:`${eventInput.color}`,
      extendedProps: {
        content: eventInput.content,
        c_id: eventInput.c_id,
        emp_id: eventInput.emp_id
        
      }
    };

  
    

    addEvent(newEvent);
    calendarApi.addEvent(newEvent);


    caxios.post("/schedule", eventInput)
    .then(() => {
      if (onRefresh) onRefresh();
    })
    .catch((error) => {
      if (error.response?.status === 404 || 500) {
        alert("등록에 실패했습니다.");
      }
    });

    setIsModalOpen(false);
    setEventInput({
      id: '', title: '', start_date: '', end_date: '', startTime: '', endTime: '', content: '', c_id: 1
    });

    

  };

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);


  const handleEventClick = (clickInfo) => {

    caxios.get(`/schedule/${clickInfo.event.id}`).then((resp) => {

      const getEvent = resp.data;
      const formattedEvent = {
        id:getEvent.id,
        c_id:getEvent.c_id,
        title: getEvent.title,
        start_date: `${getEvent.start_date}T${getEvent.startTime}`,
        end_date: `${getEvent.end_date}T${getEvent.endTime}`,
        startTime: `${getEvent.startTime}`,
        endTime: `${getEvent.endTime}`,
        content: `${getEvent.content}`,
        emp_id: getEvent.emp_id,
        color: `${getEvent.color}`
        
      };

    setSelectedEvent(formattedEvent);
    setIsDetailOpen(true);

    });

  };



  const handleDelete = () => {
    removeEvent(selectedEvent.id)
    caxios.delete(`/schedule/${selectedEvent.id}`).then(resp => {}).catch((error) => {
      console.error("일정 삭제 실패", error);
    })
    setIsDetailOpen(false);
  };

  const [update, setUpdate ] = useState({
    id:'',
    title:'',
    start_date:'',
    end_date: '',
    startTime: '',
    endTime: '',
    content: ''
  });

  useEffect(() => {
    if (selectedEvent) {
      setUpdate({
        id: selectedEvent.id || 0,
        c_id : selectedEvent.c_id || '',
        title: selectedEvent.title || '',
        start_date: selectedEvent.start_date || '',
        end_date: selectedEvent.end_date || '',
        startTime: formatTime(selectedEvent.startTime) || '',
        endTime: formatTime(selectedEvent.endTime) || '',
        content: selectedEvent.content || ''
      });
    }
  }, [selectedEvent]);

  const handleUpdate = (e) => {
    setIsEditing(true);
    const {name,value} = e.target
        setUpdate((prev)=>({...prev,[name]:value}));
  };



  const handleSave = () => {
    console.log(update);
    caxios.put(`/schedule/${update.id}`, update).then(resp => {
      
      
    })
    .catch((error) => {
      console.error("일정 수정 실패", error);
    })
    setIsEditing(false);
    setSelectedEvent(update);
    setIsDetailOpen(false);
  };
  
  const [isEditing, setIsEditing] = useState(false);

  const [ calList, setCalList ] = useState([]);
  useEffect(() => {
    caxios.get('/calendar').then((resp) => {
      console.log(resp.data);
      setCalList(resp.data);
      
    }).catch((error) => {
      console.error("캘린더목록 불러오기 실패", error);
    })
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  };




  

  return (
    <div className={calenderStyle['demo-app']}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        locales={[koLocale]}
        locale="ko"
        customButtons={{
          toggleWeekend: {
            text: showWeekends ? '주말 숨기기' : '주말 보이기',
            click: () => setShowWeekends(prev => !prev)
          }
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'toggleWeekend dayGridMonth,dayGridWeek'
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={showWeekends}
        select={handleDateSelect}
        eventContent={renderEventContent}
        events={events}
        eventClick={handleEventClick}
      />
      {isModalOpen && (
         <div className={calenderStyle['modal-overlay']}>
          
         <div className={calenderStyle['modal-container']}>
          <div className={calenderStyle.closeBtn}><button type="button" className="btn-close" aria-label="Close" onClick={() => setIsModalOpen(false)}></button></div>
         <h2>일정 추가</h2>
         <div>
             일정 종류
             <select name="c_id" value={eventInput.c_id} onChange={handleInput}>
                 <option value="">캘린더 선택</option>

                 {
                  // 일정 추가 시 캘린터 선택지에 직급에 따라 필터링 거는 중 (회사캘린더의 경우 부서장 이상만 일정 추가 가능)
                   calList
                   .filter((calendar) => {
                    return (
                      (calendar.public_code === 30 && userInfo.job_id >= 1011) ||
                
                      (calendar.public_code === 10 && userInfo.emp_code_id == calendar.emp_id) ||
                
                      (calendar.public_code === 20 &&
                        userInfo.emp_job_id >= 1002 &&
                        (userInfo.emp_dept_id == calendar.target_id || userInfo.emp_code_id == calendar.target_id))
                    );
                  })
                   .map((calender, index) => (
                    <option key={index} value={calender.c_id}>
                      {calender.c_title}
                    </option>
                  ))
                 }
             </select>
         </div>
         <div>
             일정 제목
             <input
             type="text"
             name="title"
             value={eventInput.title}
             onChange={handleInput}
             placeholder="일정 제목 입력"
             autoFocus
             />
         </div>
         <div>
             시작일
             <input name="start_date" type="date" value={eventInput.start_date} onChange={handleInput} />
             종료일
             <input name="end_date" type="date" value={eventInput.end_date} onChange={handleInput} />
             
         </div>
         <div>
             시작시간
             <select name="startTime" value={eventInput.startTime} onChange={handleInput}>
             {Array.from({ length: 48 }).map((_, index) => {
                 const h = String(Math.floor(index / 2)).padStart(2, '0');
                 const m = index % 2 === 0 ? '00' : '30';
                 const time = `${h}:${m}`;
                 return <option key={time} value={time}>{time}</option>;
             })}
             </select>
             종료시간
             <select name="endTime" value={eventInput.endTime} onChange={handleInput}>
             {Array.from({ length: 48 }).map((_, index) => {
                 const h = String(Math.floor(index / 2)).padStart(2, '0');
                 const m = index % 2 === 0 ? '00' : '30';
                 const time = `${h}:${m}`;
                 return <option key={time} value={time}>{time}</option>;
             })}
             </select>
         </div>
         <div>
             일정 내용
             <textarea
             name="content"
             calssName={calenderStyle.schetextarea}
             value={eventInput.content}
             onChange={handleInput}
             placeholder="내용 입력"
             style={{ width: '300px', height: '150px', resize: 'none' }}
             />
         </div>
         <div className={calenderStyle['modal-buttons']}>
             <button onClick={handleAddEvent}>저장</button>
         </div>
         </div>
     </div>
      )}

{isDetailOpen && selectedEvent && (
  <div className={calenderStyle.detailOverlay}>
  <div className={calenderStyle.detailContainer}>
    <div className={calenderStyle.closeBtn}>
      <button type="button" className="btn-close" aria-label="Close" onClick={() => { setIsDetailOpen(false); setIsEditing(false); }}></button>
    </div>

    <h2>{isEditing ? "일정 수정" : "상세 내용"}</h2>

    {isEditing ? (
      <>
        <input type="hidden" name="id" value={update.id} />
        <div><strong>제목:</strong><input type="text" name="title" value={update.title} onChange={handleUpdate} /></div>
        <div className={calenderStyle.timeRow}>
          <div className={calenderStyle.timeItem}>
            <label>시작일</label>
            <input name="start_date" type="date" value={update.start_date} onChange={handleUpdate} />
          </div>
          <div className={calenderStyle.timeItem}>
            <label>종료일</label>
            <input name="end_date" type="date" value={update.end_date} onChange={handleUpdate} />
          </div>
        </div>
        <div className={calenderStyle.timeRow}>
          <div className={calenderStyle.timeItem}>
            <label>시작시간</label>
            <select name="startTime" value={eventInput.startTime} onChange={handleInput}>
              {Array.from({ length: 48 }).map((_, i) => {
                const h = String(Math.floor(i / 2)).padStart(2, '0');
                const m = i % 2 === 0 ? '00' : '30';
                return <option key={i} value={`${h}:${m}`}>{`${h}:${m}`}</option>;
              })}
            </select>
          </div>
          <div className={calenderStyle.timeItem}>
            <label>종료시간</label>
            <select name="endTime" value={eventInput.endTime} onChange={handleInput}>
              {Array.from({ length: 48 }).map((_, i) => {
                const h = String(Math.floor(i / 2)).padStart(2, '0');
                const m = i % 2 === 0 ? '00' : '30';
                return <option key={i} value={`${h}:${m}`}>{`${h}:${m}`}</option>;
              })}
            </select>
          </div>
        </div>
        <div>
          <strong>내용:</strong>
          <textarea calssName={calenderStyle.schetextarea}name="content" value={update.content} onChange={handleUpdate} placeholder="내용 입력" />
        </div>
      </>
    ) : (
      <>
        <div><strong>제목:</strong> {selectedEvent.title}</div>
        <div><strong>기간:</strong> {selectedEvent.start_date} ~ {selectedEvent.end_date}</div>
        <div><strong>시간:</strong> {selectedEvent.startTime} ~ {selectedEvent.endTime}</div>
        <div><strong>내용:</strong> {selectedEvent.content}</div>
      </>
    )}

    <div className={calenderStyle.detailButtons}>
      {userInfo.emp_code_id === selectedEvent.emp_id && (isEditing ? (
        <>
          <button onClick={handleSave}>저장</button>
          <button onClick={() => setIsEditing(false)}>취소</button>
        </>
      ) : (
        <>
          <button onClick={handleUpdate}>수정</button>
          <button onClick={handleDelete}>삭제</button>
        </>
      ))}
    </div>
  </div>
</div>
)}



    </div>
  );
}



const renderEventContent = (eventInfo) => {
  const bgColor = eventInfo.event.extendedProps.color || 'dodgeblue';
 return (
    <div style={{backgroundColor:bgColor, borderRadius:'0px'}}>
      <b>{eventInfo.event.title}</b>
    </div>
  );
};




export default DemoApp;
