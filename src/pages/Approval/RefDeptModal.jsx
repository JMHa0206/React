// ✅ RefDeptModal.jsx (onSelect도 객체 통으로 넘기도록)
import React, { useEffect, useState } from "react";
import daxios from "../../axios/axiosConfig";

const RefDeptModal = ({ isOpen, selected = [], onClose, onSelect }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set(selected.map((d) => d.dept_id)));

  useEffect(() => {
    if (!isOpen) return;
    daxios
      .get("http://10.5.5.6/emp/selectAllDepts")
      .then((res) => {
        setDepartments(res.data);
      })
      .catch((err) => {
        console.error("❌ 부서 목록 로딩 실패:", err);
        alert("부서 목록을 불러오는 데 실패했습니다.");
      });
  }, [isOpen]);

  useEffect(() => {
    setSelectedIds(new Set(selected.map((d) => d.dept_id)));
  }, [selected]);

  const buildTree = (list, parentId = null) =>
    list.filter((d) => d.upper_dept === parentId).map((d) => ({
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
    const selectedArray = [...selectedIds];
    const selectedDeptObjects = departments.filter((d) => selectedArray.includes(d.dept_id));
    onSelect(selectedDeptObjects);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
      <div className="modal" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', width: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3>📂 참조 부서 선택</h3>
        <ul>{renderTree(buildTree(departments))}</ul>
        <div className="modal-buttons" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={handleConfirm}>확인</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default RefDeptModal;
