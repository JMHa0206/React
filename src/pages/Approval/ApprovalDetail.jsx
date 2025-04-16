// ✅ ApprovalDetail.jsx 수정 버전

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import daxios from '../../axios/axiosConfig';

const ApprovalDetail = () => {
  const { id } = useParams();
  const [edms, setEdms] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await daxios.get("http://10.5.5.6/api/employee/code");
        setCurrentUserId(userRes.data);

        const edmsRes = await daxios.get(`http://10.5.5.6/api/edms/${id}`);
        setEdms(edmsRes.data);

        if (edmsRes.data) {
          const historyRes = await daxios.get(`http://10.5.5.6/api/edms/${id}/history`);
          setHistoryList(historyRes.data);
        }
      } catch (err) {
        console.error("❌ 데이터 로딩 실패:", err);
      }
    };

    fetchData();
  }, [id]);

  if (!edms) return <div style={{ padding: "2rem" }}>불러오는 중...</div>;

  const approverLevels = [
    { code: edms.level1, level: 1 },
    { code: edms.level2, level: 2 },
    { code: edms.level3, level: 3 },
    { code: edms.level4, level: 4 },
    { code: edms.finalLevel, level: 5 }
  ].filter(item => item.code !== null);

  const getCurrentLevel = () => {
    const found = approverLevels.find(item => item.code === currentUserId);
    return found ? found.level : -1;
  };

  const hasAllPriorApprovals = (myLevel) => {
    return approverLevels
      .filter(a => a.level < myLevel)
      .every(a => historyList.some(h => h.stepLevel === a.level && h.action === "APPROVED"));
  };

  const alreadyApproved = historyList.some(h => h.approverId === currentUserId);
  const isFinal = edms.finalLevel === currentUserId;
  const myLevel = getCurrentLevel();
  const canFinalApprove = isFinal ? hasAllPriorApprovals(myLevel) : true;
  const canApprove = myLevel > 0 && !alreadyApproved && canFinalApprove && edms.stateCode !== 3 && edms.stateCode !== 4;

  const handleApprove = async () => {
    try {
      await daxios.post(`http://10.5.5.6/api/edms/${id}/approve`);
      alert("결재 완료");
      window.location.reload();
    } catch (err) {
      console.error("🚫 결재 실패:", err);
      alert("결재 실패");
    }
  };

  const handleReject = async () => {
    try {
      await daxios.post(`http://221.150.27.169:8888/api/edms/${id}/reject`, rejectReason, {

        headers: { "Content-Type": "text/plain" },
      });
      alert("반려 완료");
      window.location.reload();
    } catch (err) {
      console.error("🚫 반려 실패:", err);
      alert("반려 실패");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📋 문서 상세 정보</h2>
      <p><strong>제목:</strong> {edms.edmsTitle}</p>
      <p><strong>작성자:</strong> {edms.drafterName}</p>
      <p><strong>상태:</strong> {edms.stateCode === 1 ? "대기" : edms.stateCode === 2 ? "진행" : edms.stateCode === 3 ? "반려" : "완료"}</p>
      <p><strong>작성일:</strong> {new Date(edms.submitDate).toLocaleString()}</p>
      <div dangerouslySetInnerHTML={{ __html: edms.edmsContent }} />

      {canApprove && (
        <div style={{ marginTop: "2rem" }}>
          <button style={{ marginRight: "1rem" }} onClick={handleApprove}>결재</button>
          <input
            type="text"
            placeholder="반려 사유 입력"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            style={{ marginRight: "0.5rem" }}
          />
          <button onClick={handleReject}>반려</button>
        </div>
      )}

      <hr />
      <h3>📜 결재 이력</h3>
      {historyList.length === 0 ? (
        <p>이력이 없습니다.</p>
      ) : (
        <ul>
          {historyList.map((h, idx) => (
            <li key={idx}>
              [{h.stepLevel}단계] {h.approverName || h.approverId} - {h.action} ({new Date(h.actionDate).toLocaleString()})
              {h.reason && ` - 사유: ${h.reason}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApprovalDetail;
