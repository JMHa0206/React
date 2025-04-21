import './fullcalendar.css';
import React, { useEffect,  useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import caxios from '../../Utils/caxios';
import rStyle from './MettingRoom.module.css';
import InputResev from './InputResv';
import ResvDetail from './ResvDetail';
import koLocale from '@fullcalendar/core/locales/ko';





const MeetingRoom = ({ userInfo })=> {
    const [showWeekends, setShowWeekends] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [ resouceList, setResourceList ] = useState([]);
    const [ targetResc, setTargetResc ] = useState(0);
    const [ reservations, setReservations ] = useState([]);
    const [reloadKey, setReloadKey] = useState(0);

    const handleDateSelect = (selectInfo) => {
        const selectedResource = resouceList.find(
            (resource) => resource.resc_id == targetResc
          );
        
          if (selectedResource?.resc_status !== '예약가능') {
            alert("해당 자원은 현재 사용 불가 상태입니다.");
            return;
          }
        
          setSelectedInfo(selectInfo);
          setIsModalOpen(true);
      };

    useEffect(() => {
        
        caxios.get(`/reserve/resources`)
        .then((resp)=>{
            const resources = resp.data;
            setResourceList(resources);
            const firstEquipment = resources.find(r => r.resc_type_id === 110);
            if (firstEquipment) {
                setTargetResc(firstEquipment.resc_id); 
            }
        }).catch((error) => {
            console.error("자원 정보 불러오기 실패", error);
        })
        

        setReservations([]); 
        caxios.get(`/reserve/reservations`).then((resp) => {
            console.log("🔥 서버에서 받아온 예약 목록 원본:", resp.data);
          
            
          
            const formatResev = resp.data.map((resv) => {
                const formatTime = (time) => {
                    const [h, m] = time.split(':');
                    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00+09:00`;
                  };
                  const fixDate = (dateStr) => dateStr.replace(/[./]/g, '-');
                  const startStr = `${fixDate(resv.resv_date)}T${formatTime(resv.resv_stime)}`;
                  const endStr = `${fixDate(resv.resv_date)}T${formatTime(resv.resv_etime)}`;
               
                  return {
                id: resv.resv_id,
                title: resv.resv_title,
                start: startStr,
                end: endStr,
                allDay: false,
                overlap: false,
                extendedProps: {
                  emp_id: resv.resv_emp,
                  resource_id: resv.resource_id
                }
              };
           


            });

            
            //setTargetResc(1001);
            setReservations(formatResev);
          }).catch((error) => {
            console.error("예약목록 불러오기 실패", error);
          });
      
    }, [reloadKey])
    
    
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [ selectedResv , setSelectedResv] = useState(null); 

    const selectResv = (clickInfo) => {
        console.log(clickInfo);
        const selectedResource = resouceList.find(
            (resource) => resource.resc_id == targetResc
          );
          if (selectedResource?.resc_status !== '예약가능') {
            alert("해당 자원은 현재 사용 불가 상태입니다.");
            return; 
          }
        setSelectedResv(clickInfo.event);
        console.log(clickInfo);
        setIsDetailOpen(true);
    };


    return (
        <div>
        <div className={rStyle.reservTable}>
            <div>
                회의실 예약 현황 조회
                <br></br>
                <select value={targetResc} onChange={(e) => setTargetResc(e.target.value)}>
                    {resouceList
                    .filter((resource)=>{
                        if(resource.resc_type_id != 110){
                            return resource.resc_type;
                        }
                        return true;
                    })
                    .map((resc, index) => (
                        <option key={index} value={resc.resc_id}>
                            {resc.resc_name}
                        </option>
                    ))}
                </select>
                
            </div>
            <div>
            <table className={rStyle.infoTable}>
                <thead>
                    <tr>
                    <th>수용인원</th>
                    <th>위치</th>
                    <th>사용 가능 여부</th>
                    <th>비고</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        resouceList
                        .filter((resource) => resource.resc_id == targetResc)
                        .map((resource, index) => (
                            <tr key={index}>
                                <td>{resource.resc_capacity}</td>
                                <td>{resource.resc_location}</td>
                                <td>{resource.resc_status}</td>
                                <td>{resource.resc_description}</td>
                            </tr>
                        ))
                    }
                </tbody>
                </table>
            </div>
            
        <div style={{
            fontFamily: 'initial',
            fontSize: '14px',
            lineHeight: 'normal',
            boxSizing: 'content-box',
            position: 'relative',
            overflow: 'visible',
        }}>
            <FullCalendar
            key={targetResc} 
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            allDaySlot={false} 
            initialView='timeGridDay'
            slotMinTime="08:00:00"
            slotMaxTime="21:00:00"
            slotDuration="00:30:00"
            snapDuration="00:30:00"
            timeZone="local"
            locales={[koLocale]}
            locale="ko"
            titleFormat={{
                month: 'long',
                day: 'numeric', 
                weekday: 'short' 
            }}
            customButtons={{
                toggleWeekend: {
                  text: showWeekends ? '주말 숨기기' : '주말 보이기',
                  click: () => setShowWeekends(prev => !prev)
                }
            }}
            headerToolbar={{
                left: 'prev next',
                center: 'title',
                right: 'toggleWeekend dayGridWeek,timeGridDay'
            }}
            weekends={showWeekends}
            height='auto'
            selectable={true}
            selectOverlap={false}
            selectMirror={false}
            eventOverlap={false}
            select={handleDateSelect}
            events={reservations.filter(resv => resv.extendedProps.resource_id == Number(targetResc))}
            eventClick={selectResv}
            eventDidMount={(info) => {
                info.el.style.backgroundColor = info.event.extendedProps.emp_id === userInfo.emp_code_id ? '#4f7fd8' : '#d5e8fa';
                info.el.style.borderRadius = '4px';
                info.el.style.color = info.event.extendedProps.emp_id === userInfo.emp_code_id ? '#1a3c6c' :'#4f7fd8';
                info.el.style.border = 'none';
              }}
            />
            </div>
        </div>
        {isModalOpen && (<InputResev closeModal={() => setIsModalOpen(false)} selectedInfo={selectedInfo} resourceId={targetResc}  userInfo={userInfo} onSuccess={() => setReloadKey(prev => prev + 1)} onDeleteSuccess={() => setReloadKey(prev => prev + 1)}/>)}

        {isDetailOpen && selectedResv && (<ResvDetail selectedResv={selectedResv} closeDetail={() => setIsDetailOpen(false)} userInfo={userInfo} onSuccess={() => setReloadKey(prev => prev + 1)} onDeleteSuccess={() => setReloadKey(prev => prev + 1)} /> )}
        </div>
    )
};


export default MeetingRoom;
