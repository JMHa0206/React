
// ✅ MainContent.jsx
import React from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import ApprovalMain from '../Approval/ApprovalMain';
import ApprovalDetail from '../Approval/ApprovalDetail';
import FormWrite from '../Approval/ApprovalWrite';
import FormWriteNext from '../Approval/FormWriteNext';
import ScheduleMain from '../Schedule/ScheduleMain';
import Boardlist from '../Boardlist/Board_standard';
import Board_reference from '../Boardlist/Board_refernece';
import Board_free from '../Boardlist/Board_free';
import Board_club from '../Boardlist/Board_club';
import Board_department from '../Boardlist/Board_department';
import Board_business from '../Boardlist/Board_business';
import Board_support from '../Boardlist/Board_support';
import Mypage from '../Mypage/Mypage';
import Board_write_button from '../Boardlist/Board_write_button';
import Board_titlelink from '../Boardlist/Board_titlelink';
import ReserveMain from '../Reserve/ReserveMain';
import Sidelist from '../../Components/Sidelist';
import style from './MainContent.module.css';
import InsaPage from '../insa/insapage';
import Annaul from '../insa/Annaul';


const MainContent = () => {
const location = useLocation();
const hideSidelistPaths = ['/mainpage/maincontent/mypage']; // 더 숨기고 싶은 페이지가 있다면 배열에 추가
const isSidelistVisible = !hideSidelistPaths.includes(location.pathname);



  return (
    <div className={style.maincontainer}>
      <div className={style.mainSidebar}>
      {/* <button className={style.toggleBtn} onClick={toggleSidelist}>{isSidelistOpen ? '◀' : '▶'}</button> */}
        <div className={style.icons}><Link to="/mainpage"><i className="fa-solid fa-2x fa-house"  style={{ color: "#ecf0f1" }}/></Link></div>
        <div className={style.icons}><Link to={{ pathname: "/mainpage/maincontent/approval"}}><i className="fa-solid fa-2x fa-inbox"  style={{ color: "#ecf0f1" }}/></Link></div>
        <div className={style.icons}><Link to={{ pathname: "/mainpage/maincontent/insa"}}><i className="fa-solid fa-2x fa-user" style={{ color: "#ecf0f1" }}/></Link></div>
        <div className={style.icons}><Link to={{ pathname: "/mainpage/maincontent/board"}}><i className="fa-solid fa-2x fa-clipboard" style={{ color: "#ecf0f1" }} /></Link></div>
        <div className={style.icons}><Link to={{ pathname: "/mainpage/maincontent/schedule"}}><i className="fa-solid fa-2x fa-calendar" style={{ color: "#ecf0f1" }}/></Link></div>
        <div className={style.icons}><Link to={{ pathname: "/mainpage/maincontent/reserve"}}><i className="fa-solid fa-2x fa-clock"  style={{ color: "#ecf0f1" }}/></Link></div>
      </div>
      
      
      {isSidelistVisible && <Sidelist />}
      

      <div className={style.mainContents}>
        <Routes>
          <Route path='approval' element={<ApprovalMain />} />
          <Route path='approval/detail/:id' element={<ApprovalDetail />} />
          <Route path='approval/write' element={<FormWrite />} />
          <Route path='approval/write/next' element={<FormWriteNext />} />

          <Route path='insa' element={<InsaPage />} />
          <Route path='insa/attend' element={<InsaPage/>}></Route>
          <Route path='insa/record' element={<Annaul/>}></Route>
          
          <Route path='board/:boardId' element={<Board_business />} />
          <Route path='titlelink/:boardId' element={<Board_titlelink />} />
          <Route path='write_button' element={<Board_write_button />} />
          <Route path='standard' element={<Boardlist />} />
          <Route path='reference' element={<Board_reference />} />
          <Route path='free' element={<Board_free />} />
          <Route path='club' element={<Board_club />} />
          <Route path='department' element={<Board_department />} />
          <Route path='business' element={<Board_business />} />
          <Route path='support' element={<Board_support />} />
         

          
          <Route path='schedule' element={<ScheduleMain />} />
          <Route path='reserve/*' element={<ReserveMain />} />
          <Route path='msg' element={<ApprovalMain />} />
          <Route path='mypage' element={<Mypage />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainContent;
