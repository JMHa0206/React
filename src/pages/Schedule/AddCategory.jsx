
import React, { useState, useEffect } from 'react';
import caxios from '../../Utils/caxios';
import addCategoryStyle from './AddCategoryStyle.module.css';



const AddCategory = ({ closeModal,  onRefresh }) => {


  const [userInfo,setUserInfo] = useState(null);
  useEffect(()=>{
          caxios.get("/mypage/info").then((resp)=>{
              setUserInfo(resp.data);
              
          }).catch((error) => {
              console.error("실패", error);
          });
          
      }, [])

   

  const [calender, setCalender] = useState({
    c_id: '',
    c_title: '',
    dept_code:'',
    color: '#FFFFFF',
    public_code: '10'
  });

  const handleCalInput = (e) => {
    const { name, value } = e.target;

    setCalender(prev => ({
      ...prev,
      [name]: value,
      emp_id: userInfo?.emp_code_id || '',
      dept_code: userInfo?.emp_dept_id || ''
    }));

    if (name === 'color') {
      setSelectedColor(value);
    }
  };

  const colors = ['#ee5074', '#fa7227', '#ac725e', '#f7d915', '#a3b90a', '#57b92a', '#4fced8', '#5990d5', '#777dbf', '#844285'];



  const handleAddCalender = () => {
    if (!calender.c_title.trim()) {
      alert("캘린더 이름을 입력해주세요.");
      return;
    }
    if (!calender.color.trim()) {
      alert("캘린더 색상을 입력해주세요.");
      return;
    }

    

    const creatorTarget = {
      target_id: userInfo.emp_code_id,
      target_type: 'emp',
      name: userInfo.emp_name || '본인'
    };

    const alreadyExists = selectedTargets.some(t => t.target_id === creatorTarget.target_id);

    const finalTargets = calender.public_code === "20"
      ? alreadyExists ? selectedTargets : [...selectedTargets, creatorTarget]
      : [];

    if (calender.public_code === "20" && selectedTargets.length === 0) {
          alert("공유 대상을 선택해주세요.");
          return;
        }

    caxios.post("/calendar", calender)
    .then((resp)=> {
      const c_id = resp.data.c_id;
      console.log(c_id);
      const shareData = finalTargets.map(t => ({
        c_id: c_id,
        target_type: t.target_type,
        target_id: t.target_id
      }));

      return caxios.post("/calendar/calendarShare", shareData);
    })
    .then(() => {
      alert("캘린더가 성공적으로 추가되었습니다.");
      if (onRefresh) onRefresh();
      closeModal(); 
    })
    .catch((error) => {
        if (error.response?.status === 404 || error.response?.status === 500) {
          alert("등록에 실패했습니다.");
    }})

    

    
    setCalender({
      c_id: '',
      c_title: '',
      emp_id: '',
      dept_code:'',
      color: '#FFFFFF',
      created_date: '',
      public_code: '10'
    });

    };

    const [selectedColor, setSelectedColor] = useState('');
    const [selectedTargets, setSelectedTargets] = useState([]);

  const handleAddTarget = (e) => {
    const value = e.target.value;
    const type = e.target.getAttribute("data-type");
    if (!value) return;

    const alreadyExists = selectedTargets.some(t => t.target_id === Number(value) && t.target_type === type);
  if (alreadyExists) return;

    const label = e.target.options[e.target.selectedIndex].text;
    setSelectedTargets(prev => [...prev, { target_id: Number(value), target_type: type, name: label }]);


    e.target.selectedIndex = 0;
  };

  const removeTarget = (id) => {
    setSelectedTargets(prev => prev.filter(t => t.target_id !== id));
  };
  

  const [employees, setEmployees] = useState([]);
  const [ departments, setDepartments ] = useState([]);

  useEffect(() => {
    if (!userInfo) return;

    const selectedEmpIds = selectedTargets
    .filter(t => t.target_type === 'emp')
    .map(t => t.target_id);

    const selectedDeptIds = selectedTargets
      .filter(t => t.target_type == 'dept')
      .map(t => t.target_id);

    caxios.get("/emp/selectAllEmps")
    .then((resp) => {
      const emps = resp.data;

      const filtered = emps.filter(emp =>
        emp.emp_code_id !== userInfo.emp_code_id && // 본인 제외
        !selectedEmpIds.includes(emp.emp_code_id) && // 이미 선택된 사원 제외
        !selectedDeptIds.includes(emp.emp_dept_id) // 이미 선택된 부서 소속 사원 제외
      );
      
      setEmployees(filtered);

    }).catch((error) => {
      if (error.response?.status === 404 || 500) {
        alert("사원 목록을 불러오는데 실패했습니다.");
    }});

    caxios.get("/emp/selectAllDepts").then((resp) => {
      const depts = resp.data;

      const filteredDepts = depts.filter(dept => 
        !selectedTargets.some(t => t.target_id === dept.dept_id)
      );
      setDepartments(filteredDepts);

    }).catch((error) => {
      if (error.response?.status === 404 || 500) {
        alert("부서 목록을 불러오는데 실패했습니다.");
    }});

  },[userInfo, selectedTargets])


    return (
      <div className={addCategoryStyle['modal-overlay']}>
          <div className={addCategoryStyle['modal-container']}>
            <div className={addCategoryStyle.closeBtn}>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
            </div>

            <select className={addCategoryStyle['form-select']}  name="public_code" value={calender.public_code} onChange={handleCalInput}>
              <option value="10">내 캘린더</option>
              <option value="20">공유 캘린더</option>
            </select>

            {calender.public_code == 20 && (
              <div>
                <div><strong>공유 대상</strong></div>
                <div className={addCategoryStyle['time-row']}>
                <div className={addCategoryStyle['time-item']}>
                  <label>부서 선택</label>
                  <select
                    className={addCategoryStyle['form-select']}
                    data-type="dept"
                    onChange={handleAddTarget}
                  >
                    <option value="">부서</option>
                    {departments.map((dept) => (
                      <option key={dept.dept_id} value={dept.dept_id}>
                        {dept.dept_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={addCategoryStyle['time-item']}>
                  <label>개별 선택</label>
                  <select
                    className={addCategoryStyle['form-select']}
                    data-type="emp"
                    onChange={handleAddTarget}
                  >
                    <option value="">개인</option>
                    {employees.map((emp) => (
                      <option key={emp.emp_code_id} value={emp.emp_code_id}>
                        {emp.emp_name} : {emp.job_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                {selectedTargets.length > 0 ? (
                  selectedTargets.map(t => (
                    <span  key={t.target_id}  className={addCategoryStyle['target-tag']}>
                      {t.name}
                      <button
                        type="button"
                        className={addCategoryStyle['remove-btn']}
                        onClick={() => removeTarget(t.target_id)}
                      >
                        x
                      </button>
                    </span>
                  ))
                ) : (
                  <p  className={addCategoryStyle['color-label']}>선택된 대상이 없습니다.</p>
                )}
              </div>
              </div>
            )}

            <div>
              <p className={addCategoryStyle['color-label']}>캘린더 이름</p>
              <input
                type="text"
                className={addCategoryStyle['form-input']}
                value={calender.c_title}
                onChange={handleCalInput}
                name="c_title"
              />
            </div>

            <div className={addCategoryStyle['color-section']}>
              <p className={addCategoryStyle['color-label']}>캘린더 색상</p>
              <div className={addCategoryStyle['color-options']}>
                {colors.map((color) => (
                  <label key={color} className={addCategoryStyle['form-radio']}>
                    <input
                      type="radio"
                      name="color"
                      className={addCategoryStyle['form-radio-input']}
                      value={color}
                      onChange={handleCalInput}
                      checked={selectedColor === color}
                      style={{ display: 'none' }}
                    />
                    <span
                      className={addCategoryStyle['color-circle']}
                      style={{
                        backgroundColor: color,
                        border: selectedColor === color ? '3px solid #000' : '1px solid #ccc',
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className={addCategoryStyle['modal-buttons']}>
              <button className={addCategoryStyle['form-button']} onClick={handleAddCalender}>저장</button>
              
              
            </div>
          </div>
        </div>

    
      )

}

export default AddCategory;