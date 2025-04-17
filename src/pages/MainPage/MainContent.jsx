// ✅ 최신 MainContent.jsx (결재 리스트 라우트 포함)

import React, { useState } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import ApprovalMain from '../Approval/ApprovalMain';
import ApprovalDetail from '../Approval/ApprovalDetail';
import FormWrite from '../Approval/ApprovalWrite';
import FormWriteNext from '../Approval/FormWriteNext';
import ApprovalListPage from '../Approval/ApprovalListPage'; // ✅ 리스트 페이지 import
import ScheduleMain from '../Schedule/ScheduleMain';
import Boardlist from '../Boardlist/Board_standard';
import Board_reference from '../Boardlist/Board_refernece';
import Board_free from '../Boardlist/Board_free';
import Board_club from '../Boardlist/Board_club';
import Board_department from '../Boardlist/Board_department';
import Board_business from '../Boardlist/Board_business';
import Board_support from '../Boardlist/Board_support';
import Board_write_button from '../Boardlist/Board_write_button';
import Board_titlelink from '../Boardlist/Board_titlelink';
import Mypage from '../Mypage/Mypage';
import ReserveMain from '../Reserve/ReserveMain';
import Sidelist from '../../Components/Sidelist';
import style from './MainContent.module.css';
import InsaPage from '../insa/insapage';
import Annaul from '../insa/Annaul';
import Deptment from '../insa/Deptment';
import ApplyForm from '../insa/ApplyForm ';

const MainContent = () => {
  const location = useLocation();
  const hideSidelistPaths = ['/mainpage/maincontent/mypage'];
  const isSidelistVisible = !hideSidelistPaths.includes(location.pathname);
  const [reloadKey, setReloadKey] = useState(0);
  const handleGlobalRefresh = () => {
    setReloadKey(prev => prev + 1);
  };

  return (
    <div className={style.maincontainer}>
      <div className={style.mainSidebar}>
        <div className={style.icons}><Link to="/mainpage"><i className="fa-solid fa-2x fa-house" style={{ color: "#ecf0f1" }} /></Link></div>
        <div className={style.icons}><Link to="/mainpage/maincontent/approval"><i className="fa-solid fa-2x fa-inbox" style={{ color: "#ecf0f1" }} /></Link></div>
        <div className={style.icons}><Link to="/mainpage/maincontent/insa"><i className="fa-solid fa-2x fa-user" style={{ color: "#ecf0f1" }} /></Link></div>
        <div className={style.icons}><Link to="/mainpage/maincontent/board"><i className="fa-solid fa-2x fa-clipboard" style={{ color: "#ecf0f1" }} /></Link></div>
        <div className={style.icons}><Link to="/mainpage/maincontent/schedule"><i className="fa-solid fa-2x fa-calendar" style={{ color: "#ecf0f1" }} /></Link></div>
        <div className={style.icons}><Link to="/mainpage/maincontent/reserve"><i className="fa-solid fa-2x fa-clock" style={{ color: "#ecf0f1" }} /></Link></div>
      </div>

      {isSidelistVisible && <Sidelist onRefresh={handleGlobalRefresh}  />}

      <div className={style.mainContents}>
        <Routes>
          {/* ✅ 결재 라우트 */}
          <Route path='approval' element={<ApprovalMain />} />
          <Route path='approval/write' element={<FormWrite />} />
          <Route path='approval/write/next' element={<FormWriteNext />} />
          <Route path='approval/detail/:id' element={<ApprovalDetail />} />
          <Route path='approval/requested' element={<ApprovalListPage />} />
          <Route path='approval/pending' element={<ApprovalListPage />} />
          <Route path='approval/complete' element={<ApprovalListPage />} />
          <Route path='approval/rejected' element={<ApprovalListPage />} />
          <Route path='approval/department/referenced' element={<ApprovalListPage />} />
          <Route path='approval/department/created' element={<ApprovalListPage />} />

          {/* 인사 */}
          <Route path='insa' element={<InsaPage />} />

          <Route path='insa/attend' element={<InsaPage/>}></Route>
          <Route path='insa/record' element={<Annaul/>}></Route>
          <Route path='insa/deptment' element={<Deptment/>}></Route>
          <Route path='insa/ApplyForm' element={<ApplyForm/>}></Route>


          {/* 게시판 */}
          <Route path='board/' element={<Boardlist/>} />
          <Route path='board/titlelink/:boardId' element={<Board_titlelink />} />
          <Route path='board/write_button' element={<Board_write_button />} />
          <Route path='board/standard' element={<Boardlist />} />
          <Route path='board/reference' element={<Board_reference />} />
          <Route path='board/free' element={<Board_free />} />
          <Route path='board/club' element={<Board_club />} />
          <Route path='board/department' element={<Board_department />} />
          <Route path='board/business' element={<Board_business />} />
          <Route path='board/support' element={<Board_support />} />

          {/* 스케줄 & 예약 */}
          <Route path='schedule' element={<ScheduleMain reloadKey={reloadKey} onRefresh={handleGlobalRefresh}  />} />
          <Route path='reserve/*' element={<ReserveMain  reloadKey={reloadKey} onRefresh={handleGlobalRefresh}  />} />

          {/* 마이페이지 */}
          <Route path='mypage' element={<Mypage />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainContent;
