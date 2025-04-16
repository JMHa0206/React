import bstyle from './Board_postwrite_button.module.css';
import React, { useState } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import draftToHtml from 'draftjs-to-html';
import { convertToRaw } from 'draft-js';


const Board_postwrite_button = () => {
    const navigate = useNavigate();

    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const [message, setMessage] = useState({
        post_title: '',
        post_content: '',
    });

    const [files, setFiles] = useState([]);

    const [defaultBoardData, setDefaultBoardData] = useState({
        post_writer: '1004', //  로그인 연동 
        parent_board: 0,
        post_view: 0,
        post_like: 0,
        post_per: 'a',
        post_tag: '자유 게시판'
    });

    const handleInput = (e) => {
        const { name, value } = e.target;
        setMessage((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    //파일 다운로드
    const handleBoardwrite = async () => {
        const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        const formData = new FormData();
      
        formData.append('post_title', message.post_title);
        formData.append('post_content', htmlContent);
        formData.append('post_writer', defaultBoardData.post_writer);
        formData.append('post_tag', defaultBoardData.post_tag);
        formData.append('post_per', defaultBoardData.post_per);
        formData.append('parent_board', defaultBoardData.parent_board);
        formData.append('post_view', defaultBoardData.post_view);
        formData.append('post_like', defaultBoardData.post_like);
      
        // ✅ 파일이 있을 때만 formData에 추가
        if (files.length > 0) {
          Array.from(files).forEach((file) => {
            formData.append('files', file);
          });
        }
      
        try {
          const response = await axios.post('http://10.5.5.12/board/filedownload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
      
          if (response.status === 200) {
            alert('게시글이 성공적으로 등록되었습니다!');
            navigate(-1); // 또는 목록 페이지로 이동
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
                        <div className={bstyle.gasyselect}>
                            <div className={bstyle.gasywrite}>게시판</div>
                            <div className={bstyle.selects}>
                                <select>
                                    <option value="option1">자유 게시판</option>
                                    <option value="option2">동아리 게시판</option>
                                    <option value="option3">부서 게시판</option>
                                    <option value="option4">거래처별 변경사항</option>
                                    <option value="option5">업체교육/업무지원 보고서</option>
                                    <option value="option6">신규 아이디어 상품건의</option>
                                </select>
                            </div>
                        </div>
                        <div className={bstyle.titlewrtie}>
                            <div className={bstyle.title4}>작성자</div>
                            <div className={bstyle.text4}>1004</div>
                        </div>
                        <div className={bstyle.titlewrite}>

                            <div className={bstyle.title2}>제목</div>
                            <div className={bstyle.text2}>
                                <input type="text" name="post_title" placeholder="제목을 입력하세요" onChange={handleInput} value={message.post_title}></input></div>
                            <div className={bstyle.checkbox2}>
                                <label>
                                    <input
                                        type="checkbox"
                                        onChange={(e) =>
                                            setDefaultBoardData((prev) => ({
                                                ...prev,
                                                post_per: e.target.checked ? 'notice' : 'public'
                                            }))
                                        }
                                    />
                                    공지로 등록
                                </label>
                            </div>
                        </div>
                        <div className={bstyle.file}>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setFiles(e.target.files)} 
                            />
                        </div>
                        <div className={bstyle.editorWrapper}>

                            <Editor
                                editorState={editorState}
                                onEditorStateChange={setEditorState}
                                wrapperClassName="demo-wrapper"
                                editorClassName="demo-editor"
                                toolbar={{
                                    options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'remove', 'history'],
                                    inline: { inDropdown: false, options: ['bold', 'italic', 'underline', 'strikethrough'] },
                                    fontSize: {
                                        options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
                                    },
                                    fontFamily: {
                                        options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
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
export default Board_postwrite_button;