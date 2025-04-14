import msgstyle from '../chatting/Chatting.module.css';
import { useState, useEffect, useRef } from 'react';
import { replace, useLocation, useNavigate } from 'react-router-dom';
import stompClient from "../../Components/websocket/websocket";
import axios from 'axios';
import dayjs from 'dayjs';
import "dayjs/locale/ko";
dayjs.locale("ko");

function Chatting() {

    const [message, setMessage] = useState(""); //채팅한 메시지
    const [messages, setMessages] = useState([]); //메시지 저장
    const [isLoaded, setIsLoaded] = useState(false);
    const [empMap, setEmpMap] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [employees, setEmployees] = useState([]); // 초대 가능한 직원 목록
    const [selected, setSelected] = useState([]);   // 선택된 직원들
    const [myInfo,setMyInfo] = useState(null);


    const contentRef = useRef(null);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const targetName = params.get("chat");//대화상대
    const myId = Number(params.get("from")); //내 id
    const seq = Number(params.get("seq")); //방 번호

   
    useEffect(()=>{
        axios.get("http://10.5.5.6/Employee/SelectEmp")
        .then(resp=>{
            const empObj = {};
            resp.data.forEach(emp =>{
                empObj[emp.emp_code_id] = emp.emp_name;
            });
            setEmpMap(empObj);
        })
    },[]);

    useEffect(() => {
        const userId = sessionStorage.getItem("userId");
        let mine = null;

          axios.get("http://10.5.5.6/Employee/SelectMine",{
            params: {
                userId: userId
            }
          }).then((userIdResp)=>{
              mine = userIdResp.data;
              setMyInfo(mine);
        })
    },[]);

    const showMessages = () => {
        axios.get("http://10.5.5.6/Employee/showMessages", {
            params: {
                seq: seq
            }
        }).then((resp) => {
            console.log(resp)
            const fetchedMessages = resp.data.map(msg => ({
                ...msg,
                isMine: msg.msg_emp_id === myId,
                emp_name: empMap[msg.msg_emp_id]
            }));
            setMessages(fetchedMessages);
            setIsLoaded(true);
        })
    }

    useEffect(()=>{
        if(Object.keys(empMap).length > 0) {
            showMessages();
        }
    },[empMap]);


    useEffect(() => {
        if(!isLoaded) return;

        stompClient.onConnect = () => {


            console.log("WebSocket 연결 성공");

            stompClient.subscribe(`/topic/messages/${seq}`, (msg) => {
                const msg_id = JSON.parse(msg.body).msg_id;
                const receivedMessage = JSON.parse(msg.body);
                const isMine = receivedMessage.msg_emp_id === myId;
                const emp_name = empMap[receivedMessage.msg_emp_id];
                setMessages((prev) => [...prev, { ...receivedMessage, isMine, emp_name }]);
            
                showMessages();
            });
        };

        stompClient.activate(); // WebSocket 연결

        return () => {
            stompClient.deactivate(); // 컴포넌트가 사라질 때 연결 해제
        };
    }, [seq,isLoaded,empMap]);

    const sendMessage = () => {
        if (message.trim() !== "") {


            const msgData = {
                msg_content: message,
                msg_group_id: seq,
                msg_emp_id: myId
            }


            stompClient.publish({
                destination: `/app/send/${seq}`,
                body: JSON.stringify(msgData),
            });
            setMessage(""); // 입력 필드 초기화
        }
    };

    const togglePopup = () => {
        if(showPopup){
            setSelected([]);
        }
        setShowPopup(!showPopup);
    }

    useEffect(() => {
        if (showPopup) {
          axios.get("http://10.5.5.6/Employee/SelectEmp")
            .then((resp) => {
              console.log(resp.data);
              const nameList = targetName ? targetName.split(',').map(name => name.trim()) : [];
              if (myInfo?.emp_name) {
                nameList.push(myInfo.emp_name);
            }
              const filtered = resp.data.filter(emp => !nameList.includes(emp.emp_name));
              console.log(filtered);
              setEmployees(filtered);
    
            })
        }
      }, [showPopup])

      const handleCheckbox = (e) =>{
        const id = Number(e.target.value);
        if (e.target.checked) {
          setSelected(prev => [...prev, id]);
        
        } else {
          setSelected(prev => prev.filter(item => item !== id));
         
        }

    }

      const handleInvite = () =>{
        if(selected.length === 0){
          alert("초대할 대상을 선택하세요.")
          return;
        }

       
        
    }



    


    //엔터누르면 전송
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    useEffect(() => {
        // 메시지가 추가될 때 스크롤을 아래로 이동
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className={msgstyle.main}>
            <div className={msgstyle.head}>{targetName ? `${targetName}님과의 채팅` : "채팅방"}</div>
            <div className={msgstyle.content} ref={contentRef}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={msg.isMine ? msgstyle.myMessageWrapper : ""}
                    >
                        <div className={msg.isMine ? msgstyle.myMessage : msgstyle.otherMessage}>
                            {!msg.isMine && <div className={msgstyle.sender || empMap[msg.msg_emp_id]}>{msg.emp_name}</div>}
                            <div>{msg.msg_content}</div>
                            <div className={msgstyle.time}>{dayjs(msg.send_date).format("A hh:mm")}</div>                            
                        </div>
                    </div>
                ))}
            </div>
            <div className={msgstyle.message}>
                <textarea placeholder='메시지 입력' value={message} onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}></textarea>
            </div>
            <div className={msgstyle.service}>
                <button className={msgstyle.add} title="대화상대 초대하기" onClick={togglePopup}>┼</button>
                <button className={msgstyle.send} title="보내기" onClick={sendMessage}>전송</button>
            </div>

            {showPopup && (
                    <div className={msgstyle.popupOverlay}>
                      <div className={msgstyle.popup}>
                        <h3>대화 상대 초대</h3>
                        <p>초대할 상대를 선택하세요</p>
            
                        <div className={msgstyle.checkboxList}>
                          {employees.map(emp => (
                            <label key={emp.emp_code_id} className={msgstyle["checkbox-wrapper"]}>
                              <input
                                type="checkbox"
                                value={emp.emp_code_id}
                                checked={selected.includes(emp.emp_code_id)}
                                onChange={handleCheckbox}
                              />
                              <span className={msgstyle["custom-checkbox"]}></span>
                              <span>{emp.emp_name}</span>
                            </label>
                          ))}
                        </div>
            
                        <div className={msgstyle.buttonGroup}>
                          <button className={msgstyle.inviteButton} onClick={handleInvite}>초대</button> 
                          <button className={msgstyle.closeButton} onClick={togglePopup}>닫기</button>
                        </div>
                      </div>
                    </div>
                  )}
            
          
        </div>
    )


}

export default Chatting; 