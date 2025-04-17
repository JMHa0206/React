import React, { useState, useRef, useEffect } from 'react';
import './Header.css';
import useAuthStore from '../store/useAuthStore';
import { Link, Route, useNavigate } from 'react-router-dom';
import useScheduleStore from '../store/useScheduleStore';
import axios from 'axios';
import MessengerPopupContainer from "../Messages/MessengerPopupContainer";
import useProfileStore from '../store/useProfileStore';

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  // const {userId} = useAuthStore.getState();
  const { setEvents } = useScheduleStore();
  // const [profileImg, setProfileImg] = useState(null);
  const [chatWindow, setChatWindow] = useState(null);
  const [isPopup, setIsPopup] = useState(false);
  const profileImagePath = useProfileStore(state => state.profileImagePath);
  const setProfileImagePath = useProfileStore(state => state.setProfileImagePath); 

  const logout = useAuthStore((state) => state.logout);
  const navi = useNavigate();

  useEffect(() => {
    setIsPopup(window.opener != null);
  }, []);

  useEffect(()=>{
    const userId = sessionStorage.getItem("userId");

     axios.get(`http://10.5.5.6/Employee/SelectMine`,{
      params:{userId:userId}
     })
     .then((resp) => {
        const id = resp.data.emp_code_id;

         return axios.get(`http://10.5.5.6/Employee/ProfileImg`,{
          params: { empId: id }
         });
          }).then((imgResp)=>{
            const fullPath = `http://10.5.5.6${imgResp.data}?t=${Date.now()}`;
            // setProfileImg(fullPath)
            setProfileImagePath(fullPath);  
          })
    
  },[])


  // Close dropdown when clicking outside

  console.log("🔥 Header에서 보는 프로필 이미지 경로:", profileImagePath);
  useEffect(() => {


    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isPopup) {
    return  <MessengerPopupContainer />;
  
  }

  // Toggle user menu dropdown
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };



  const openMessenger = () => {
    if (chatWindow && !chatWindow.closed) {
        chatWindow.focus();
        return;
    }

    const url = `${window.location.origin}/messenger`;
    const newWindow = window.open(url, "MessengerPopup", "width=420,height=620");
    setChatWindow(newWindow);

  };

  

 

  return (
    <header className="header">
      <div className="logo">🌐 GroupWare</div>
      <div className="header-buttons">
        <button><i className="fa-regular fa-bell"></i></button>
        <button><i className="fa-regular fa-comment" onClick={openMessenger}></i></button>
        <div className="user-menu-container" ref={userMenuRef}>
          <button className="user-icon-button" onClick={toggleUserMenu}>
            <img src={profileImagePath || "/Default2.png"}  style={{width:'22px',height:'22px', borderRadius:'50%',objectFit:'cover'}} alt="프로필" />
          </button>
          {showUserMenu && (
            <div className="user-dropdown">
              <ul>
               <Link to= "/mainpage/maincontent/mypage"> <li><i className="fa-solid fa-user"></i> 마이페이지</li></Link>
               {/* <Link to="/home/header/test"> <li><i className="fa-solid fa-vial"></i> 테스트 페이지</li></Link>
               <Link to="/home/header/setting"> <li><i className="fa-solid fa-gear"></i> 설정</li></Link>  */}
                <li onClick={() => { logout(); navi("/"); setEvents([]);}}>
                  <i className="fa-solid fa-right-from-bracket"></i> 로그아웃
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;