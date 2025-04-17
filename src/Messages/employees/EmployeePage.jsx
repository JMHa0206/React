import { useState,useEffect } from "react";
import style from './Employee.module.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import useAuthStore from '../../store/useAuthStore';


function EmployeePage({openChat}) {
    const [employees,setEmployees] = useState([]);
    const [groupedEmployees, setGroupedEmployees] = useState({});
    const [myInfo,setMyInfo] = useState(null);
    const [profileImg, setProfileImg] = useState(null);
    const [profileMap, setProfileMap] = useState({});


    //사원목록 가져오기
    useEffect(() => {
        
        const userId = sessionStorage.getItem("userId");
      
        let mine = null;

          axios.get("http://10.5.5.2/Employee/SelectMine",{
            params: {
                userId: userId
            }
          }).then((userIdResp)=>{
             mine = userIdResp.data;
              setMyInfo(mine);

              return axios.get("http://10.5.5.2/Employee/ProfileImg", {
                params: { empId: mine.emp_code_id }
              });
            }).then((imgResp) => {
                console.log(imgResp.data)
              setProfileImg(imgResp.data);
              

             return axios.get("http://10.5.5.2/Employee/SelectEmp");
        }).then((resp) => {
           
             const filtered = resp.data.filter(emp => emp.emp_code_id !== mine.emp_code_id); // 나 자신 제외
             setEmployees(filtered);
    
            // 부서별로 직원 그룹화
            const grouped = filtered.reduce((acc, emp) => {
                if (!acc[emp.dept_name]) {
                    acc[emp.dept_name] = [];
                }
                acc[emp.dept_name].push(emp);
                return acc;
            }, {});
    
            setGroupedEmployees(grouped);

              return axios.get("http://10.5.5.2/Employee/AllProfileImg");
        }).then((imgList)=>{
            console.log(imgList);
            const map ={};
            imgList.data.forEach(img =>{
                map[img.PROFILE_EMP_ID] = img.PROFILE_PATH;
            })
            setProfileMap(map)
        })
       
      }, []);



      

  

     


    return (
        <div className={style.main}>
            {myInfo && (
                <div className={style.myprofile}>
                <div className={style.imgbox}>
                    <div className={style.img}>
                        <img src={`http://10.10.55.69${profileImg}`} style={{width:'100%',height:'100%', borderRadius:'50%',objectFit:'cover'}}></img> 
                    </div>
                </div>
                <div className={style.namebox}>
                    <div className={style.name}>{myInfo.emp_name}</div>
                </div>
            </div>
            )}
            
            {Object.entries(groupedEmployees).map(([dept, employees]) => (
                <div key={dept}>
                    <p>{dept}</p> {/* 부서명 출력 */}
                    {employees.map((emp, index) => (
                        <div key={index} className={style.another}>
                            <div className={style.imgbox}>
                                <div className={style.anotherimg}>
                                     <img src={profileMap[emp.emp_code_id] ? `http://10.10.55.69${profileMap[emp.emp_code_id]}` : `http://10.10.55.69/files/upload/profile/Default2.png`} style={{width:'100%',height:'100%', borderRadius:'50%',objectFit:'cover'}}></img> 
                                </div>
                            </div>
                            <div className={style.namebox} onDoubleClick={()=>openChat(emp.emp_code_id,myInfo?.emp_code_id,emp.emp_name)}>
                                <div className={style.anothername} translate="no">{emp.emp_name}</div> {/* 사원명 출력 */}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
            

        </div>

    )



}

                                                                                    
export default EmployeePage;