import React from "react";
import '../index.css';
import LogoLeft from "../components/logoleft";
import NavRight from "../components/navRight";

const Work = () => {
    
    return (
        <>
            <div className="home-page">
                <LogoLeft />
                <div className="column menu-item">
                    <p>
                        Twerk it!
                    </p>
                </div>
                <NavRight />
            </div>
        </>
    )
}

export default Work;
