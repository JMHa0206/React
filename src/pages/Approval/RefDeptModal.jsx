import React, { useEffect, useState } from "react";
import daxios from "../../axios/axiosConfig";

const RefDeptModal = ({ isOpen, selected = [], onClose, onSelect }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set(selected));

  useEffect(() => {
    if (!isOpen) return;
    daxios
      .get("http://10.5.5.6/emp/selectAllDepts")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("❌ 부서 목록 불러오기 실패", err));
  }, [isOpen]);

  useEffect(() => {
    setSelectedIds(new Set(selected));
  }, [selected]);

  const buildTree = (list, parentId = null) =>
    list
      .filter((d) => d.upper_dept === parentId)
      .map((d) => ({
        ...d,
        children: buildTree(list, d.dept_id),
      }));

  const toggleDept = (deptId) => {
    const next = new Set(selectedIds);
    next.has(deptId) ? next.delete(deptId) : next.add(deptId);
    setSelectedIds(next);
  };

  const renderTree = (nodes) =>
    nodes.map((node) => (
      <li key={node.dept_id}>
        <label>
          <input
            type="checkbox"
            checked={selectedIds.has(node.dept_id)}
            onChange={() => toggleDept(node.dept_id)}
          />
          {node.dept_name}
        </label>
        {node.children?.length > 0 && (
          <ul style={{ paddingLeft: "1rem" }}>{renderTree(node.children)}</ul>
        )}
      </li>
    ));

  const handleConfirm = () => {
    onSelect([...selectedIds]);
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
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "10px",
          minWidth: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>📂 부서 선택</h3>
        <ul>{renderTree(buildTree(departments))}</ul>

        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleConfirm} style={{ marginRight: "1rem" }}>
            확인
          </button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default RefDeptModal;
