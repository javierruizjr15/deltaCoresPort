import React from "react";
import '../index.css'; 
import LogoLeft from "../components/logoleft";
import MenuItems from "../components/menuItems";
import NavRight from "../components/navRight";
// import Platonics from "../components/platonics";
import Polygon from "../components/polygon";

const Home = () => {
    
        
    return (
        <>
        <Polygon>
            {/* <body id="body">
                <div id="WebGL-output"></div>
            </body> */}
                <div className="home-page">
                    <LogoLeft />
                    <MenuItems />
                    <NavRight />
                </div>
            </Polygon>
        </>

    );
};

export default Home;