// FormWriteNext.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import daxios from "../../axios/axiosConfig";
import { Editor } from "@tinymce/tinymce-react";
import ApproverModal from "./ApproverModal";
import RefDeptModal from "./RefDeptModal";

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
    const regex = new RegExp(`{{\s*${safeKey}\s*}}`, "g");
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
  const [refDeptIds, setRefDeptIds] = useState([]);

  const isReadyForTemplate = () => {
    if (!formData.제목.trim() || !formData.finalLevel) return false;

    const includesStartEnd = templateHtml.includes("{{시작일}}") || templateHtml.includes("{{종료일}}");
    const includesReason = templateHtml.includes("{{사유}}");

    if (includesStartEnd && (!formData.시작일 || !formData.종료일)) return false;
    if (includesReason && !formData.연차사유.trim()) return false;

    return true;
  };;

  useEffect(() => {
    const loadData = async () => {
      if (!state?.formId) return;
      try {
        const codeRes = await daxios.get("http://221.150.27.169:8888/api/employee/code");
        const code = codeRes.data;
        const userRes = await daxios.get(`http://221.150.27.169:8888/api/employee/${code}`);

        setUserInfo(userRes.data);
        setFormData((prev) => ({ ...prev, ...state, comId: code }));

        const res = await daxios.get(`http://221.150.27.169:8888/api/forms/${state.formId}`);
        const template = res.data.formContent;
        setTemplateHtml(template);

        const updatedContent = applyTemplateData(template, {
          제목: "",
          시작일: "",
          종료일: "",
          사유: "",
          신청자: userRes.data.empName,
        });
        setFormData((prev) => ({ ...prev, edmsContent: updatedContent }));
      } catch (err) {
        console.error("❌ Form 초기화 실패", err);
      }
    };
    loadData();
  }, [state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, edmsContent: content }));
  };

  const handleApplyTemplate = () => {
    const confirmApply = window.confirm("⚠ 템플릿을 적용하면 현재 작성된 세부내용이 사라집니다. 계속할까요?");
    if (!confirmApply) return;

    sessionStorage.setItem("temp_edmsContent", formData.edmsContent);
    console.log("📦 템플릿 적용 전 세부내용 백업:", formData.edmsContent);

    const replaced = applyTemplateData(templateHtml, {
      제목: formData.제목,
      시작일: formData.시작일,
      종료일: formData.종료일,
      사유: formData.연차사유,
      신청자: userInfo.empName,
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

    const sanitized = DOMPurify.sanitize(replaced);
    setFormData((prev) => ({ ...prev, edmsContent: sanitized }));
    setIsTemplateApplied(true);
    setIsEditorVisible(true);
    setIsEditorDisabled(false);
  };

  const handleRestoreContent = () => {
    const saved = sessionStorage.getItem("temp_edmsContent");
    console.log("📥 복원할 세부내용:", saved);
    if (saved) {
      const restore = window.confirm("🧠 이전 작성 내용을 복원하시겠습니까?");
      if (restore) {
        setFormData((prev) => ({ ...prev, edmsContent: saved }));
      }
    } else {
      alert("🔍 복원 가능한 내용이 없습니다.");
    }
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

    const confirm = window.confirm("📄 본문 내용을 모두 확인하셨습니까?");
    if (!confirm) {
      setIsSubmitting(false);
      return;
    }

    if (!formData.finalLevel?.emp_code_id) {
      alert("❌ 최종결재자를 반드시 선택해야 합니다.");
      setIsSubmitting(false);
      return;
    }

    if (formData.시작일 && formData.종료일 && formData.시작일 > formData.종료일) {
      alert("❌ 종료일은 시작일보다 빠를 수 없습니다.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        formId: Number(formData.formId),
        edmsCId: Number(formData.edmsCId),
        comId: Number(formData.comId),
        stateCode: Number(formData.stateCode),
        refDept: refDeptIds.join(","),
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

      console.log("📤 제출할 formData:", JSON.stringify(payload, null, 2));
      await daxios.post("http://10.10.55.22/api/edms/register", payload);
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

  const isVacationOrBusiness = () =>
    templateHtml.includes("{{시작일}}") || templateHtml.includes("{{종료일}}") || templateHtml.includes("{{사유}}");

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

          <label>출장/휴가 시작일</label>
          <input type="date" name="시작일" value={formData.시작일} onChange={handleInputChange} />
          <label>출장/휴가 종료일</label>
          <input type="date" name="종료일" value={formData.종료일} onChange={handleInputChange} />
        </>
      )}

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
        <div style={{ padding: "1rem", background: "#f0f0f0", borderRadius: "8px", marginTop: "1rem" }}>
          ✍️ 템플릿을 먼저 적용해주세요. 그 후에 본문 작성이 가능합니다.
        </div>
      )}

      <div style={{ margin: "1rem 0" }}>
        <button type="button" onClick={handleApplyTemplate} disabled={!isReadyForTemplate()}>
          📌 템플릿 적용하기
        </button>
        <button type="button" onClick={handleRestoreContent} style={{ marginLeft: "1rem" }}>
          🔄 세부내용 복원
        </button>
      </div>

      <div>
        <label>참조 부서</label>
        <button type="button" onClick={() => setIsRefModalOpen(true)}>부서 선택</button>
      </div>

      <RefDeptModal
        isOpen={isRefModalOpen}
        selected={refDeptIds}
        onClose={() => setIsRefModalOpen(false)}
        onSelect={(selected) => setRefDeptIds(selected)}
      />

      <button type="button" onClick={() => setIsModalOpen(true)}>결재자 선택</button>

      <ApproverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(approvers) => {
          const selectedIds = Object.values(approvers)
            .filter(Boolean)
            .map((emp) => emp.emp_code_id);

          const hasDuplicates = new Set(selectedIds).size !== selectedIds.length;
          if (hasDuplicates) {
            alert("❌ 동일한 결재자를 여러 단계에 지정할 수 없습니다.");
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
