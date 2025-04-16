import style from './ChattingRoom.module.css';
import { useState, useEffect } from 'react';
import axios from 'axios';



function ChattingRoom({ openChat }) {
    const [roomEmployees, setRoomEmployees] = useState([]);
    const [myId, setMyId] = useState(null);
   


    const ChatRooms = (userId) => {
        axios.get("http://10.5.5.2/Employee/selectMyId", {
            params: {
                userId: userId
            }
        })
            .then((resp) => {
                const myId = resp.data;
                setMyId(resp.data);

                axios.get("http://10.5.5.2/Employee/selectRoom", {
                    params: {
                        myId: myId
                    }
                }).then((room) => {
                    const sortedRooms = room.data.sort((a, b) =>
                        new Date(b.LAST_SEND_DATE) - new Date(a.LAST_SEND_DATE)
                    );

                    Promise.all(
                        sortedRooms.map((room) =>
                            axios.get("http://10.5.5.2/Employee/ProfileImg",{
                                params: {empId: room.EMP_CODE_ID}
                            }).then((imgResp)=>{
                                room.profileImg = imgResp.data;
                                return room;
                            })
                        )
                    ).then((roomsWithImages) => {
                        setRoomEmployees(roomsWithImages);
                    })
                })
            })
    }




    useEffect(() => {
        const userId = sessionStorage.getItem("userId");
        ChatRooms(userId);
    }, [])



    useEffect(() => {
        const userId = sessionStorage.getItem("userId");
        const interval = setInterval(() => {
            ChatRooms(userId);
        }, 2500);

        return () => clearInterval(interval);
    }, [])




    return (
        <div className={style.main}>

                {roomEmployees.map((room, index) => (
                        <div key={index} className={style.another} >
                            <div className={style.imgbox}>
                                <div className={style.anotherimg}>
                                     <img src={`http://10.10.55.66${room.profileImg}`} style={{width:'100%',height:'100%', borderRadius:'50%',objectFit:'cover'}}></img>
                                </div>
                            </div>
                            <div className={style.namebox} onDoubleClick={() => openChat(room.EMP_CODE_ID, myId, room.EMP_NAME)}>
                                <div className={style.anothername}>{room.EMP_NAME}</div>
                                <div className={style.lastmsg}>{room.LAST_MSG}</div>
                                <div className={style.lasttime}>{new Date(room.LAST_SEND_DATE).toLocaleTimeString("ko-KR", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                })}
                                </div>
                            </div>
                        </div>

                ))}

        </div>
    )



}

export default ChattingRoom;