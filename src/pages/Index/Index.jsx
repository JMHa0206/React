import style from './Index.module.css';
import daxios from '../../axios/axiosConfig';
import useAuthStore from '../../store/useAuthStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Index = () => {
    const navi = useNavigate();
    const [login, setLogin] = useState({ id: '', pw: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLogin((prev) => ({ ...prev, [name]: value }));
        setError(''); // 입력 시 에러 메시지 초기화
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');


        daxios.post('http://10.5.5.6/auth/login', login)

            .then((resp) => {
                const token = resp.data;
                sessionStorage.setItem("jwtToken", token);
                const decodedToken = jwtDecode(token);
                const per_function = decodedToken.per_function;
                const per_secure = decodedToken.per_secure;

                setAuth(token, login.id, per_function, per_secure);
                navi('/mainpage');
            })
            .catch((error) => {
                console.error('로그인 실패', error);
                setError('아이디 또는 비밀번호가 올바르지 않습니다.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className={style.container}>
            <div className={style.loginCard}>
                <div className={style.leftPanel}>
                    <div className={style.brandContent}>
                        <img src="/path-to-your-logo.png" alt="Code Breaker 로고" className={style.logo} />
                        <h1 className={style.brandTitle}>Code Breaker</h1>
                        <p className={style.brandTagline}>그룹웨어 시스템</p>
                    </div>
                </div>
                
                <div className={style.rightPanel}>
                    <div className={style.formHeader}>
                        <h2>WELCOME</h2>
                    </div>
                    
                    <form className={style.form} onSubmit={handleLogin}>
                        <div className={style.inputGroup}>
                            <label htmlFor="id" className={style.inputLabel}>아이디</label>
                            <input
                                id="id"
                                type="text"
                                name="id"
                                className={style.input}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={style.inputGroup}>
                            <label htmlFor="pw" className={style.inputLabel}>비밀번호</label>
                            <input
                                id="pw"
                                type="password"
                                name="pw"
                                className={style.input}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        {error && <div className={style.errorMessage}>{error}</div>}

                        <button 
                            type="submit" 
                            className={style.loginButton}
                            disabled={isLoading}
                        >
                            {isLoading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>
                    
                    <div className={style.formFooter}>
                        <p>© {new Date().getFullYear()} Code Breaker. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;