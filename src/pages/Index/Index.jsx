import style from './Index.module.css';
import daxios from '../../axios/axiosConfig';
import useAuthStore from '../../store/useAuthStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Index = () => {
    const navi = useNavigate();
    const [login, setLogin] = useState({ id: '', pw: '' });
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLogin((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = (e) => {
        e.preventDefault();

        daxios.post('http://10.5.5.6/auth/login', login)
            .then((resp) => {
                const token = resp.data;
                sessionStorage.setItem("jwtToken", token);
                const decodedToken = jwtDecode(token);
                const per_function = decodedToken.per_function;
                const per_secure = decodedToken.per_secure;

                // ✅ 토큰을 localStorage에도 저장
                localStorage.setItem('jwtToken', token);

                // ✅ 상태관리 저장
                setAuth(token, login.id, per_function, per_secure);

                navi('/mainpage');
            })
            .catch((error) => {
                console.error('로그인 실패', error);
            });
    };

    return (
        <div className={style.container}>
            <div className={style.formWrapper}>
                <div className={style.logoContainer}>
                    <img src="/path-to-your-logo.png" alt="Code Breaker 로고" className={style.logo} />
                </div>

                <form className={style.form}>
                    <div className={style.inputGroup}>
                        <input
                            type="text"
                            placeholder="아이디"
                            name="id"
                            className={style.input}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={style.inputGroup}>
                        <input
                            type="password"
                            placeholder="비밀번호"
                            name="pw"
                            className={style.input}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" onClick={handleLogin} className={style.loginButton}>
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Index;
