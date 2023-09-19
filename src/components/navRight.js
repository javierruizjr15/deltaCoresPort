import React from "react";
import '../index.css'; 
import { Link } from "react-router-dom";

const NavRight = () => {

    return (
        <>
            <div>
                <div>
                    <p className="flex-top-right home-icon">
                        <Link to="/" className="white-link">Audio</Link>
                    </p>
                </div>
                <div>
                    {/* <p className="flex-bottom-right audio-icon white-link">
                        Audio
                    </p> */}
                </div>
            </div>
        </>
    )
}

export default NavRight;
