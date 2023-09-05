import React from "react";
import '../index.css';
import LogoLeft from "../components/logoleft";
import NavRight from "../components/navRight";
import Polygon from "../components/polygon";

const Contact = () => {
    
    return (
        <>
            <Polygon>
                <div className="home-page">
                    <LogoLeft />
                    <div className="column menu-item contact-column contact-text">
                        <h1>Please Contact me for software engineering services</h1>
                        <p>
                         Email: javierruizjr15@gmail.com
                        </p>
                    </div>
                    <NavRight />
                </div>
            </Polygon>
        </>
    )
}

export default Contact; 
