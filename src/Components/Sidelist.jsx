import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import sideliststyle from './Sidelist.module.css';
import ScheduleList from '../pages/Schedule/ScheduleList';
import ResvSideList from '../pages/Reserve/ResvSideList';
import daxios from '../axios/axiosConfig';

const Sidelist = ({ onRefresh }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const [isAllowedDept, setIsAllowedDept] = useState(false);

  useEffect(() => {
    // ✅ 로그인한 유저 정보 가져오기 (부서 포함)
    daxios.get("http://10.5.5.6/mypage/info")
      .then(res => {
        const dept = res.data.departDTO;
        if (!dept) return;

        const deptId = dept.dept_id;
        const deptName = dept.dept_name;

        // ✅ 총무부(806) 또는 인사부(807)인지 확인
        const allowed = deptId === 806 || deptId === 807 || deptName === '총무부' || deptName === '인사부';
        setIsAllowedDept(allowed);
      })
      .catch(err => {
        console.error("부서 정보 조회 실패:", err);
      });
  }, []);

  const isPath = (segment) => pathname.startsWith(`/mainpage/maincontent/${segment}`);

  const BoardSidelist = () => (
    <div className={sideliststyle.sideList}>
      <aside className={sideliststyle.sidebar}>
        <div className={sideliststyle.boardsidebar}>
          <div className={sideliststyle.wholegasy}>게시판 전체보기</div>
          <div><Link to="/mainpage/maincontent/board/standard">공지사항</Link></div>
          <div><Link to="/mainpage/maincontent/board/reference">자료실</Link></div>
          <div>전사 게시판
            <li><Link to="/mainpage/maincontent/board/free">자유게시판</Link></li>
            <li><Link to="/mainpage/maincontent/board/club">동아리게시판</Link></li>
          </div>
          <div>그룹 게시판
            <li><Link to="/mainpage/maincontent/board/department">부서 게시판</Link></li>
            <li><Link to="/mainpage/maincontent/board/business">거래처별 변경사항</Link></li>
            <li><Link to="/mainpage/maincontent/board/support">업체교육/업무지원보고서</Link></li>
          </div>
        </div>
      </aside>
    </div>
  );

  const ApprovalSidelist = () => (
    <div className={sideliststyle.sideList}>
      <aside className={sideliststyle.sidebar}>
        <div>
          <Link to="/mainpage/maincontent/approval/write">
            <button className={sideliststyle.button}>결재 작성</button>
          </Link>
        </div>

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
      <ScheduleList onRefresh={onRefresh} />
    </div>
  );

  const ReserveSidelist = () => (
    <div className={sideliststyle.sideList}>
      <ResvSideList onRefresh={onRefresh} />
    </div>
  );

  const HrSidelist = () => (
    <div className={sideliststyle.sideList}>
      <aside className={sideliststyle.sidebar}>
        <div className={sideliststyle.boardsidebar}>
          <div className={sideliststyle.wholegasy}>인사관리</div>
          <ul>
            <li><Link to="/mainpage/maincontent/insa/attend">개인 근태관리</Link></li>
            <li><Link to="/mainpage/maincontent/insa/ApplyForm">휴가 / 출장 / 초과근무 등 신청</Link></li>

            {/* 👇 조건부 노출: 총무부 또는 인사부만 */}
            {isAllowedDept && (
              <>
                <li><Link to="/mainpage/maincontent/insa/record">휴가 / 출장 기록관리</Link></li>
                <li><Link to="/mainpage/maincontent/insa/deptment">부서별 출 / 퇴근 및 근무기록 조회</Link></li>
              </>
            )}
          </ul>
        </div>
      </aside>
    </div>
  );

  // 🔍 경로별 사이드바 렌더링
  if (isPath("approval")) return <ApprovalSidelist />;
  if (isPath("board")) return <BoardSidelist />;
  if (isPath("schedule")) return <ScheduleSidelist />;
  if (isPath("reserve")) return <ReserveSidelist />;
  if (isPath("insa") || isPath("admin_insa")) return <HrSidelist />;

  return <div className={sideliststyle.sideList}></div>;
};

export default Sidelist;
