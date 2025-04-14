import bstyle from './Board_club.module.css';


import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Board_club =()=>{
    const navigate = useNavigate();

    const [sortOption, setSortOption] = useState("option1");
    const [searchQuery, setSearchQuery] = useState("");
    // const [filteredGroup, setFilteredGroup] = useState([]);

    //네비게이터
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [boardList, setBoardList] = useState([]);




    // 조회수 증가 후 페이지 이동
    const increaseViewCount = (post_id) => {
        axios.get(`http://10.5.5.12/board/increaseViewCount/${post_id}`)
            .then(response => {
                console.log('조회수 증가 성공:', response.data);
                navigate(`/mainpage/maincontent/titlelink/${post_id}`);
            })
            .catch(error => {
                console.error('조회수 증가 실패:', error);
            });
    };

    // 날짜 형식 변환
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    //네비게이터 페이지 정보 보내는 부분
    useEffect(() => {
        axios.get(`http://10.5.5.12/board/navigator`, {
            params: { page: currentPage, size: 5 }
        })
            .then(res => {
                setBoardList(res.data.list);
                setTotalPages(res.data.totalPages);
            })
            .catch(err => {
                console.error("페이지 데이터 로딩 실패:", err);
            });
    }, [currentPage]);

    const getFilteredAndSortedList = () => {
        const query = searchQuery.toLowerCase();
      
        const sorted = [...boardList].sort((a, b) => {
          if (sortOption === "option1") {
            return new Date(b.post_date) - new Date(a.post_date);
          } else if (sortOption === "option2") {
            return b.post_view - a.post_view;
          }else if (sortOption === "option3") {
            return b.post_like - a.post_like; // 추천순
          }
          return 0;
        });
      
        return sorted.filter(item =>
          item.post_title.toLowerCase().includes(query)
        );
      };


    return (
        <div className={bstyle.SBoardContainer}>
            <div className={bstyle.subcontainer}>
                <h2>📄 게시판</h2>
                <div className={bstyle.approval}>
                    <div className={bstyle.navi}>
                        <div>자유 게시판</div>
                    </div>
                    <div className={bstyle.navibelow}>
                        <div className={bstyle.navibelowleft}>
                            <input
                                type="text"
                                placeholder="🔍게시글 입력"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className={bstyle.navibelowright}>
                            <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
                                <option value="option1">최신순</option>
                                <option value="option2">조회순</option>
                                <option value="option3">추천순</option>
                            </select>
                        </div>
                    </div>
                    <hr />
                    <div className={bstyle.freelist}>
                        {/* 게시글 목록 시작 */}
                        {getFilteredAndSortedList().map((message, index) => (
                            <div key={index} className={bstyle.postItem}>
                                <div className={bstyle.photo}>사진</div>
                                <div className={bstyle.write}>
                                    <div className={bstyle.title}>
                                        <div
                                            onClick={() => increaseViewCount(message.post_id)}
                                            style={{ cursor: "pointer", textDecoration: "underline" }}
                                        >
                                            {message.post_title}
                                        </div>
                                    </div>
                                    <div className={bstyle.content} dangerouslySetInnerHTML={{ __html: message.post_content }}></div>
                                    <div className={bstyle.writeElse}>
                                        <div className={bstyle.writer}>작성자 : {message.post_writer}</div>
                                        <div className={bstyle.good}>추천수 : {message.post_like}</div>
                                        <div className={bstyle.look}>조회수 : {message.post_view}</div>
                                        <div className={bstyle.writeTime}>{formatDate(message.post_date)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* 게시글 목록 끝 */}
    
                    {/* 페이지 네비게이션 */}
                    <div className={bstyle.pagination}>
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPage(idx + 1)}
                                className={currentPage === idx + 1 ? bstyle.active : ""}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                    {/* 게시글 작성 버튼 */}
                    <div className={bstyle.writeButton}>
                        <Link to="/mainpage/maincontent/write_button" state={{ name: "board" }}>
                            <button>작성하기</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Board_club;