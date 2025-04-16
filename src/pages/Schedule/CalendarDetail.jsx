import React from 'react';
import { useState, useEffect } from 'react';
import addCategoryStyle from './AddCategoryStyle.module.css';
import caxios from '../../Utils/caxios';


const CalendarDetail = ({ closeModal, selectedInfo, onRefresh }) => {

    const [userInfo,setUserInfo] = useState(null);
    const [selectedColor, setSelectedColor] = useState('');
    const [calender, setCalender] = useState({
        c_id: selectedInfo.c_id,
        c_title: '',
        dept_code:'',
        color: '',
        public_code: ''
    });


    useEffect(()=>{
              caxios.get("/mypage/info").then((resp)=>{
                  setUserInfo(resp.data);
                  
              }).catch((error) => {
                  console.error("실패", error);
              });
              
    }, [])
    
    
    useEffect(() => {
            if (selectedInfo) {
              setCalender({
                c_id: selectedInfo.c_id,
                c_title: selectedInfo.c_title,
                dept_code: selectedInfo.dept_code || '',
                color: selectedInfo.color || '#FFFFFF',
                public_code: selectedInfo.public_code || '10'
              });
              setSelectedColor(selectedInfo.color || '#FFFFFF');
            }
    }, [selectedInfo]);
    
    const colors = ['#ee5074', '#fa7227', '#ac725e', '#f7d915', '#a3b90a', '#57b92a', '#4fced8', '#5990d5', '#777dbf', '#844285'];
        
    const handleCalInput = (e) => {
        const { name, value } = e.target;
        setCalender(prev => ({
          ...prev,
          [name]: value,
          emp_id: userInfo?.emp_code_id || '',
          dept_code: userInfo?.emp_dept_id || ''
        }));

        if (name === 'color') setSelectedColor(value);
    };
    
    
    
    
      const handleUpdateCalendar = () => {
        if (!calender.c_title.trim()) return alert('캘린더 이름을 입력해주세요.');
        if (!calender.color.trim()) return alert('캘린더 색상을 선택해주세요.');
    
    
        caxios.put("/calendar/update", calender)
        .then((resp)=> {
            alert('캘린더가 성공적으로 수정되었습니다.');
            onRefresh();
            closeModal();
        })
        .catch((error) => {
            console.error('캘린더 수정 실패', error);
            alert('캘린더 수정에 실패했습니다.');
        })
        };
        
    
    const handleDeleteCalendar = () => {
        const confirmDelete = window.confirm("캘린더를 삭제하시겠습니까?");
        if (!confirmDelete) return;

        caxios.delete(`/calendar/${calender.c_id}`, calender)
        .then((resp)=> {
            alert('캘린더가 성공적으로 삭제되었습니다.');
            onRefresh();
            closeModal();
        })
        .catch((error) => {
            console.error('캘린더 삭제 실패', error);
            alert('캘린더 삭제에 실패했습니다.');
        });
    };
       
    
      
      
    
      
    
      

    return (
        <div className={addCategoryStyle['modal-overlay']}>
      <div className={addCategoryStyle['modal-container']}>
        
        <div className={addCategoryStyle.closeBtn}>
          <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
        </div>
        <h3>캘린더 수정 및 삭제</h3>
        <select className={addCategoryStyle['form-select']} name="public_code" value={selectedInfo.public_code} onChange={handleCalInput} disabled>
          <option value="10">내 캘린더</option>
          <option value="20">공유 캘린더</option>
        </select>

        

        <div>
          <p className={addCategoryStyle['color-label']}>캘린더 이름</p>
          <input type="text" className={addCategoryStyle['form-input']} value={calender.c_title} name="c_title" onChange={handleCalInput} />
        </div>

        <div className={addCategoryStyle['color-section']}>
          <p className={addCategoryStyle['color-label']}>캘린더 색상</p>
          <div className={addCategoryStyle['color-options']}>
            {colors.map(color => (
              <label key={color} className={addCategoryStyle['form-radio']}>
                <input
                  type="radio"
                  name="color"
                  value={color}
                  style={{ display: 'none' }}
                  onChange={handleCalInput}
                  checked={selectedColor === color}
                />
                <span
                  className={addCategoryStyle['color-circle']}
                  style={{
                    backgroundColor: color,
                    border: selectedColor === color ? '3px solid #000' : '1px solid #ccc'
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className={addCategoryStyle['modal-buttons']}>
        <button className={addCategoryStyle['form-button']} onClick={handleDeleteCalendar}>삭제</button>
          <button className={addCategoryStyle['form-button']} onClick={handleUpdateCalendar}>수정</button>
        </div>
      </div>
    </div>
  );
};

export default CalendarDetail;