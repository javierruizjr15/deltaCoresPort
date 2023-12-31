import React from "react";
import '../index.css';
import LogoLeft from "../components/logoleft";
import NavRight from "../components/navRight";
import BackgroundSlider from "../components/backgroundSlider";
import Carousel from "../components/carousel";

const Work = () => {
    
    return (
        <>

            <BackgroundSlider>
                <div className="home-page">
                    <LogoLeft />
                    <div className="work-column">
                       <Carousel />
                    </div>
                    <NavRight />
                </div>
            </BackgroundSlider>
        </>
    )
}

export default Work;
