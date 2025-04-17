// ✅ ApprovalWrite.jsx 안정화 버전

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import daxios from "../../axios/axiosConfig";
import { Editor } from "@tinymce/tinymce-react";

const ApprovalWrite = () => {
  const [forms, setForms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [empCodeId, setEmpCodeId] = useState(null);
  const [edmsCId, setEdmsCId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [formRes, categoryRes, empRes] = await Promise.all([

          daxios.get("http://221.150.27.169:8888/api/forms"),
          daxios.get("http://221.150.27.169:8888/api/category"),
          daxios.get("http://221.150.27.169:8888/api/employee/code"),


        ]);
        setForms(formRes.data);
        setCategories(categoryRes.data);
        setEmpCodeId(empRes.data);
      } catch (err) {
        console.error("❌ 초기 데이터 불러오기 실패", err);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchFormDetails = async () => {
      if (!selectedFormId || categories.length === 0) return;
      try {
        const res = await daxios.get(`http://221.150.27.169:8888/api/forms/${selectedFormId}`);

        const form = res.data;
        setPreviewContent(form.formContent || "");

        const matchedCategory = categories.find(
          (cat) => cat.edmsCName === form.formType
        );
        setEdmsCId(matchedCategory?.edmsCId || "");
      } catch (err) {
        console.error("❌ 양식 상세 조회 실패", err);
      }
    };

    fetchFormDetails();
  }, [selectedFormId, categories]);

  const handleStart = () => {
    if (!selectedFormId || !edmsCId || !empCodeId) {
      alert("양식, 결재 종류, 사용자 정보가 필요합니다.");
      return;
    }

    navigate("/mainpage/maincontent/approval/write/next", {
      state: {
        formId: Number(selectedFormId),
        edmsCId: Number(edmsCId),
        comId: empCodeId,
        stateCode: 1,
        refDept: "D001",
        level1: 2,
        level2: 3,
        finalLevel: 2,
      },
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📄 양식 선택 및 미리보기</h2>

      <label>양식 선택</label>
      <select onChange={(e) => setSelectedFormId(e.target.value)} value={selectedFormId}>
        <option value="">-- 선택하세요 --</option>
        {forms.map((f) => (
          <option key={f.formId} value={f.formId}>
            {f.formName}
          </option>
        ))}
      </select>

      {edmsCId && (
        <div style={{ marginTop: "0.5rem", marginBottom: "1.5rem", color: "#333" }}>
          <strong>결재 종류:</strong>{" "}
          {
            categories.find((c) => c.edmsCId === Number(edmsCId))?.edmsCName
            || "알 수 없음"
          }{" "}
          (ID: {edmsCId})
        </div>
      )}

      {previewContent && (
        <>
          <h3>🧐 양식 미리보기</h3>
          <Editor
            apiKey="hxn7uw6e8li0hmpqrhwhgm2sr6jrapxrnjhu8g4bvl8cm8fg"
            value={previewContent}
            init={{
              height: 300,
              menubar: false,
              readonly: true,
              toolbar: false,
              plugins: "preview",
            }}
          />
        </>
      )}

      <button onClick={handleStart} style={{ marginTop: "1rem" }}>
        작성 시작
      </button>
    </div>
  );
};

export default ApprovalWrite;