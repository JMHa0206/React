import bstyle from './Board_write_button.module.css';
import React, { useState, useEffect } from 'react';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import draftToHtml from 'draftjs-to-html';
import { convertToRaw } from 'draft-js';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const Board_write_button = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const boardId = location.state?.boardId || 0;
    const numericBoardId = parseInt(boardId, 10);

    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [message, setMessage] = useState({
        post_title: '',
        post_content: '',
    });
    const [files, setFiles] = useState([]);
    
    // 기본값에 emp_name을 포함
    const [defaultBoardData, setDefaultBoardData] = useState({
        post_writer: 0,  // 등록 시, 이 필드에 emp_name을 넣을 예정입니다.
        emp_name: '',     // 로그인한 사용자 이름
        parent_board: numericBoardId,
        post_view: 0,
        post_like: 0,
        post_per: 'a',
        post_tag: '자유 게시판'
    });

    // 디버깅: 상태 확인용
    useEffect(() => {
        console.log('최종 parent_board 값:', defaultBoardData.parent_board);
        console.log('최종 emp_name 값:', defaultBoardData.emp_name);
    }, [defaultBoardData]);

    // 로그인 토큰을 디코딩하고, 사용자 이름(emp_name)을 가져와 defaultBoardData 업데이트
    useEffect(() => {
        const token = sessionStorage.getItem('jwtToken');
    
        let userId = 'anonymous';
        if (token) {
            try {
                const decoded = jwtDecode(token);
                userId = decoded.sub; // 예: "loginID_23"이나, 실제로 emp_code_id가 숫자여야 함
            } catch (error) {
                console.error('토큰 디코딩 실패', error);
            }
        }
        if (userId !== 'anonymous') {
            axios.get("http://10.5.5.6/mypage/info", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((resp) => {
                // resp.data 에서 실제 emp_code_id (정수)와 emp_name (문자열)을 가져온다고 가정합니다.
                // 예시: { emp_code_id: 1004, emp_name: "강채영", ... }
                setDefaultBoardData(prevState => ({
                    ...prevState,
                    post_writer: resp.data.emp_code_id,  // 정수형 ID 유지
                    emp_name: resp.data.emp_name,          // 이름
                }));
            })
            .catch((error) => {
                console.error('사용자 정보 가져오기 실패:', error);
            });
        } else {
            setDefaultBoardData(prevState => ({
                ...prevState,
                post_writer: 0,
                emp_name: '익명'
            }));
        }
    }, []);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setMessage(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // 게시글 등록 처리 (등록 버튼 누르면 실행)
    const handleBoardwrite = async () => {
        const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));

        if (!message.post_title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        const isEmptyContent = htmlContent === '<p><br></p>' || !htmlContent.trim() || htmlContent === '<p></p>';
        if (isEmptyContent) {
            alert('내용을 입력해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('post_title', message.post_title);
        formData.append('post_content', htmlContent);
        
        // 기존에는 post_writer에 사용자 ID 등을 저장했다면,
        // 여기서는 등록 시 실제 emp_name(직원 이름)을 전송하도록 합니다.
        formData.append('post_writer', defaultBoardData.post_writer);
        
        formData.append('post_tag', defaultBoardData.post_tag);
        formData.append('post_per', defaultBoardData.post_per);
        formData.append('parent_board', defaultBoardData.parent_board);
        formData.append('post_view', defaultBoardData.post_view);
        formData.append('post_like', defaultBoardData.post_like);

        if (files.length > 0) {
            Array.from(files).forEach(file => {
                formData.append('files', file);
            });
        }

        try {
            const response = await axios.post('http://10.5.5.6/board/filedownload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.status === 200) {
                alert('게시글이 성공적으로 등록되었습니다!');
                navigate(-1);
            }
        } catch (error) {
            console.error('등록 중 오류 발생:', error);
            alert('게시글 등록 실패');
        }
    };

    return (
        <div className={bstyle.SBoardContainer}>
            <div className={bstyle.subcontainer}>
                <div>📄 게시판</div>
                <div className={bstyle.approval}>
                    <div className={bstyle.container2}>
                        <div className={bstyle.standardwrite10}>글쓰기</div>
                        <div className={bstyle.signcancel}>
                            <button onClick={handleBoardwrite}>등록</button>
                            <button onClick={() => navigate(-1)}>취소</button>
                        </div>
                        
                        <div className={bstyle.titlewrtie}>
                            <div className={bstyle.title4}>작성자</div>
                            <div className={bstyle.text4}>
                            {defaultBoardData.emp_name || defaultBoardData.post_writer}
                            </div>
                        </div>
                        <div className={bstyle.titlewrite}>
                            <div className={bstyle.title2}>제목</div>
                            <div className={bstyle.text2}>
                                <input type="text" name="post_title" placeholder="제목을 입력하세요" onChange={handleInput} value={message.post_title} />
                            </div>
                        </div>
                        <div className={bstyle.file}>
                            <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
                        </div>
                        <div className={bstyle.editorWrapper}>
                            <Editor
                                editorState={editorState}
                                onEditorStateChange={setEditorState}
                                wrapperClassName="demo-wrapper"
                                editorClassName="demo-editor"
                                toolbar={{
                                    options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'remove', 'history'],
                                    inline: {
                                        inDropdown: false,
                                        options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
                                    },
                                    blockType: {
                                        inDropdown: true,
                                        options: ['Normal', 'H1', 'H2', 'H3', 'Blockquote', 'Code'],
                                    },
                                    fontSize: {
                                        options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
                                    },
                                    fontFamily: {
                                        options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
                                    },
                                    list: {
                                        inDropdown: false,
                                        options: ['unordered', 'ordered'],
                                    },
                                    textAlign: {
                                        inDropdown: true,
                                        options: ['left', 'center', 'right', 'justify'],
                                    },
                                    colorPicker: {
                                        colors: ['black', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'],
                                    },
                                    link: {
                                        inDropdown: true,
                                    },
                                    history: {
                                        inDropdown: false,
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Board_write_button;