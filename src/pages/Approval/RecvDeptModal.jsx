// ✅ RecvDeptModal.jsx (전체 수정 반영 완료)
import React, { useEffect, useState } from "react";
import daxios from "../../axios/axiosConfig";

const RecvDeptModal = ({ isOpen, selected = [], onClose, onSelect }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    daxios
      .get("http://10.5.5.6/emp/selectAllDepts")
      .then((res) => {
        setDepartments(res.data);
      })
      .catch((err) => {
        console.error("❌ 수신 부서 목록 실패:", err);
        alert("수신 부서를 불러오는 데 실패했습니다.");
      });
  }, [isOpen]);

  useEffect(() => {
    setSelectedIds(selected.map((d) => d.dept_id));
  }, [selected]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selectedDeptObjects = departments.filter((d) => selectedIds.includes(d.dept_id));
    onSelect(selectedDeptObjects);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
      <div className="modal" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', width: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3>📨 수신 부서 선택</h3>
        <ul>
          {departments.map((dept) => (
            <li key={dept.dept_id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(dept.dept_id)}
                  onChange={() => toggleSelection(dept.dept_id)}
                />
                {dept.dept_name}
              </label>
            </li>
          ))}
        </ul>
        <div className="modal-buttons" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={handleConfirm}>확인</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default RecvDeptModal;