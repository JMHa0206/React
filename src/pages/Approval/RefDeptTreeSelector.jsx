import React, { useEffect, useState } from "react";
import daxios from "../../axios/axiosConfig";

const RefDeptTreeSelector = ({ selected = [], onChange = () => {} }) => {
  const [departments, setDepartments] = useState([]);
  const [checked, setChecked] = useState(new Set(selected));

  // 부서 목록 호출
  useEffect(() => {
    daxios
      .get("http://221.150.27.169:8888/emp/selectAllDepts")

      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("❌ 부서 목록 로딩 실패", err));
  }, []);

  // selected가 바뀌면 동기화
  useEffect(() => {
    setChecked(new Set(selected));
  }, [selected]);

  // 트리 구성
  const buildTree = (list, parentId = null) => {
    return list
      .filter((d) => d.upper_dept === parentId)
      .map((d) => ({
        ...d,
        children: buildTree(list, d.dept_id),
      }));
  };

  // 체크 토글
  const handleCheck = (deptId) => {
    const newChecked = new Set(checked);
    newChecked.has(deptId) ? newChecked.delete(deptId) : newChecked.add(deptId);
    setChecked(newChecked);
    onChange(Array.from(newChecked));
  };

  // 트리 렌더링
  const renderTree = (nodes) =>
    nodes.map((node) => (
      <li key={node.dept_id}>
        <label>
          <input
            type="checkbox"
            checked={checked.has(node.dept_id)}
            onChange={() => handleCheck(node.dept_id)}
          />
          {node.dept_name}
        </label>
        {node.children?.length > 0 && (
          <ul style={{ paddingLeft: "1rem" }}>{renderTree(node.children)}</ul>
        )}
      </li>
    ));

  return (
    <div>
      <ul>{renderTree(buildTree(departments))}</ul>
    </div>
  );
};

export default RefDeptTreeSelector;
