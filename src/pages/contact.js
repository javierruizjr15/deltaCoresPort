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
                    <div className="column menu-item contact-column">
                        <p>
                            Hit me up B
                        </p>
                    </div>
                    <NavRight />
                </div>
            </Polygon>
        </>
    )
}

export default Contact; 
