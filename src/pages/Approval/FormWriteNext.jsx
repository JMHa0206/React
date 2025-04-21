// FormWriteNext.jsx (통합 + 수정 버전)
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import daxios from "../../axios/axiosConfig";
import { Editor } from "@tinymce/tinymce-react";
import ApproverModal from "./ApproverModal";
// import RefDeptModal from "./RefDeptModal";
// import RecvDeptModal from "./RecvDeptModal";

const applyTemplateData = (template, data) => {
  const DYNAMIC_KEYS = [
    "level1.approval?",
    "level2.approval?",
    "level3.approval?",
    "level4.approval?",
    "finalLevel.approval?",
  ];
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    if (DYNAMIC_KEYS.includes(key)) return;
    const safeKey = key.replace(/\./g, "\\.");
    const regex = new RegExp(`{{\\s*${safeKey}\\s*}}`, "g");
    result = result.replace(regex, value || "");
  });
  return result;
};

const FormWriteNext = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({ empCodeId: null, empName: "" });
  const [formData, setFormData] = useState({
    formId: "",
    edmsCId: "",
    comId: "",
    stateCode: 1,
    edmsTitle: "",
    edmsContent: "",
    rejectReason: null,
    level1: null,
    level2: null,
    level3: null,
    level4: null,
    finalLevel: null,
    시작일: "",
    종료일: "",
    제목: "",
    연차사유: "",
  });

  const [templateHtml, setTemplateHtml] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTemplateApplied, setIsTemplateApplied] = useState(false);
  const [isEditorDisabled, setIsEditorDisabled] = useState(true);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [isRecvModalOpen, setIsRecvModalOpen] = useState(false);
  const [refDeptList, setRefDeptList] = useState([]);
  const [recvDeptList, setRecvDeptList] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, edmsContent: content }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const formDataUpload = new FormData();
    files.forEach((file) => formDataUpload.append("files", file));

    try {
      const res = await daxios.post("http://10.10.55.22/api/files/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedFiles((prev) => [...prev, ...res.data]);
    } catch (err) {
      console.error("❌ 파일 업로드 실패:", err);
      alert("파일 업로드 실패");
    }
  };

  const isReadyForTemplate = () => {
    if (!formData.제목.trim() || !formData.finalLevel) return false;
    const includesStartEnd =
      templateHtml.includes("{{시작일}}") || templateHtml.includes("{{종료일}}")
    const includesReason = templateHtml.includes("{{사유}}")
    if (includesStartEnd && (!formData.시작일 || !formData.종료일)) return false;
    if (includesReason && !formData.연차사유.trim()) return false;
    return true;
  };

  const handleApplyTemplate = () => {
    if (!window.confirm("⚠ 템플릿을 적용하면 현재 작성된 세부내용이 사라집니다. 계속할까요?")) return;
    sessionStorage.setItem("temp_edmsContent", formData.edmsContent);

    const replaced = applyTemplateData(templateHtml, {
      제목: formData.제목,
      시작일: formData.시작일,
      종료일: formData.종료일,
      사유: formData.연차사유,
      신청자: userInfo.empName,
      수신부서: recvDeptList.map((d) => d.deptName).join(", "),
      참조부서: refDeptList.map((d) => d.deptName).join(", "),
      "level1.name": formData.level1?.empName || "",
      "level2.name": formData.level2?.empName || "",
      "level3.name": formData.level3?.empName || "",
      "level4.name": formData.level4?.empName || "",
      "finalLevel.name": formData.finalLevel?.empName || "",
      "level1.position": formData.level1?.jobName || "",
      "level2.position": formData.level2?.jobName || "",
      "level3.position": formData.level3?.jobName || "",
      "level4.position": formData.level4?.jobName || "",
      "finalLevel.position": formData.finalLevel?.jobName || "",
    });
    setFormData((prev) => ({ ...prev, edmsContent: DOMPurify.sanitize(replaced) }));
    setIsTemplateApplied(true);
    setIsEditorVisible(true);
    setIsEditorDisabled(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!isTemplateApplied) {
      alert("⚠ 템플릿을 먼저 적용해주세요.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.finalLevel?.emp_code_id) {
      alert("❌ 최종결재자를 반드시 선택해야 합니다.");
      setIsSubmitting(false);
      return;
    }

    try {
      const attachments = uploadedFiles.map((f) => f.edmsSysName || f);
      const payload = {
        ...formData,
        attachments,
        formId: Number(formData.formId),
        edmsCId: Number(formData.edmsCId),
        comId: Number(formData.comId),
        stateCode: Number(formData.stateCode),
        refDeptList: refDeptList.map((d) => d.deptId),
        recvDeptList: recvDeptList.map((d) => d.deptId),
        level1: formData.level1?.emp_code_id || null,
        level2: formData.level2?.emp_code_id || null,
        level3: formData.level3?.emp_code_id || null,
        level4: formData.level4?.emp_code_id || null,
        finalLevel: formData.finalLevel?.emp_code_id || null,
        edmsTitle: formData.제목 || "제목 없음",
        edmsContent: formData.edmsContent,
        startDate: formData.시작일 || null,
        endDate: formData.종료일 || null,
      };
      await daxios.post("http://10.5.5.6/api/edms/register", payload);
      sessionStorage.removeItem("temp_edmsContent");
      alert("✅ 제출 완료");
      navigate("/mainpage/maincontent/approval/requested", { state: { refresh: true } });
    } catch (err) {
      console.error("❌ 제출 실패", err);
      alert("❌ 제출 실패: 콘솔 확인");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!state?.formId) return;
      try {
        const codeRes = await daxios.get("http://10.5.5.6/api/employee/code");
        const code = codeRes.data;
        const userRes = await daxios.get(`http://10.5.5.6/api/employee/${code}`);
        const templateRes = await daxios.get(`http://10.5.5.6/api/forms/${state.formId}`);
        setUserInfo(userRes.data);
        setTemplateHtml(templateRes.data.formContent);
        setFormData((prev) => ({
          ...prev,
          formId: state.formId,
          edmsCId: state.edmsCId || "",
          comId: code,
        }));
      } catch (err) {
        console.error("❌ 초기화 실패:", err);
      }
    };
    loadData();
  }, [state]);

  const isVacationOrBusiness = () =>
    templateHtml.includes("{{시작일}}") ||
    templateHtml.includes("{{종료일}}") ||
    templateHtml.includes("{{사유}}")

  return (
    <div style={{ padding: "2rem" }}>
      <h2>전자결재 작성</h2>
      <label>제목</label>
      <input name="제목" value={formData.제목} onChange={handleInputChange} required />

      {isVacationOrBusiness() && (
        <>
          <label>연차 유형</label>
          <select name="연차사유" value={formData.연차사유} onChange={handleInputChange}>
            <option value="">-- 선택하세요 --</option>
            <option value="개인연차">개인연차</option>
            <option value="병가">병가</option>
            <option value="기타">기타</option>
          </select>
          <label>시작일</label>
          <input type="date" name="시작일" value={formData.시작일} onChange={handleInputChange} />
          <label>종료일</label>
          <input type="date" name="종료일" value={formData.종료일} onChange={handleInputChange} />
        </>
      )}

      <label>첨부파일</label>
      <input type="file" multiple onChange={(e) => handleFileUpload(e)} />
      <ul>{uploadedFiles.map((f, i) => <li key={i}>{f.edmsOriName || f}</li>)}</ul>

      {isEditorVisible ? (
        <>
          <label>본문 작성</label>
          <Editor
            apiKey="hxn7uw6e8li0hmpqrhwhgm2sr6jrapxrnjhu8g4bvl8cm8fg"
            value={formData.edmsContent}
            onEditorChange={handleEditorChange}
            init={{
              height: 400,
              menubar: true,
              plugins: "lists link image table code preview",
              toolbar:
                "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | code preview",
              readonly: isEditorDisabled ? 1 : 0,
            }}
          />
        </>
      ) : (
        <div style={{ background: "#eee", padding: "1rem", marginTop: "1rem" }}>
          ✍️ 템플릿을 먼저 적용해주세요.
        </div>
      )}

      <div style={{ margin: "1rem 0" }}>
        <button onClick={handleApplyTemplate} disabled={!isReadyForTemplate()}>
          📌 템플릿 적용
        </button>
      </div>

      {/* <div>
        <label>참조 부서</label>
        <button type="button" onClick={() => {
          console.log("👉 참조부서 모달 버튼 클릭됨");
          setIsRefModalOpen(true);
        }}>부서 선택</button>
        <RefDeptModal
          isOpen={isRefModalOpen}
          selected={refDeptList.map(d => d.dept_id)}
          onClose={() => setIsRefModalOpen(false)}
          onSelect={(selectedIds) => {
            daxios.get("http://10.5.5.6/emp/selectAllDepts").then(res => {
              const all = res.data;
              console.log("📥 모든 부서:", all);
              const selected = all.filter(d => selectedIds.includes(d.dept_id));
              console.log("✅ 선택된 참조부서:", selected);
              setRefDeptList(selected);
            });
          }}
        />
      </div> */}

      {/* <div>
        <label>수신 부서</label>
        <button type="button" onClick={() => {
          console.log("👉 수신부서 모달 버튼 클릭됨");
          setIsRecvModalOpen(true);
        }}>부서 선택</button>
        <RecvDeptModal
          isOpen={isRecvModalOpen}
          selected={recvDeptList.map(d => d.dept_id)}
          onClose={() => setIsRecvModalOpen(false)}
          onSelect={(selected) => {
            console.log("✅ 선택된 수신부서:", selected);
            setRecvDeptList(selected);
          }}
        />
      </div> */}

      <button type="button" onClick={() => setIsModalOpen(true)}>결재자 선택</button>
      <ApproverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(approvers) => {
          const selected = Object.values(approvers).filter(Boolean).map((e) => e.emp_code_id);
          if (new Set(selected).size !== selected.length) {
            alert("❌ 동일한 결재자를 중복 지정할 수 없습니다.");
            return;
          }
          setFormData((prev) => ({
            ...prev,
            level1: approvers.level1,
            level2: approvers.level2,
            level3: approvers.level3,
            level4: approvers.level4,
            finalLevel: approvers.finalLevel,
          }));
        }}
      />

      <button onClick={handleSubmit} disabled={isSubmitting} style={{ marginTop: "1rem" }}>
        {isSubmitting ? "제출 중..." : "제출"}
      </button>
    </div>
  );
};

export default FormWriteNext;
