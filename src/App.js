import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import About from "./pages/about";
import Work from "./pages/work";
import Contact from "./pages/contact";
// import BackgroundSlider from "./components/backgroundSlider";
// import Tester from "./pages/tester";
// import Platonics from "./components/platonics";
// import Polygon from "./components/polygon";
// import Carousel from "./components/carousel";
import RefractedRays from "./components/refractedRays";
import RotationalSpaceMod from "./components/rotationalSpaceMod";
import FreyaFalls from './components/freyaFalls.js';
import ReactionWaves from "./components/reactionWaves";

const App = () => {
  return (
    <>
      {/* <BackgroundSlider> */}
        <Routes>
          {/* <Route path="/carousel" element={<Carousel />} />  */}
          {/* <Route path="/polygon" element={<Polygon />} />  */}
          {/* <Route path="/platonics" element={<Platonics />} />  */}
          {/* <Route path="/tester" element={<Tester />} />  */}
          <Route path="/reactionwaves" element={<ReactionWaves />} /> 
          <Route path="/freyafalls" element={<FreyaFalls />} /> 
          <Route path="/refractedrays" element={<RefractedRays />} /> 
          <Route path="/rotationalspacemod" element={<RotationalSpaceMod />} /> 
          <Route path="/" element={<Home />} /> 
          <Route path="/about" element={<About />} /> ß
          <Route path="/work" element={<Work />} /> 
          <Route path="/contact" element={<Contact />} /> 
        </Routes>
      {/* </BackgroundSlider> */}
    </>
  )
}

export default App;
