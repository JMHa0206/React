import style from './GroupChatting.module.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import "dayjs/locale/ko";
dayjs.locale("ko");

function GroupChatting({ openChat }) {
    const [roomEmployees, setRoomEmployees] = useState([]);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, roomId: null });
    const navigate = useNavigate();
    const myIdRef = useRef(null);
    const location = useLocation();


    useEffect(() => {
        const userId = sessionStorage.getItem("userId");

        const firstData = () => {
            axios.get("http://10.5.5.2/Employee/selectMyId", {
                params: {
                    userId: userId
                }
            })
                .then((resp) => {

                    myIdRef.current = resp.data;
                    // sql에서 내아이디가 그룹멤버에 포함되어있고 멤버수가 3이상일때
                    axios.get("http://10.5.5.2/Employee/selectGroupChat", {
                        params: {
                            myId: myIdRef.current
                        }
                    }).then((grouproom) => {

                        const filtered = grouproom.data.map(room => {
                            const members = room.group_member.split(",");
                            const filteredMembers = members.filter(id => id !== String(myIdRef.current));

                            return axios.post("http://10.5.5.2/Employee/getNamesIds", {
                                ids: filteredMembers
                            }).then((namesResp) => {
                                return axios.get("http://10.5.5.2/Employee/getGroupInfo", {
                                    params: { groupId: room.msg_group_id }
                                }).then((groupInfo) => {
                                    console.log(groupInfo.data);

                                    return {
                                        ...room,
                                        group_member_list: filteredMembers,
                                        group_name: namesResp.data,
                                        last_message: groupInfo.data[0]?.LAST_MESSAGE,
                                        last_time: groupInfo.data[0]?.LAST_MESSAGE_TIME,
                                        num_members: groupInfo.data[0]?.NUM_MEMBERS

                                    };

                                })


                            })

                        })
                        Promise.all(filtered).then((results) => {

                            const sorted = results.sort((a, b) => {
                                return new Date(b.last_time) - new Date(a.last_time)
                            })

                            setRoomEmployees(sorted);
                        })

                    })

                })

        };

        firstData();

        const interval = setInterval(firstData, 2500);

        return () => clearInterval(interval);

    }, [])

    const handleContextMenu = (e, roomId) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            roomId: roomId,
        });
    };

    useEffect(() => {
        const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, roomId: null });
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    const handleDelete = () => {
        axios.put(`http://10.5.5.2/Employee/quitRoom`, {
                myId:myIdRef.current,
                msgGroupId: contextMenu.roomId
        })
            .then(() => {
                // 삭제 후 UI에서 해당 방 제거
                setRoomEmployees(prev => prev.filter(room => room.msg_group_id !== contextMenu.roomId));
                setContextMenu({ visible: false, x: 0, y: 0, roomId: null });
            })

    };

    const group = (selectedNames, myId, seq) => {
        navigate(`/messenger/chatting?chat=${selectedNames}&from=${myId}&seq=${seq}`,{
            state: { fromPage: location.pathname }
        });
    }

    const formatGroupName = (names, maxDisplay = 3) => {
        const displayNames = names.slice(0, maxDisplay);
        const extraCount = names.length - maxDisplay;
    
        if (extraCount > 0) {
            return `${displayNames.join(", ")} 외 ${extraCount}명`;
        } else {
            return displayNames.join(", ");
        }
    };

    return (
        <div className={style.main}>
            {roomEmployees.map((room, index) => (

                <div key={index} className={style.another} onDoubleClick={() => group(room.group_name.join(", "), myIdRef.current, room.msg_group_id)}
                    onContextMenu={(e) => handleContextMenu(e, room.msg_group_id)}>
                    <div className={style.imgbox}>
                        <div className={style.anotherimg}>
                            {/* <img src=""></img> 프로필 이미지 넣는곳*/}
                        </div>
                    </div>
                    <div className={style.namebox} >
                        <div className={style.anothername}>{formatGroupName(room.group_name)}</div>
                        <div className={style.chatinfo}>
                            <div className={style.lastMessage}>{room.last_message}</div>
                            <div className={style.bottomRow}>
                                <div className={style.memberCount}>{room.num_members}명 참여 중</div>
                                <div className={style.sendTime}>
                                    {room.last_time ? dayjs(room.last_time).format("A hh:mm") : ""}
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            ))}

            {contextMenu.visible && (
                <ul
                    className={style.contextMenu}
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <li onClick={handleDelete}>방 나가기</li>
                </ul>
            )}

        </div>
    )



}

export default GroupChatting;