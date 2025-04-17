import React from 'react';
import style from './Home.module.css';
import Navigation from '../../Components/Navigation.jsx';
import Sidebar from '../../Components/Sidebar.jsx';
import MainContent from './MainContent.jsx';

const Home = () => {

  


    return (
      <div className={style.homeContainer}>
        <Navigation />
        <div className={style.homeContents}>
          <div className={style.homeSidebar}>
            <Sidebar/>
          </div>
          <div className={style.homeMain}>
          
          <div className={style.homeCard}>
            <h2>뉴스피드</h2>
            <p>그룹 소식이 실시간으로 업데이트됩니다.</p>
          </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Home;