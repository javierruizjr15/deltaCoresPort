import React from "react";
import '../index.css'; 
import { Link } from "react-router-dom";

const MenuItems = () => {

    return (
        <>
            <div className="column menu-item">
                    <p>
                        <Link to="/about" className="white-link">About</Link>
                    </p>
                </div>
                <div className="column menu-item">
                    <p>
                        <Link to="/work" className="white-link">Work</Link>
                    </p>
                </div>
                <div className="column menu-item">
                    <p>
                        <Link to="/contact" className="white-link">Contact</Link>
                        
                    </p>
                </div>
        </>
    )
}

export default MenuItems;