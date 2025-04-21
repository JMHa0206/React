import style from './ChattingRoom.module.css';
import { useState, useEffect } from 'react';

import axios from 'axios';
import stompClient from "../../Components/websocket/websocket";

function ChattingRoom({ openChat }) {
    const [roomEmployees, setRoomEmployees] = useState([]);
    const [myId, setMyId] = useState(null);
    const [seq, setSeq] = useState(null);
    const [subscribedGroups, setSubscribedGroups] = useState([]);
    
    const ChatRooms = (myId) => {
        axios.get("http://10.5.5.6/Employee/selectRoom", {
            params: {
                myId: myId
            }
        }).then((room) => {
            const seqArray = room.data.map((roomItem) => roomItem.MSG_GROUP_ID);
            setSeq(seqArray);

            const sortedRooms = room.data.sort((a, b) =>
                new Date(b.LAST_SEND_DATE) - new Date(a.LAST_SEND_DATE)
            );

            Promise.all(
                sortedRooms.map((room) =>
                    axios.get("http://10.5.5.6/Employee/ProfileImg", {
                        params: { empId: room.EMP_CODE_ID }
                    }).then((imgResp) => {
                        room.profileImg = imgResp.data;
                        return room;
                    })
                )
            ).then((roomsWithImages) => {
                setRoomEmployees(roomsWithImages);
            });
        });
    };


    useEffect(() => {
        const userId = sessionStorage.getItem("userId");
        axios.get("http://10.5.5.6/Employee/selectMyId", {
            params: {
                userId: userId
            }
        }).then((resp) => {
            const fetchedMyId = resp.data;
            setMyId(fetchedMyId);
            ChatRooms(fetchedMyId); 
        });
    }, []);

   
    useEffect(() => {
        if (myId && seq && seq.length > 0) {
            stompClient.onConnect = () => {
                seq.forEach((groupSeq) => {
                    if(!subscribedGroups.includes(groupSeq)){
                    stompClient.subscribe(`/topic/messages/${groupSeq}`, (msg) => {
                        const updatedRoom = JSON.parse(msg.body);
                        setRoomEmployees((prevRooms) => {
                            return prevRooms.map((room) =>
                                room.MSG_GROUP_ID === updatedRoom.msg_group_id
                                    ? {
                                        ...room,
                                        LAST_MSG: updatedRoom.msg_content,
                                        LAST_SEND_DATE: updatedRoom.send_date
                                    }
                                    : room
                            );
                        });
                    });
                    setSubscribedGroups((prevSubscribedGroups) => [
                        ...prevSubscribedGroups,
                        groupSeq
                        ])
                    }
                });
            };

            stompClient.activate();

            return () => {
                stompClient.deactivate();
            };
        }
    }, [myId, seq]);

    return (
        <div className={style.main}>
            {roomEmployees.map((room, index) => (
                <div key={index} className={style.another}>
                    <div className={style.imgbox}>
                        <div className={style.anotherimg}>
                            <img
                                src={`http://10.5.5.6${room.profileImg}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                               alt=""
                            />
                        </div>
                    </div>
                    <div
                        className={style.namebox}
                        onDoubleClick={() => openChat(room.EMP_CODE_ID, myId, room.EMP_NAME)}
                    >
                        <div className={style.anothername}>{room.EMP_NAME}</div>
                        <div className={style.lastmsg}>{room.LAST_MSG}</div>
                        <div className={style.lasttime}>
                            {room.LAST_SEND_DATE &&
                                new Date(room.LAST_SEND_DATE).toLocaleTimeString("ko-KR", {
                                    hour: "numeric",
                                    minute: "2-digit"
                                })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ChattingRoom;
