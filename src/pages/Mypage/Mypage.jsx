import useAuthStore from "../../store/useAuthStore";
import style from './Mypage.module.css';
import { useEffect, useState } from "react";
import axios from "../../axios/axiosConfig";
import authAxios from '../../axios/axiosConfig';
import useProfileStore from "../../store/useProfileStore";

const Mypage = () => {
    const [edit, setEdit] = useState(false);
    const [formData, setFormData] = useState({});   
    const [userInfo, setUserInfo] = useState(null);
    const { userId, isInitialized } = useAuthStore();
    const [profileImage, setProfileImage] = useState("/Default2.png"); // 기본 이미지 경로
    const [profileFile, setProfileFile] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const {setProfileImagePath } = useProfileStore();

    useEffect(() => {
        if (!isInitialized || !userId) return;

        authAxios.get("http://10.5.5.6/mypage/info")
            .then(res => {
                setUserInfo(res.data);
                setFormData({
                    emp_code_id: res.data.emp_code_id,
                    emp_email: res.data.emp_email,
                    emp_phone: res.data.emp_phone,
                    postcode: res.data.postcode,
                    address1: res.data.address1,
                    address2: res.data.address2,
                });

                const path = res.data.profileDTO?.profile_path;
                if (path) {
                    const fullPath = `http://10.5.5.6${path}`;
                    setProfileImage(fullPath);
                    setProfileImagePath(fullPath); 
                }
            })
            .catch(err => {
                console.error("유저 정보 로딩 실패", err);
            });
    }, [isInitialized, userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePostcode = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setFormData(prev => ({
                    ...prev,
                    postcode: data.zonecode,
                    address1: data.roadAddress,
                    address2: ''
                }));
            }
        }).open();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file)); // 미리보기
            setProfileFile(file);
        }
    };

    const handleSave = () => {
        const formDataToSend = new FormData();
        const employeeBlob = new Blob(
            [JSON.stringify(formData)], 
            { type: "application/json" }
        );
        formDataToSend.append("data", employeeBlob);

        if (profileFile) {
            formDataToSend.append("profile", profileFile);
        }

        axios.put("http://10.5.5.6/mypage/update", formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(() => {
            // 저장 후 최신 데이터 재요청
            return authAxios.get("http://10.5.5.6/mypage/info");
        })
        .then(res => {
            const path = res.data.profileDTO?.profile_path;
            if (path) {
                const fullPath = `http://10.5.5.6${path}`;
                setProfileImage(fullPath);            // ✅ 로컬 이미지 업데이트
                setProfileImagePath(fullPath);        // 🔥 핵심 수정: 전역 상태도 함께 업데이트 (Header 반영됨!)
            }
            setUserInfo(res.data);
            setEdit(false);
            alert("수정이 완료되었습니다.");
        })
        .catch(err => {
            console.error("수정 실패", err);
            alert("수정 중 오류가 발생했습니다.");
        });
    };

    const handleImageError = () => {
        setProfileImage("/Default2.png");
    };

    if (!userInfo) {
        return (
            <div className={style.container}>
                <div className={style.loadingContainer}>
                    <div className={style.loadingSpinner}></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={style.container}>
            <h2 className={style.pageTitle}>마이페이지</h2>
            <div className={style.profileCard}>
                <div className={style.profileSection}>
                    <div className={style.imageContainer}>
                        <img 
                            src={profileImage}
                            alt="프로필" 
                            className={style.profileImage}
                            onError={handleImageError}
                            onLoad={() => setImageLoaded(true)}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                    
                    {edit && (
                        <div className={style.fileInputContainer}>
                            <label htmlFor="profile-upload" className={style.fileInputLabel}>
                                이미지 변경
                            </label>
                            <input 
                                id="profile-upload"
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                className={style.fileInput}
                            />
                        </div>
                    )}
                </div>
                
                <div className={style.infoSection}>
                    <div className={style.row}>
                        <label>이름:</label>
                        <span>{userInfo.emp_name}</span>
                    </div>
                    <div className={style.row}>
                        <label>이메일:</label>
                        {edit ? (
                            <input 
                                name="emp_email" 
                                value={formData.emp_email}
                                onChange={handleChange} 
                                placeholder="이메일"
                                className={style.formInput}
                            />
                        ) : (
                            <span>{userInfo.emp_email}</span>
                        )}
                    </div>
                    <div className={style.row}>
                        <label>전화번호:</label>
                        {edit ? (
                            <input 
                                name="emp_phone" 
                                value={formData.emp_phone}
                                onChange={handleChange} 
                                placeholder="전화번호"
                                className={style.formInput}
                            />
                        ) : (
                            <span>{userInfo.emp_phone}</span>
                        )}
                    </div>
                    <div className={style.row}>
                        <label>주소:</label>
                        {edit ? (
                            <div className={style.addressContainer}>
                                <div className={style.postcodeRow}>
                                    <input
                                        name="postcode"
                                        value={formData.postcode}
                                        readOnly
                                        placeholder="우편번호"
                                        className={style.postcodeInput}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handlePostcode}
                                        className={style.postcodeButton}
                                    >
                                        우편번호 찾기
                                    </button>
                                </div>
                                <input
                                    name="address1"
                                    value={formData.address1}
                                    readOnly
                                    placeholder="주소"
                                    className={style.addressInput}
                                />
                                <input
                                    name="address2"
                                    value={formData.address2}
                                    onChange={handleChange}
                                    placeholder="상세주소"
                                    className={style.addressInput}
                                />
                            </div>
                        ) : (
                            <span className={style.addressText}>
                                {userInfo.address1} {userInfo.address2} 
                                {userInfo.postcode && ` (우편번호: ${userInfo.postcode})`}
                            </span>
                        )}
                    </div>
                    <div className={style.row}>
                        <label>입사일:</label>
                        <span>{new Date(userInfo.hire_date).toLocaleDateString()}</span>
                    </div>
                    <div className={style.row}>
                        <label>급여:</label>
                        <span>{userInfo.salary.toLocaleString()} 원</span>
                    </div>
                    <div className={style.row}>
                        <label>부서:</label>
                        <span>{userInfo.departDTO?.dept_name || "미지정"}</span>
                    </div>
                    <div className={style.row}>
                        <label>직급:</label>
                        <span>{userInfo.jobDTO?.job_name || "미지정"}</span>
                    </div>

                    <div className={style.actions}>
                        {edit ? (
                            <>
                                <button onClick={handleSave} className={style.saveButton}>저장</button>
                                <button onClick={() => setEdit(false)} className={style.cancelButton}>취소</button>
                            </>
                        ) : (
                            <button onClick={() => setEdit(true)} className={style.editButton}>수정</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Mypage;
