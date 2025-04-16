import React, { useState, useEffect } from 'react';
import caxios from '../../Utils/caxios';
import { BrowserRouter as Router, Link} from 'react-router-dom';
import './ResvSideList.css';
import sideliststyle from '../../Components/Sidelist.module.css';

const ResvSideList = ({ closeModal }) => {


    const [ rescList, setRescList ] = useState([]);

useEffect (() =>{
    const getResources = () => {
        caxios.get("/reserve/resourceType").then((resp) => {
            setRescList(resp.data);
        }).catch((error) => {
            console.error("자원유형 불러오기 실패", error);
        })
    }
    getResources();
}, [])
    



    return (
        <div className="accordionContainer">
            <div className="accordion" id="accordionExample">

                <div className="accordion-item">
                <Link className="myReservationLink" style={{color: 'white'}} to={`/mainpage/maincontent/reserve/myReservation`}>
                    내 예약 목록
                </Link>
                </div>
                <div className={sideliststyle.resourceSidebar}>
                    <div className={sideliststyle.wholegasy}>자원 예약</div>
                    {
                    rescList.map((resc, index) => (
                        <div key={index}>
                        <Link className={sideliststyle.rescLink} to={`/mainpage/maincontent/reserve/${resc.resc_type_id}`}>
                            {resc.resc_type}
                        </Link>
                        </div>
                    ))
                    }
                </div>

                
            </div>
        </div>
    )


}



export default ResvSideList;


