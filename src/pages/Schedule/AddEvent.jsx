
import React, { useEffect, useState } from 'react';
import addFormStyle from './AddEvent.module.css'
import caxios from '../../Utils/caxios';



const AddEventform = ({ closeModal, selectedInfo }) => {

    const [ calList, setCalList ] = useState([]);
    
    useEffect(() => {
        caxios.get('/calendar').then((resp) => {
          setCalList(resp.data);
        });
      }, []);




    return (
        <div className={addFormStyle['modal-overlay']}>
            <div className={addFormStyle['modal-container']}>
            <h2>일정 추가</h2>
            <div className={addCategoryStyle.closeBtn}>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
            </div>
            <div>
                일정 종류
                <select name="category_id" value={eventInput.category_id} onChange={handleInput}>
                    <option value="">캘린더 선택</option>
                    {
                      <option key={calList.c_id} value={calList.c_id}>
                        {calList.c_title}
                      </option>
                    }
                </select>
            </div>
            <div>
                일정 제목
                <input
                type="text"
                name="title"
                value={eventInput.title}
                onChange={handleInput}
                placeholder="일정 제목 입력"
                autoFocus
                />
            </div>
            <div>
                시작일
                <input name="start_date" type="date" value={eventInput.start} onChange={handleInput} />
                종료일
                <input name="end_date" type="date" value={eventInput.end} onChange={handleInput} />
                
            </div>
            <div>
                시작시간
                <select name="startTime" value={eventInput.startTime} onChange={handleInput}>
                {Array.from({ length: 48 }).map((_, index) => {
                    const h = String(Math.floor(index / 2)).padStart(2, '0');
                    const m = index % 2 === 0 ? '00' : '30';
                    const time = `${h}:${m}`;
                    return <option key={time} value={time}>{time}</option>;
                })}
                </select>
                종료시간
                <select name="endTime" value={eventInput.endTime} onChange={handleInput}>
                {Array.from({ length: 48 }).map((_, index) => {
                    const h = String(Math.floor(index / 2)).padStart(2, '0');
                    const m = index % 2 === 0 ? '00' : '30';
                    const time = `${h}:${m}`;
                    return <option key={time} value={time}>{time}</option>;
                })}
                </select>
            </div>
            <div>
                일정 내용
                <textarea
                name="content"
                value={eventInput.content}
                onChange={handleInput}
                placeholder="내용 입력"
                style={{ width: '300px', height: '150px', resize: 'none' }}
                />
            </div>
            <div className={addFormStyle['modal-buttons']}>
                <button onClick={handleAddEvent}>저장</button>
            </div>
            </div>
        </div>
      )
}

export default AddEventform;