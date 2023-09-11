import React from "react";
import '../index.css'; 
import { Link } from "react-router-dom";
import ExLine from "./exLine";

const MenuItems = () => {

    return (
        <>
            <div className="menu-items-container"> 
                <div className="menu-item">
                    <div>
                        <Link to="/about" className="white-link">About</Link>
                    </div>
                {/* </div> */}
                {/* <div className="menu-item2"> */}
                    <div>
                        <Link to="/work" className="white-link">Work</Link>
                    </div>
                {/* </div> */}
                {/* <div className="menu-item2"> */}
                    <div>
                        <Link to="/contact" className="white-link">Contact</Link> 
                    </div>
                </div>
            </div>
            <div className="button-bottom-center">
                <ExLine />
            </div>

        </>

/* <>
            <div className="menu-items-container"> 
                <div className="menu-item">
                    <div>
                        <Link to="/about" className="white-link">About</Link>
                    </div>
                </div>
                
                <div className="menu-item work-container">
                    <div>
                        <Link to="/work" className="white-link">Work</Link>
                    </div>
                    <ExLine />
                </div>
                
                <div className="menu-item">
                    <div>
                        <Link to="/contact" className="white-link">Contact</Link> 
                    </div>
                </div>
            </div>
        </> */
    )
}

export default MenuItems;