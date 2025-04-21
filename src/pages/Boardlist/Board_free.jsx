import bstyle from './Board_club.module.css';


import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'; 

const Board_club =()=>{
    const navigate = useNavigate();

    const location = useLocation();
     
     // boardId가 state로 전달되지 않으면 기본값을 0으로 설정
     const boardId = location.state?.boardId || 107;

     const numericBoardId = parseInt(boardId, 10);  // 숫자형으로 변환

   const [sortOption, setSortOption] = useState("option1");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [boardList, setBoardList] = useState([]);





     // 📌 게시판 목록 불러오기
     const getBoardList = () => {
        axios.post(`http://10.5.5.6/board/navigator`, {
         
                page: currentPage,
                size: 5,
                parent_board: numericBoardId
        
        })
        .then(res => {
            setBoardList(res.data.list);
            setTotalPages(res.data.totalPages);
        })
        .catch(err => {
            console.error("페이지 데이터 로딩 실패:", err);
        });
    };

    useEffect(() => {
        if (!isNaN(numericBoardId)) {
          getBoardList();
        }
      }, [currentPage, numericBoardId]);

    // 📌 게시글 정렬 및 검색 필터링
    const getFilteredAndSortedList = () => {
        const query = searchQuery.toLowerCase();
        const sorted = [...boardList].sort((a, b) => {
            if (sortOption === "option1") {
                return new Date(b.post_date) - new Date(a.post_date);
            } else if (sortOption === "option2") {
                return b.post_view - a.post_view;
            }
            return 0;
        });

        return sorted.filter(item =>
            item.post_title.toLowerCase().includes(query)
        );
    };

    // 📌 조회수 증가 후 상세 페이지로 이동
    const increaseViewCount = (post_id) => {
        axios.get(`http://10.5.5.6/board/increaseViewCount/${post_id}`)
            .then(() => {
                navigate(`/mainpage/maincontent/board/titlelink/${post_id}`);
            })
            .catch(error => {
                console.error('조회수 증가 실패:', error);
            });
    };

    // 📌 날짜 포맷
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR');
    };


    return (
        <div className={bstyle.SBoardContainer}>
            <div className={bstyle.subcontainer}>
                <h2>게시판</h2>
                <div className={bstyle.approval}>
                    <div className={bstyle.navi}>
                        <div>자유 게시판</div>
                    </div>
                    <div className={bstyle.navibelow}>
                        <div className={bstyle.navibelowleft}>
                            <input
                                type="text"
                                placeholder="게시글 입력"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className={bstyle.navibelowright}>
                            <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
                                <option value="option1">최신순</option>
                                <option value="option2">조회순</option>

                            </select>
                        </div>
                    </div>
                    <hr />
                    <div className={bstyle.freelist}>
                        {/* 게시글 목록 시작 */}
                        {getFilteredAndSortedList().map((message, index) => (
                            <div key={index} className={bstyle.postItem}>
                              
                                <div className={bstyle.write}>
                                    <div className={bstyle.title}>제목 :
                                        <div
                                            onClick={() => increaseViewCount(message.post_id)}
                                            style={{ cursor: "pointer", textDecoration: "underline" }}
                                        >
                                            {message.post_title}
                                        </div>
                                    </div>
                                    <div className={bstyle.content} dangerouslySetInnerHTML={{ __html: message.post_content }}></div>
                                    <div className={bstyle.writeElse}>
                                        <div className={bstyle.writer}>작성자 : {message.emp_name}</div>
                                   
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
                        <Link
                                                   to="/mainpage/maincontent/board/write_button"
                                                   state={{ boardId: numericBoardId }} // 📌 여기서 boardId 넘김
                                               >
                            <button>작성하기</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Board_club;