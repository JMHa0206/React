// ✅ ApproverModal.jsx (부서 트리 + 직급 표시 + 본문 연동용 치환 로직 포함)

import React, { useEffect, useState } from "react";
import daxios from "../../axios/axiosConfig";

const ApproverModal = ({ isOpen, onClose, onSelect }) => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [levels, setLevels] = useState({
    level1: null,
    level2: null,
    level3: null,
    level4: null,
    finalLevel: null,
  });

  // 🧠 트리 구조 구성
  const buildTree = (list, parentId = null) => {
    return list
      .filter((dept) => dept.upper_dept === parentId)
      .map((dept) => ({
        ...dept,
        children: buildTree(list, dept.dept_id),
      }));
  };

  const renderTree = (nodes) => {
    return nodes.map((node) => (
      <li key={node.dept_id}>
        <span
          onClick={() => setSelectedDeptId(node.dept_id)}
          style={{
            cursor: "pointer",
            color: selectedDeptId === node.dept_id ? "blue" : "black",
          }}
        >
          {node.dept_name}
        </span>
        {node.children?.length > 0 && (
          <ul style={{ paddingLeft: "1rem" }}>{renderTree(node.children)}</ul>
        )}
      </li>
    ));
  };

  useEffect(() => {
    if (!isOpen) return;
    daxios
      .get("http://10.5.5.6/emp/selectAllDepts")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("❌ 부서 목록 불러오기 실패", err));
  }, [isOpen]);

  useEffect(() => {
    if (!selectedDeptId) return;
    daxios
      .get("http://221.150.27.169:8888/emp/selectAllEmps")

      .then((res) => {
        const filtered = res.data.filter(
          (emp) => emp.emp_dept_id === selectedDeptId
        );
        setEmployees(filtered);
      })
      .catch((err) => console.error("❌ 사원 목록 불러오기 실패", err));
  }, [selectedDeptId]);

  const handleSelect = (e, levelKey) => {
    const empCodeId = Number(e.target.value);
    const selected = employees.find((emp) => emp.emp_code_id === empCodeId);
    setLevels((prev) => ({
      ...prev,
      [levelKey]: selected || null,
    }));
  };

  const handleConfirm = () => {
    const enrichedLevels = Object.fromEntries(
      Object.entries(levels).map(([key, emp]) => [
        key,
        emp
          ? {
              ...emp,
              empName: emp.emp_name,
              jobName: emp.job_name || emp.jobDTO?.job_name || "",
            }
          : null,
      ])
    );
    onSelect(enrichedLevels);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          minWidth: "800px",
          display: "flex",
          gap: "2rem",
        }}
      >
        {/* 왼쪽: 부서 트리 */}
        <div style={{ width: "40%" }}>
          <h3>📁 부서 선택</h3>
          <ul>{renderTree(buildTree(departments))}</ul>
        </div>

        {/* 오른쪽: 결재자 지정 */}
        <div style={{ width: "60%" }}>
          <h3>👤 결재자 지정</h3>
          {Object.keys(levels).map((key) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <label>{key.toUpperCase()} 결재자:</label>
              <select
                onChange={(e) => handleSelect(e, key)}
                value={levels[key]?.emp_code_id || ""}
              >
                <option value="">-- 선택하세요 --</option>
                {employees.map((emp) => (
                  <option key={emp.emp_code_id} value={emp.emp_code_id}>
                    {emp.emp_name} ({emp.job_name || emp.jobDTO?.job_name || "직급없음"})
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div style={{ marginTop: "1.5rem" }}>
            <button onClick={handleConfirm} style={{ marginRight: "1rem" }}>
              확인
            </button>
            <button onClick={onClose}>취소</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproverModal;
