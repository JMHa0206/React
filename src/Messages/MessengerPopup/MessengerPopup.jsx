import React, { useRef } from "react";
import { useState, useEffect } from "react";
import style from './popup.module.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import EmployeePage from "../employees/EmployeePage";
import ChattingRoom from "../chattingroom/ChattingRoom";
import Chatting from "../chatting/Chatting";
import GroupChatting from "../groupchatting/GroupChatting";
import axios from 'axios';

function MessengerPopup({ onClose }) {
  const nodeRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const initialChat = params.get("chat");
  const [currentChat, setCurrentChat] = useState(initialChat);

  const [employees, setEmployees] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selected, setSelected] = useState([]);
  const [myInfo, setMyInfo] = useState(null);


  useEffect(() => {
    const userId = sessionStorage.getItem("userId");

    let mine = null;
    
    axios.get("http://10.5.5.2/Employee/SelectMine", {
      params: {
        userId: userId
      }
    }).then((userIdResp) => {
      mine = userIdResp.data;


      if (!mine || !mine.emp_code_id) {
        console.error("내 정보가 잘못되었습니다:", mine);
        return; // 데이터가 잘못되면 여기서 중단
      }

      setMyInfo(mine);
    })
  },[]);


  const openChatWindow = (target, me, name) => {


    axios.get("http://10.5.5.2/Employee/checkRoomExist", {
      params: {
        targetname: target,
        myname: me
      }
    }).then((result) => {

      const exist = result.data;

      if (exist === false) {

        axios.post("http://10.5.5.2/Employee/madeChatRoom", {
          targetname: target,
          myname: me
        }).then((resp) => {
          const seq = resp.data.seq;
          setCurrentChat(name);
          navigate(`/messenger/chatting?chat=${name}&from=${me}&to=${target}&seq=${seq}`);
        });
      } else {
        axios.get("http://10.5.5.2/Employee/checkRoomSeqExist", {
          params: {
            targetId: target,
            myId: me
          }
        }).then((resp) => {
          const seq = resp.data.MSG_GROUP_ID;

          setCurrentChat(name);
          navigate(`/messenger/chatting?chat=${name}&from=${me}&to=${target}&seq=${seq}`, {
            state: { fromPage: location.pathname }
          });
        });
      }


    });
  };



  useEffect(() => {
    if (initialChat) {
      setCurrentChat(initialChat);
    }
  }, [initialChat]);

  useEffect(() => {
    if (location.pathname === "/messenger") {
      setCurrentChat(null);
    }
  }, [location.pathname]);


  const handleClose = () => {
    const fromPage = location.state?.fromPage;

    if (fromPage === "/messenger/chattingroom") {
      navigate("/messenger/chattingroom");
    } else if (fromPage === "/messenger/employee") {
      navigate("/messenger/employee");
    } else if (fromPage === "/messenger/groupchatting") {
      navigate("/messenger/groupchatting");
    } else {
      navigate("/messenger");
    }

    setCurrentChat(null);
  };


  const togglePopup = () => {
    if(showPopup){
      setSelected([]);
    }
    setShowPopup(!showPopup);
  }

  useEffect(() => {
    if (showPopup) {
      axios.get("http://10.5.5.2/Employee/SelectEmp")
        .then((resp) => {
          const filtered = resp.data.filter(emp => emp.emp_code_id !== myInfo.emp_code_id);
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
    if(selected.length === 1){
      alert("2명 이상 초대가 가능합니다.")
      return;
    }



    axios.post("http://10.5.5.2/Employee/madeGroupChat",{
     myId:myInfo.emp_code_id,
     selected: selected
    }).then((resp)=>{
     const seq = resp.data.seq;
     
     const selectedNames = employees
      .filter(emp => selected.includes(emp.emp_code_id))
      .map(emp => emp.emp_name)
      .join(", ");

      setCurrentChat(selectedNames);

      navigate(`/messenger/chatting?chat=${selectedNames}&from=${myInfo.emp_code_id}&seq=${seq}`,{
        state: { fromPage: location.pathname }
      });
      
      setSelected([]);
      setShowPopup(false);


    })

  }

  
  useEffect(()=>{

  },[selected]);


//방의 seq를 확인하는 axios 생성 

  return (

    <div ref={nodeRef} className={style.popupStyle} >
      {currentChat ? (<div className={style.headerStyle} >
        <span>💬 메신저</span>
        <div>
          <button className={style.controlButton} onClick={handleClose} title="이전">〈</button>
        </div>
      </div>) : (<div className={style.headerStyle} >
        <span>💬 메신저</span>
        <button className={style.groupbtn} onClick={togglePopup} title="대화 상대 선택하기" >그룹 채팅</button>
      </div>
      )}
      {currentChat ? (<Chatting userName={currentChat} />) : (
        <div className={style.contentStyle}>
          <div className={style.left}>
            <button className={style.empbtn} title="사원 목록" onClick={() => navigate("/messenger/employee")} translate="no">사원</button>
            <button className={style.chatbtn} title="1:1 채팅방 목록" onClick={() => navigate("/messenger/chattingroom")}>1:1</button>
            <button className={style.groupbtn} title="그룹 채팅방 목록" onClick={() => navigate("/messenger/groupchatting")}>그룹</button>
          </div>
          <div className={style.right}>
            <Routes>
              <Route path="employee" element={<EmployeePage openChat={openChatWindow} />}></Route>
              <Route path="/" element={<EmployeePage openChat={openChatWindow} />}></Route>
              <Route path="chatting" element={<Chatting />}></Route>
              <Route path="chattingroom" element={<ChattingRoom openChat={openChatWindow} />}></Route>
              <Route path="groupchatting" element={<GroupChatting  />}></Route>
            </Routes>
          </div>
        </div>

      )}

      {showPopup && (
        <div className={style.popupOverlay}>
          <div className={style.popup}>
            <h3>대화 상대 초대</h3>
            <p>초대할 상대를 선택하세요</p>

            <div className={style.checkboxList}>
              {employees.map(emp => (
                <label key={emp.emp_code_id} className={style["checkbox-wrapper"]}>
                  <input
                    type="checkbox"
                    value={emp.emp_code_id}
                    checked={selected.includes(emp.emp_code_id)}
                    onChange={handleCheckbox}
                  />
                  <span className={style["custom-checkbox"]}></span>
                  <span>{emp.emp_name}</span>
                </label>
              ))}
            </div>

            <div className={style.buttonGroup}>
              <button className={style.inviteButton} onClick={handleInvite}>초대</button> 
              <button className={style.closeButton} onClick={togglePopup}>닫기</button>
            </div>
          </div>
        </div>
      )}


    </div>

  );
}



export default MessengerPopup;
