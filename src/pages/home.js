import React from "react";
import '../index.css'; 
import LogoLeft from "../components/logoleft";
import MenuItems from "../components/menuItems";
import NavRight from "../components/navRight";
import Platonics from "../components/platonics";

const Home = () => {
    
        
    return (
        <>
            <Platonics>
                <div className="home-page">
                    <LogoLeft />
                    <MenuItems />
                    <NavRight />
                </div>
            </Platonics>
        </>

    );
};

export default Home;