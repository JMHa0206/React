import React, { useEffect, useState } from "react";
import daxios from "../../axios/axiosConfig";
import ApprovalDashboard from "./ApprovalDashboard";
import DashboardList from "./DashboardList";
import "./ApprovalMain.css";

const ApprovalMain = () => {
  const [waitingApprovals, setWaitingApprovals] = useState([]);
  const [myDrafts, setMyDrafts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [waitingRes, draftRes] = await Promise.all([
          daxios.get("http://10.5.5.6/api/edms/waiting"),
          daxios.get("http://10.5.5.6/api/edms/mydrafts"),
        ]);

        console.log("✅ 대기 문서 응답:", waitingRes);
        console.log("📦 대기 문서 데이터:", waitingRes.data);

        console.log("✅ 기안 문서 응답:", draftRes);
        console.log("📦 기안 문서 데이터:", draftRes.data);

        if (!Array.isArray(waitingRes.data)) {
          console.warn("❗대기 문서 응답이 배열이 아님:", waitingRes.data);
        }

        if (!Array.isArray(draftRes.data)) {
          console.warn("❗기안 문서 응답이 배열이 아님:", draftRes.data);
        }

        setWaitingApprovals(waitingRes.data || []);
        setMyDrafts(draftRes.data || []);
      } catch (err) {
        console.error("❌ 문서 데이터 불러오기 실패");

        if (err.response) {
          console.error("📛 서버 응답 상태코드:", err.response.status);
          console.error("📛 응답 데이터:", err.response.data);
        } else if (err.request) {
          console.error("📛 요청은 보냈는데 응답이 없어요:", err.request);
        } else {
          console.error("📛 뭔가 이상한 에러입니다:", err.message);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div className="approval-main">
      <h2 className="approval-title">전자결재 대시보드</h2>

      <ApprovalDashboard />

      <div className="approval-section">
        <h3>내가 결재할 문서</h3>
        <DashboardList list={waitingApprovals} type="waiting" />
      </div>

      <div className="approval-section">
        <h3>내가 기안한 문서</h3>
        <DashboardList list={myDrafts} type="drafts" />
      </div>
    </div>
  );
};

export default ApprovalMain;
