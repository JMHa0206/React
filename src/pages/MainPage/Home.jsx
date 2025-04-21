import React, { useEffect, useState } from 'react';
import style from './Home.module.css';
import Navigation from '../../Components/Navigation.jsx';
import Sidebar from '../../Components/Sidebar.jsx';
import daxios from '../../axios/axiosConfig.js';
import { parse, format } from 'date-fns';
import { ko } from 'date-fns/locale';


const Home = () => {

  const formatBirthdayWithDay = (mmdd) => {
    if (!mmdd) return '';
    const year = new Date().getFullYear();
    const fullDateStr = `${year}-${mmdd}`; // 예: 2024-04-27
    const parsedDate = parse(fullDateStr, 'yyyy-MM-dd', new Date());

    return format(parsedDate, 'M월 d일 (E)', { locale: ko });
    // 예: "4월 27일 (토)"
  };

  const [birthdayList, setBirthdayList] = useState([]);

  useEffect(() => {
    daxios.get('http://10.10.55.69/insa/birtdaylist')
      .then((res) => {
        console.log("🎂 생일자 리스트 도착:", res.data);
        setBirthdayList(res.data);
      })
      .catch((err) => {
        console.log("생일자를 못찾았습니다.", err);
      });
  }, []);

  // 오늘 생일자와 이번 달 생일자 분리
  const todayList = birthdayList.filter(emp => emp.istoday === true);
  const monthList = birthdayList.filter(emp => emp.istoday !== true);

  return (
    <div className={style.homeContainer}>
      <Navigation />
      <div className={style.homeContents}>
        <div className={style.homeSidebar}>
          <Sidebar />
        </div>
        <div className={style.homeMain}>

          {/* 🎈 오늘 생일자 카드 */}

          <div className={style.homeCard}>
            <h2>🎈 오늘 생일인 직원</h2>
            {todayList.length === 0 ? (
              <p>오늘 생일인 직원이 없습니다.</p>
            ) : (
              <ul className={style.birthdayList}>
                {todayList.map((emp, idx) => (
                  <li key={idx}>
                    🎉 <strong>{emp.empname}</strong> ({emp.deptname}) 님의 <strong>생일입니다! 오늘이에요! 🎂</strong> ({formatBirthdayWithDay(emp.emprrn)})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 🎂 이번 달 생일자 카드 */}
          <div className={style.homeCard}>
            <h2>🎂 이번 달 생일자</h2>
            {monthList.length === 0 ? (
              <p>이번 달 생일자가 없습니다.</p>
            ) : (
              <ol className={style.birthdayList}>
                {monthList.map((emp, idx) => (
                  <li key={idx} className="bg-yellow-50 border border-yellow-200 p-3 rounded-md shadow-sm text-sm">
                    🎉 <strong>{emp.empname}</strong> ({emp.deptname}) 님의 생일이 <strong>{formatBirthdayWithDay(emp.emprrn)}</strong>입니다.
                  </li>
                ))}
              </ol>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
