import React, { Component } from 'react';

class BackgroundSlider extends Component {
    state = {
        activeIndex: 0,
    };

    images = [
        '/textures/_bg_grain_01.jpg',
        '/textures/_bg_grain_02.jpg',
        '/textures/_bg_grain_03.jpg',
    ];

    componentDidMount() {
        this.interval = setInterval(this.changeImage, 100); //change every x seconds
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    changeImage = () => {
        this.setState(prevState => ({
            activeIndex: (prevState.activeIndex + 1) % this.images.length,
        }));
    };

    render() {
        const { activeIndex } = this.state;
        const backgroundImageStyle = {
            backgroundImage: `url(${this.images[activeIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100vw',
            height: '100vh',
        };

        const { children } = this.props;

        return (
            <div className="background-slider" style={backgroundImageStyle} >
                {children}
            </div>
        ) 
    }
}

export default BackgroundSlider;