import React from 'react';
import style from './Home.module.css';
import Navigation from '../../Components/Navigation.jsx';
import Sidebar from '../../Components/Sidebar.jsx';


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
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;