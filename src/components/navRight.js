import React from "react";
import '../index.css'; 
import { Link } from "react-router-dom";

const NavRight = () => {

    return (
        <>
            <div className="column nav-item ">
                <div>
                    <p className="flex-top-right home-icon">
                        <Link to="/" className="white-link">Home</Link>
                    </p>
                </div>
                <div>
                    <p className="flex-bottom-right audio-icon">
                        Audio
                    </p>
                </div>
            </div>
        </>
    )
}

export default NavRight;
