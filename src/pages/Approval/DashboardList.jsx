// DashboardList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardList = ({ list, type }) => {
  const navigate = useNavigate();

  // 🛡 리스트가 없거나 비었을 경우
  if (!list || list.length === 0) {
    return <div style={{ padding: '1rem' }}>📭 문서가 없습니다</div>;
  }

  // 🧼 혹시 null item 끼어들었는지 방어
  const safeList = list.filter(Boolean);

  return (
    <table className="dashboard-table">
      <thead>
        <tr>
          <th>제목</th>
          {type === 'waiting' && <th>기안자</th>}
          <th>문서 유형</th>
          <th>결재 상태</th>
          <th>기안일</th>
        </tr>
      </thead>
      <tbody>
        {safeList.map((item, index) => {
          if (!item) return null;

          const title = item.edmsTitle || item.title || '제목 없음';
          const drafter = item.drafterName || item.empName || '-';
          const formType = item.formName || item.documentType || '일반';
          const stateText =
            item.stateCode === 1 ? '대기' :
            item.stateCode === 2 ? '진행 중' :
            item.stateCode === 3 ? '반려' :
            item.stateCode === 4 ? '승인' : '알 수 없음';

          const submitDate = item.submitDate
            ? new Date(item.submitDate).toLocaleDateString()
            : '-';

          const edmsId = item.edmsId || item.id || index;

          return (
            <tr
              key={edmsId}
              onClick={() =>
                navigate(`/mainpage/maincontent/approval/detail/${edmsId}`, {
                  state: { edmsId },
                })
              }
              style={{ cursor: 'pointer' }}
            >
              <td>{title}</td>
              {type === 'waiting' && <td>{drafter}</td>}
              <td>{formType}</td>
              <td>{stateText}</td>
              <td>{submitDate}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default DashboardList;
