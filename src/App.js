import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import About from "./pages/about";
import Work from "./pages/work";
import Contact from "./pages/contact";
// import BackgroundSlider from "./components/backgroundSlider";
// import Tester from "./pages/tester";
import Platonics from "./components/platonics";
// import Polygon from "./components/polygon";
// import Carousel from "./components/carousel";
import RefractedRays from "./components/refractedRays";
import RotationalSpaceMod from "./components/rotationalSpaceMod";
// import FreyaFalls from "./components/freyaFalls.js";
// import ReactionWaves from "./components/reactionWaves";
// import Pokeballs from "./components/infinitePokeballs";
import Freymoji from "./components/freymoji";
import ExLine from "./components/exLine";
// import "./components/sphereShader";
import RefractedRaysPage from "./pages/refractedRaysPage";
import FreymojiPage from "./pages/freymojiPage";
import SpaceModePage from "./pages/spaceModPage";

const App = () => {
  return (
    <>
      {/* <BackgroundSlider> */}
        <Routes>
          {/* <Route path="/carousel" element={<Carousel />} />  */}
          {/* <Route path="/polygon" element={<Polygon />} />  */}
          {/* <Route path="/sphereshader" element={<SphereShader />} />  */}
          <Route path="/spacemodpage" element={<SpaceModePage />} /> 
          <Route path="/freymojipage" element={<FreymojiPage />} /> 
          <Route path="/rayspage" element={<RefractedRaysPage />} /> 
          <Route path="/platonics" element={<Platonics />} /> 
          {/* <Route path="/tester" element={<Tester />} />  */}
          <Route path="/exline" element={<ExLine />} /> 
          <Route path="/freymoji" element={<Freymoji />} /> 
          {/* <Route path="/pokeballs" element={<Pokeballs />} />  */}
          {/* <Route path="/reactionwaves" element={<ReactionWaves />} />  */}
          {/* <Route path="/freyafalls" element={<FreyaFalls />} />  */}
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
