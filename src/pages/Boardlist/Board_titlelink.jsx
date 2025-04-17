import bstyle from './Board_titlelink.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { jwtDecode } from 'jwt-decode';


const Board_titellink = () => {

    const { boardId } = useParams();
    const navigate = useNavigate();

    const [boardData, setBoardData] = useState({});
    const [message, setMessage] = useState({ post_title: "" });
    const [editMode, setEditMode] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    // 댓글 관련 상태
    const [replies, setReplies] = useState([]);
    const [newReply, setNewReply] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editedContent, setEditedContent] = useState("");


    //추천수
    const [postlike, setPostLike] = useState(0);

    //파일 다운로드
    const [fileList, setFileList] = useState([]);

    //파일 수정
    const [deletedFiles, setDeletedFiles] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [showUploadInput, setShowUploadInput] = useState(false);


// 작성자 정보용 state (한 번만 선언)
const [defaultBoardData, setDefaultBoardData] = useState({
    post_writer: 0,
    emp_name: '',
    parent_board: parseInt(boardId, 10),
    post_view: 0,
    post_like: 0,
    post_per: 'a',
    post_tag: '자유 게시판'
});

  // 디버깅: 상태 확인
  useEffect(() => {
    console.log('최종 parent_board 값:', defaultBoardData.parent_board);
    console.log('최종 emp_name 값:', defaultBoardData.emp_name);
}, [defaultBoardData]);

 // 사용자 정보 업데이트 (로그인 토큰 이용)
 useEffect(() => {
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            // decoded에 필요한 정보가 있는지 확인
            axios.get("http://10.5.5.12/mypage/info", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((resp) => {
                setDefaultBoardData(prevState => ({
                    ...prevState,
                    post_writer: resp.data.emp_code_id,
                    emp_name: resp.data.emp_name,
                }));
            })
            .catch((error) => {
                console.error('사용자 정보 가져오기 실패:', error);
            });
        } catch(error) {
            console.error('토큰 디코딩 실패:', error);
        }
    } else {
        setDefaultBoardData(prevState => ({
            ...prevState,
            post_writer: 0,
            emp_name: '익명'
        }));
    }
}, []);

    // 게시글 조회
    useEffect(() => {
        axios.get(`http://10.5.5.12/board/${boardId}`)
            .then(res => {
                setBoardData(res.data);
                setMessage({ post_title: res.data.post_title });
                setPostLike(res.data.post_like);

                const blocksFromHtml = htmlToDraft(res.data.post_content || "");
                const contentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks);
                const state = EditorState.createWithContent(contentState);
                setEditorState(state);
            });
    }, [boardId]);

    // 댓글 조회
    useEffect(() => {
        axios.get(`http://10.5.5.12/reply`, {
            params: { board_id: boardId }
        })
            .then(res => {
                setReplies(res.data);
            })
            .catch(err => {
                console.error("댓글 조회 실패:", err);
            });
    }, [boardId]);

    // 제목 수정 핸들링
    const handletitlelinkUpdateChange = (e) => {
        const { name, value } = e.target;
        setMessage((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditorChange = (newState) => {
        setEditorState(newState);
    };

    const handletitlelinkUpdate = () => {
        const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        axios.put(`http://10.5.5.12/board/update`, {
            post_id: parseInt(boardId),
            post_title: message.post_title,
            post_content: htmlContent,
            post_writer: boardData.post_writer ?? "",
            post_per: boardData.post_per ?? "",
            post_tag: boardData.post_tag ?? ""
        }).then(() => {
            alert("수정 완료!");
            setBoardData(prev => ({
                ...prev,
                post_title: message.post_title,
                post_content: htmlContent
            }));
            setEditMode(false);
        });
    };

    const handleDelete = () => {
        axios.delete(`http://10.5.5.12/board/${boardId}`)
            .then(() => {
                alert("삭제 완료!");
                navigate(-1);
            })
            .catch((error) => {
                console.error("삭제 오류:", error);
                alert("삭제 실패");
            });
    };

    // 댓글 작성
    const handleNewReplyChange = (e) => {
        setNewReply(e.target.value);
    };

    const handleNewReplySubmit = () => {
        if (!newReply.trim()) {
            alert("댓글 내용을 입력하세요.");
            return;
        }

        axios.post(`http://10.5.5.12/reply/insert`, {
            board_id: parseInt(boardId),
            reply_coontent: newReply,
            reply_writer: defaultBoardData.emp_name
        }).then(() => {
            axios.get(`http://10.5.5.12/reply`, {
                params: { board_id: boardId }
            })
                .then(res => {
                    setReplies(res.data);
                });

            setNewReply("");
        });
    };

    // 댓글 수정
    const handleEdit = (reply) => {
        setIsEditing(true);
        setEditingReplyId(reply.reply_id);
        setEditedContent(reply.reply_coontent);
    };

    const handleUpdate = () => {
        axios.put(`http://10.5.5.12/reply/update`, {
            reply_id: editingReplyId,
            reply_coontent: editedContent,
            reply_writer: defaultBoardData.emp_name
        }).then(() => {
            setReplies(prev =>
                prev.map(reply =>
                    reply.reply_id === editingReplyId
                        ? { ...reply, reply_coontent: editedContent }
                        : reply
                )
            );
            setIsEditing(false);
            setEditingReplyId(null);
            setEditedContent("");
        });
    };

    // 댓글 삭제
    const handleReplyDelete = (replyId) => {
        if (window.confirm("댓글을 삭제할까요?")) {
            axios.delete(`http://10.5.5.12/reply/${replyId}`)
                .then(() => {
                    setReplies(prev => prev.filter(reply => reply.reply_id !== replyId));
                })
                .catch(err => {
                    console.error("댓글 삭제 실패:", err);
                    alert("삭제 중 오류가 발생했습니다.");
                });
        }
    };

    // 추천수 증가 함수
    const increaseLikeCount = () => {
        axios.post(`http://10.5.5.12/board/increaseLikeCount/${boardId}`)
            .then(response => {
                setPostLike(prev => prev + 1);
            })
            .catch(error => {
                console.error("추천수 증가 실패:", error);
            });
    };
    //파일 다운로드
    useEffect(() => {
        axios.get(`http://10.5.5.12/board/${boardId}`).then((res) => {
            setBoardData(res.data);
            setMessage({ post_title: res.data.post_title });
            setPostLike(res.data.post_like);

            const blocksFromHtml = htmlToDraft(res.data.post_content || '');
            const contentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks);
            const state = EditorState.createWithContent(contentState);
            setEditorState(state);
        });

        axios.get(`http://10.5.5.12/files`, { params: { post_id: boardId } }).then((res) => {
            setFileList(res.data);
        });
    }, [boardId]);

    const handleFileDownload = (sysname, oriname) => {
        const link = document.createElement('a');
        link.href = `http://10.5.5.12/download/${sysname}?oriname=${encodeURIComponent(oriname)}`;
        link.setAttribute("download", oriname);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    useEffect(() => {
        console.log("📁 fileList", fileList);
    }, [fileList]);


    const handleAllFileDownload = () => {
        if (fileList.length === 1) {
            const file = fileList[0];
            handleFileDownload(file.b_sysname, file.b_oriname);
        } else if (fileList.length > 1) {
            const link = document.createElement("a");
            link.href = `http://10.5.5.12/download/all/${boardId}`;
            link.setAttribute("download", "files.zip");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    //수정시 파일 삭제 후 수정
    const handleFileDelete = (fileId) => {
        setFileList(prev => prev.filter(file => file.b_file_id !== fileId));
        setDeletedFiles(prev => [...prev, fileId]);

        setShowUploadInput(true);
    };

    const handleFileUpdate = () => {
        const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));

        const formData = new FormData();
        formData.append("post_id", boardId);
        formData.append("post_title", message.post_title);
        formData.append("post_content", htmlContent);
        formData.append("post_writer", boardData.post_writer);
        formData.append("post_per", boardData.post_per || "공개");
        formData.append("post_tag", boardData.post_tag || "");

        deletedFiles.forEach(id => formData.append("deleted_files", id));
        newFiles.forEach(file => formData.append("files", file));

        axios.put("http://10.5.5.12/board/updateWithFiles", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
            .then(() => {
                alert("수정 완료!");
                axios.get(`http://10.5.5.12/files`, { params: { post_id: boardId } })
                    .then((res) => {
                        setFileList(res.data);
                    });


                axios.get(`http://10.5.5.12/files`, { params: { post_id: boardId } })
                    .then((res) => {
                        setFileList(res.data);
                    });

                setBoardData(prev => ({
                    ...prev,
                    post_title: message.post_title,
                    post_content: htmlContent
                }));

                setEditMode(false);
            })
            .catch(err => {
                console.error("수정 실패:", err);
                alert("수정 실패!");
            });
    };

    useEffect(() => {
        if (editMode && fileList.length === 0) {
            setShowUploadInput(true);
        }
    }, [fileList, editMode]);


    //댓글 ui
    const renderRepliesSection = () => (
        <>
            {/* 댓글 출력 */}
            <div>댓글</div>
            {Array.isArray(replies) && replies.map((reply) => (
                <div key={reply.reply_id} className={bstyle.commentwrite}>
                    <div className={bstyle.profile}>프로필 사진</div>
                    <div className={bstyle.userwrite}>
                        <div className={bstyle.nametime}>
                            <div className={bstyle.name3}>{reply.reply_writer}</div>
                            <div className={bstyle.writetime3}>{reply.reply_date}</div>
                            <div className={bstyle.actionButtons}>
                                <button onClick={() => handleEdit(reply)} className={bstyle.editBtn}>수정</button>
                                <button onClick={() => handleReplyDelete(reply.reply_id)} className={bstyle.deleteBtn}>삭제</button>
                            </div>
                        </div>

                        {isEditing && editingReplyId === reply.reply_id ? (
                            <div className={bstyle.commentEditBox}>
                                <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className={bstyle.textarea}
                                />
                                <button className={bstyle.saveBtn} onClick={handleUpdate}>저장</button>
                                <button onClick={() => setIsEditing(false)} className={bstyle.cancelBtn}>취소</button>
                            </div>
                        ) : (
                            <div className={bstyle.content4}>{reply.reply_coontent}</div>
                        )}
                    </div>
                </div>
            ))}

            {/* 댓글 작성 */}
            <div className={bstyle.commentwrite2}>
                <textarea
                    placeholder="내용을 입력하세요"
                    value={newReply}
                    onChange={handleNewReplyChange}
                />
                <button className={bstyle.okbutton} onClick={handleNewReplySubmit}>확인</button>
            </div>
        </>
    );




    
    return (
        <div className={bstyle.gasyclick}>
            <div className={bstyle.standardwrite10}>글쓰기</div>

            <div className={bstyle.titlewrite}>
                <div className={bstyle.title2}>작성자</div>
                <div className={bstyle.text2}> 
                                            {defaultBoardData.emp_name || defaultBoardData.post_writer}
                                            </div>
            </div>

            <div className={bstyle.titlewrite}>
                <div className={bstyle.title2}>제목</div>
                {editMode ? (
                    <input
                        type="text"
                        className={bstyle.text2}
                        name="post_title"
                        onChange={handletitlelinkUpdateChange}
                        value={message.post_title}
                    />
                ) : (
                    <div className={bstyle.text2}>{boardData.post_title}</div>
                )}
            </div>


            <div className={bstyle.file}>
                {!editMode ? (
                    <div
                        className={bstyle.text2}
                        onClick={handleAllFileDownload}
                        style={{ cursor: "pointer", color: "#0a58ca", textDecoration: "underline" }}
                    >
                        📥 전체 파일 다운로드 ({fileList.length}개)
                    </div>
                ) : (
                    <>
                        {fileList.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                                {fileList.map((file, idx) => (
                                    <span key={idx} style={{ marginRight: '15px' }}>
                                        {file.b_oriname}
                                        <span
                                            onClick={() => handleFileDelete(file.b_file_id)}
                                            style={{
                                                marginLeft: '6px',
                                                color: 'red',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ❌
                                        </span>
                                    </span>
                                ))}
                            </div>
                        )}

                        {showUploadInput && (
                            <div className={bstyle.file}>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setNewFiles(Array.from(e.target.files))}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>


            <div className={bstyle.contentwrite}>
                {editMode ? (
                    <Editor
                        editorState={editorState}
                        onEditorStateChange={handleEditorChange}
                        wrapperClassName="demo-wrapper"
                        editorClassName="demo-editor"
                    />
                ) : (
                    <div
                        className={bstyle.text2}
                        dangerouslySetInnerHTML={{ __html: boardData.post_content }}
                    />
                )}
            </div>

            {!editMode && (
                <div className={bstyle.good2}>
                    <button className={bstyle.thumbsbutton} onClick={increaseLikeCount}>
                        <div className={bstyle.finger}>👍</div>
                        {postlike > 0 && <div className={bstyle.plus}>+{postlike}</div>}
                    </button>
                </div>
            )}
            <div className={bstyle.buttoncontainer}>
              
                <div className={bstyle.list3}><button onClick={() => navigate(-1)}>목록으로</button></div>
            
                <div className={bstyle.rightbuttons}>
                    <div className={bstyle.list4}>
                        {!editMode && <button onClick={() => setEditMode(true)}>수정</button>}
                        {editMode && <button onClick={handleFileUpdate}>저장</button>}
                    </div>
                    <div className={bstyle.list5}>
                        {!editMode ? (
                            <button onClick={handleDelete}>삭제</button>
                        ) : (
                            <button onClick={() => setEditMode(false)}>취소</button>
                        )}

                    </div>
                </div>
            </div>



            {/* 댓글 출력 */}
            {!editMode && renderRepliesSection()}

        </div>
    );
};

export default Board_titellink;