import React from "react";
import '../index.css';
import trippyPlanet from "../images/trippyplanet.png";
import freyaEarth from "../images/FreyaEarth.png";
import freyaPinkFloyd from "../images/FreyaPinkFloyd3.png";



const Carousel = () => {

    return (
        <>
        <div className="carousel-conatiner">

            
            <div id="carouselExampleIndicators" className="carousel slide" data-ride="false">
                <ol className="carousel-indicators">
                    <li data-target="#carouselExampleIndicators" data-slide-to="0" className="active"></li>
                    <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
                    <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
                </ol>
                <div className="carousel-inner">
                    <div className="carousel-item active">
                    <img className="d-block w-100" src={ trippyPlanet } alt="First slide" />
                    <div className="carousel-caption d-none d-md-block">
                        <h5>Trippy Planet</h5>
                    </div>
                    </div>
                    <div className="carousel-item">
                    <img className="d-block w-100" src={ freyaEarth } alt="Second slide" />
                    <div className="carousel-caption d-none d-md-block">
                        <h5>Freya Earth</h5>
                    </div>
                    </div>
                    <div className="carousel-item">
                    <img className="d-block w-100" src={ freyaPinkFloyd } alt="Third slide" />
                    <div className="carousel-caption d-none d-md-block">
                        <h5>Freya Pink Floyd</h5>
                    </div>
                    </div>
                </div>
                <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="sr-only">Previous</span>
                </a>
                <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="sr-only">Next</span>
                </a>
            </div>


        </div>
        </>
    )
}

export default Carousel;