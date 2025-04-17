import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import bstyle from './Board_reference.module.css';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Board_reference = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // boardId가 state로 전달되지 않으면 기본값을 0으로 설정
    const boardId = location.state?.boardId || 114;

    const numericBoardId = parseInt(boardId, 10);  // 숫자형으로 변환

    const [userInfo, setUserInfo] = useState(null);
    const [sortOption, setSortOption] = useState("option1");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [boardList, setBoardList] = useState([]);



    useEffect(() => {
        const token = sessionStorage.getItem('jwtToken');
        axios.get("http://10.5.5.12/mypage/info", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((resp) => {
                setUserInfo(resp.data);
            })
            .catch((error) => {
                console.error("실패", error);
            });
    }, []);

    const getBoardList = () => {
        console.log("📦 API 호출 시작", {
            userId: userInfo?.emp_name,
            boardId: numericBoardId,
            currentPage,
            userInfo
        });

        axios.post(`http://10.5.5.12/board/navigator`, {
    
                page: currentPage,
                size: 10,
                parent_board: numericBoardId
            
        })
            .then(res => {
                console.log("🟡 응답 데이터 전체:", res.data);
                const data = res.data;

                if (!data.list || !Array.isArray(data.list)) {
                    console.warn("📛 게시글 목록이 없습니다.");
                    setBoardList([]);
                    setTotalPages(1);
                    return;
                }

                console.log("📦 게시글 데이터:", data);
                setBoardList(data.list);

                const safePages = Math.max(Math.ceil(data.totalPages), 1);
                setTotalPages(safePages);
            })
            .catch(err => {
                console.error("❌ 게시글 목록 API 호출 실패:", err);
                setBoardList([]);
                setTotalPages(1);
            });
    };

    useEffect(() => {
        if (!isNaN(numericBoardId) && userInfo) {
            console.log("✅ 게시판 목록 불러오기 시작:", userInfo.emp_code_id);
            getBoardList();
        }
    }, [currentPage, numericBoardId, userInfo]);

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

        const filtered = sorted.filter(item =>
            item.post_title?.toLowerCase().includes(query)
        );

        // ✅ 여기에 추가!
        console.log("📦 필터링 후 게시글 수:", filtered.length);
        console.log("📝 현재 검색어:", query);

        return filtered;
    };

    const increaseViewCount = (post_id) => {
        axios.get(`http://10.5.5.12/board/increaseViewCount/${post_id}`)
            .then(() => {
                navigate(`/mainpage/maincontent/titlelink/${post_id}`);
            })
            .catch(error => {
                console.error('조회수 증가 실패:', error);
            });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR');
    };

    return (
        <div className={bstyle.SBoardContainer}>
            <div className={bstyle.subcontainer}>
                <h2>게시판</h2>
                <div className={bstyle.approval}>
                    <table className={bstyle.container}>
                        <thead>
                            <tr className={bstyle.navi}>
                                <th colSpan="6">자료실</th>
                            </tr>
                            <tr>
                                <td colSpan="2">
                                    <div className={bstyle.boardgasyfound}>
                                        <input
                                            type="text"
                                            placeholder="게시글 입력"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </td>
                                <td colSpan="4">
                                    <select
                                        onChange={(e) => setSortOption(e.target.value)}
                                        value={sortOption}
                                    >
                                        <option value="option1">최신순</option>
                                        <option value="option2">조회순</option>
                                    </select>
                                </td>
                            </tr>
                            <tr className={bstyle.list}>
                                <th>번호</th>
                                <th>제목</th>
                                <th>작성자</th>
                                <th>작성일</th>
                                <th>조회수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredAndSortedList().map((message, index) => (
                                <tr
                                    key={index}
                                    className={bstyle.rowHover}
                                    onClick={() => increaseViewCount(message.post_id)}
                                >
                                    <td>{message.post_id}</td>
                                    <td>
                                        {message.post_title}
                                    </td>
                                    <td>{message.emp_name}</td>
                                    <td>{formatDate(message.post_date)}</td>
                                    <td>{message.post_view}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

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

                    <div className={bstyle.writeButton}>
                        <Link
                            to="/mainpage/maincontent/write_button"
                            state={{ boardId: numericBoardId }}
                        >
                            <button>작성하기</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Board_reference;