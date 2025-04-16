import React, { useState } from 'react';
import style from './ScheduleMain.module.css';
import DemoApp from './DemoApp';



const ScheduleMain = ({ reloadKey, onRefresh }) => {
  
  return (
    <div className={style.ScheContainer}>
      <div className={style.calender}>
      <h2>캘린더</h2>
        <DemoApp key={reloadKey}  onRefresh={onRefresh}  reloadKey={reloadKey} />
    </div>
    </div>
  )
}



export default ScheduleMain;


  