import React from "react";
import '../index.css'; 
import LogoLeft from "../components/logoleft";
import NavRight from "../components/navRight";
import Polygon from "../components/polygon";

const About = () => {
         
    return (
        <>
            <Polygon>
                <div className="home-page">
                    <LogoLeft />
                    <div className="column menu-item about-column">
                        <p>
                            <p>About</p>
                        </p>
                    </div>
                        <NavRight />
                </div>
            </Polygon>
        </>
 
    );
};

export default About;