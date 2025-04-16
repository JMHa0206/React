import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import daxios from "../../axios/axiosConfig";

const endpointMap = {
  "pending": "waiting",
  "requested": "mydrafts",
  "complete": "completed",
  "rejected": "rejected",
  "department/referenced": "department/ref",
  "department/created": "department/created",
};

const ApprovalListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState(null);

  const fetchList = async () => {
    const fullPath = location.pathname;
    const path = fullPath.replace("/mainpage/maincontent/approval/", "");
    const apiSuffix = endpointMap[path];

    console.log("🔥 현재 경로:", fullPath);
    console.log("🌲 파싱된 path:", path);
    console.log("🧭 매핑된 API suffix:", apiSuffix);

    if (!apiSuffix) {
      console.warn("❌ 알 수 없는 경로로 요청됨:", path);
      setError("잘못된 경로입니다.");
      return;
    }

    try {
      console.log(`📡 API 요청 시작 → /api/edms/${apiSuffix}`);
      const res = await daxios.get(`http://221.150.27.169:8888/api/edms/${apiSuffix}`);
      console.log("✅ API 응답 수신:", res.data);
      const res = await daxios.get(`http://10.5.5.6/api/edms/${apiSuffix}`);
      setDocs(res.data);
      setError(null);
    } catch (err) {
      console.error(`❌ API 요청 실패 (${apiSuffix})`, err);
      setError("문서 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchList();
  }, [location.pathname]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📄 문서 목록</h2>
      <p style={{ color: "orange" }}>🔥 컴포넌트 렌더링 정상 작동 중</p>

      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      {docs.length === 0 && !error ? (
        <p>문서가 없습니다.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>제목</th>
              <th>기안자</th>
              <th>문서 유형</th>
              <th>결재 상태</th>
              <th>기안일</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr
                key={doc.edmsId}
                onClick={() => navigate(`/mainpage/maincontent/approval/detail/${doc.edmsId}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{doc.edmsTitle}</td>
                <td>{doc.drafterName || "-"}</td>
                <td>{doc.formName || "-"}</td>
                <td>
                  {{
                    1: "대기",
                    2: "진행 중",
                    3: "반려",
                    4: "완료",
                  }[doc.stateCode] || "알 수 없음"}
                </td>
                <td>{doc.submitDate ? new Date(doc.submitDate).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApprovalListPage;
