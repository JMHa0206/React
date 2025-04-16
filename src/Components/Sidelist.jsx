import React, { useState } from 'react';
import sideliststyle from './Sidelist.module.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import ScheduleList from '../pages/Schedule/ScheduleList';
import ResvSideList from '../pages/Reserve/ResvSideList';

const Sidelist = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const boardPaths = [
    '/board',
    '/write_button',
    '/standard',
    '/reference',
    '/free',
    '/club',
    '/department',
    '/business',
    '/support'
  ];

  const hrPaths =[
    '/attend',
    '/record',
    '/insa',
    '/admin_insa',
    '/deptment',
    '/ApplyForm'
  ];



  const BoardSidelist = () => (
    <div className={sideliststyle.sideList}>
            <aside className={sideliststyle.sidebar}>
            {/* <div><Link to="/mainpage/maincontent/write_button"><button className={sideliststyle.button}>글쓰기</button></Link></div> */}
              <div className={sideliststyle.boardsidebar}>
                <div className={sideliststyle.wholegasy}>게시판 전체보기</div>
                <div><Link to="/mainpage/maincontent/standard">공지사항</Link></div>
                <div><Link to="/mainpage/maincontent/reference">자료실</Link></div>
                <div>전사 게시판
                  <li><Link to="/mainpage/maincontent/free">자유게시판</Link></li>
                  <li><Link to="/mainpage/maincontent/club">동아리게시판</Link></li>
                </div>
                <div>그룹 게시판
                  <li><Link to="/mainpage/maincontent/department">부서 게시판</Link></li>
                  <li><Link to="/mainpage/maincontent/business">거래처별 변경사항</Link></li>
                  <li><Link to="/mainpage/maincontent/support">업체교육/업무지원보고서</Link></li>
                </div>
              </div>
            </aside>
        </div>
  );

  const ApprovalSidelist = () => (
    <div className={sideliststyle.sideList}>
            <aside className={sideliststyle.sidebar}>
      
              <div><Link to="/mainpage/maincontent/approval/write">
                <button className={sideliststyle.button}>결재 작성</button>
              </Link></div>
      
              <div className={sideliststyle.boardsidebar}>
                <div className={sideliststyle.wholegasy}>결재 문서함</div>
                <div><Link to="/mainpage/maincontent/approval/pending">내가 결재할 문서</Link></div>
                <div><Link to="/mainpage/maincontent/approval/requested">내가 상신한 문서</Link></div>
                <div><Link to="/mainpage/maincontent/approval/complete">완료된 문서</Link></div>
                <div><Link to="/mainpage/maincontent/approval/rejected">반려된 문서</Link></div>
              </div>
      
              <div className={sideliststyle.boardsidebar}>
                <div className={sideliststyle.wholegasy}>부서 문서함</div>
                <div><Link to="/mainpage/maincontent/approval/department/referenced">부서 참조 문서</Link></div>
                <div><Link to="/mainpage/maincontent/approval/department/created">부서 생산 문서</Link></div>
              </div>
      
            </aside>
          </div>
  );

  const ScheduleSidelist = () => (
    <div className={sideliststyle.sideList}>
      <div>
        <ScheduleList />
      </div>
    </div>
  );

  const ReserveSidelist = () => (
    <div className={sideliststyle.sideList}>
      <ResvSideList />
    </div>
  );

  const HrSidelist = () => (
    <div className={sideliststyle.sideList}>
      <aside className={sideliststyle.sidebar}>
        <div className={sideliststyle.boardsidebar}>
          <div className={sideliststyle.wholegasy}>인사관리</div>
          <ul>
            <li><Link to="/mainpage/maincontent/insa/attend">개인 근태관리</Link></li>
            <li><Link to="/mainpage/maincontent/insa/record">휴가 / 출장 기록관리</Link></li>
            <li><Link to="/mainpage/maincontent/admin_insa/admin">휴가/</Link></li>
            <li><Link to="/mainpage/maincontent/insa/deptment">부서별 출 / 퇴근 및 근무기록 조회/</Link></li>
            <li><Link to="/mainpage/maincontent/insa/ApplyForm">휴가 / 출장 / 초과근무 등 신청/</Link></li>
          </ul>
        </div>
      </aside>
    </div>
  );
      
     
      if (pathname.includes('/approval')) return <ApprovalSidelist />;
      if (boardPaths.some(path => pathname.includes(path))) return <BoardSidelist />;
      if (pathname.includes('/schedule')) return <ScheduleSidelist />;
      if (pathname.includes('/reserve')) return <ReserveSidelist />;
      if (hrPaths.some(path => pathname.includes(path))) return <HrSidelist />;

      return <div className={sideliststyle.sideList}></div>;
};

   

  
  export default Sidelist;


