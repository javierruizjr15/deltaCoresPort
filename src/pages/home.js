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