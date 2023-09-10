// *********Random Route to Component Page
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 



const ExLine = () => {
    const [width, setWidth] = useState(0);
    const [showLine, setShowLine] = useState(false);
    const expandingRef = useRef(false);
    const stopRef = useRef(null);
    const navigate = useNavigate(); // Using the navigate function from react-router

    const routes = [
        "/freymoji",
        // "/pokeballs",
        // "/reactionwaves",
        // "/freyafalls",
        "/refractedrays",
        "/rotationalspacemod"
    ];

    const handleMouseDown = () => {
        setShowLine(true);
        expandingRef.current = true;
        setWidth(0);
        expandLine();
        
        // Navigate to a random route after 3 seconds
        stopRef.current = setTimeout(() => {
            expandingRef.current = false;
            const randomRoute = routes[Math.floor(Math.random() * routes.length)];
            navigate(randomRoute);
        }, 3000);
    }

    const handleMouseUp = () => {
        setShowLine(false);
        expandingRef.current = false;
        if (stopRef.current) {
            clearTimeout(stopRef.current);
        }
        setWidth(0);
    }

    const expandLine = () => {
        if (expandingRef.current) {
            setWidth(prevWidth => prevWidth + 5);
            setTimeout(expandLine, 50);
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button className="btn btn-dark" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                Click and Hold
            </button>
            {showLine && (
                <div 
                    style={{
                        marginTop: '10px',
                        width: `${width}px`,
                        height: '2px',
                        backgroundColor: 'white',
                        border: '1px solid white',
                        transition: 'width 0.3s ease-out'
                    }}
                ></div>
            )}
        </div>
    );
}

export default ExLine;




// *****render random component to overlay screen
// import React, { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom'; // Import useNavigate

// import RotationalSpaceMod from './rotationalSpaceMod';
// import RefractedRays from './refractedRays';
// import ReactionWaves from './reactionWaves';
// import FreyaFalls from './freyaFalls';
// import Freymoji from './freymoji';
// import Pokeballs from './infinitePokeballs';

// const components = [ RotationalSpaceMod, ReactionWaves, RefractedRays, FreyaFalls, Freymoji, Pokeballs ];


// const ExLine = () => {
//     const [width, setWidth] = useState(0);
//     const [showLine, setShowLine] = useState(false);
//     const [SelectedComponent, setSelectedComponent] = useState(null);  // This will hold the randomly selected component
//     const expandingRef = useRef(false);
//     const stopRef = useRef(null);

//     const components = [ ReactionWaves, FreyaFalls, Freymoji, Pokeballs, RotationalSpaceMod, RefractedRays ];  // Add all your imported components here

//     const handleMouseDown = () => {
//         setShowLine(true);
//         expandingRef.current = true;
//         setWidth(0);
//         expandLine();

//         stopRef.current = setTimeout(() => {
//             expandingRef.current = false;
//             const randomIndex = Math.floor(Math.random() * components.length);
//             setSelectedComponent(components[randomIndex]);
//         }, 3000);
//     }

//     const handleMouseUp = () => {
//         setShowLine(false);
//         expandingRef.current = false;
//         if (stopRef.current) {
//             clearTimeout(stopRef.current);
//         }
//         setWidth(0);
//     }

//     const expandLine = () => {
//         if (expandingRef.current) {
//             setWidth(prevWidth => prevWidth + 5);
//             setTimeout(expandLine, 50);
//         }
//     }

//     return (
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//             <button className="btn btn-dark" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
//                 Click and Hold
//             </button>
//             {showLine && (
//                 <div 
//                     style={{
//                         marginTop: '10px',
//                         width: `${width}px`,
//                         height: '2px',
//                         backgroundColor: 'white',
//                         border: '1px solid white',
//                         transition: 'width 0.3s ease-out'
//                     }}
//                 ></div>
//             )}
//             {SelectedComponent && (
//                 <div style={{
//                     position: 'fixed',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     zIndex: 1000  // High z-index to ensure it overlays everything
//                 }}>
//                     <SelectedComponent />
//                 </div>
//             )}
//         </div>
//     );
// }

// export default ExLine;






// ********OG Button
// const ExLine = () => {
//     const [width, setWidth] = useState(0);
//     const [showLine, setShowLine] = useState(false); // State to determine if the line is visible
//     const expandingRef = useRef(false);
//     const stopRef = useRef(null);

//     const handleMouseDown = () => {
//         setShowLine(true); // Make the line visible when the button is held
//         expandingRef.current = true;
//         setWidth(0);
//         expandLine();
        
//         // Stop expanding after 4 seconds
//         stopRef.current = setTimeout(() => {
//             expandingRef.current = false;
//         }, 3000);
//     }

//     const handleMouseUp = () => {
//         setShowLine(false); // Hide the line once the button is released
//         expandingRef.current = false;
//         if (stopRef.current) {
//             clearTimeout(stopRef.current);
//         }
//         setWidth(0); // Reset the width of the line once the button is released
//     }

//     const expandLine = () => {
//         if (expandingRef.current) {
//             setWidth(prevWidth => prevWidth + 5);
//             setTimeout(expandLine, 50);
//         }
//     }

//     return (
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//             <button className="btn btn-dark" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
//                 Click and Hold
//             </button>
//             {showLine && (
//                 <div 
//                     style={{
//                         marginTop: '10px',
//                         width: `${width}px`,
//                         height: '2px',
//                         backgroundColor: 'white',
//                         border: '1px solid white',
//                         transition: 'width 0.3s ease-out'
//                     }}
//                 ></div>
//             )}
//         </div>
//     );
// }

// export default ExLine;
