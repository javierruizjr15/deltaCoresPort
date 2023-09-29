





import './assets/freyafalls/pixi.min.js';
import Vector from './assets/freyafalls/ZrvEEQ.js';
import './assets/freyafalls/ascii.min.js';

import HappyFreya from '../images/freyaFalls/FreyaH1k.png';
import Bones from '../images/freyaFalls/boneemoji200.png';
import DCLogo from '../images//freyaFalls/DCOGW75.png';
import Moon from '../images/freyaFalls/moon100.png';

const PIXI = window.PIXI;



export const FreyaFalls = () => {

let assets = {
    nauseated:  HappyFreya,
    // dragon:  HappyFreya,
    // green:      Bones,
    leafy:      Bones,
    trex:       DCLogo,
    snake:      Moon,
    // herb:       "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/herb_1f33f.png",
    // white:      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/white-heavy-check-mark_2705.png",
    // microbe:    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/microbe_1f9a0.png",
    // turtle:     "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/turtle_1f422.png",
    // lizard:     "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/lizard_1f98e.png",
    // evergreen:  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/evergreen-tree_1f332.png",
    // dragon:     "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/dragon-face_1f432.png",
    // // cactus:     "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/cactus_1f335.png",
    // // gloves:     "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/gloves_1f9e4.png",
    // // green:      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/green-heart_1f49a.png",
    // frog:       "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/frog-face_1f438.png",
    // crocodile:  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/crocodile_1f40a.png",
  //   flag:       "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/flag-for-cocos-islands_1f1e8-1f1e8.png",
  //   four:       "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/four-leaf-clover_1f340.png",
  //   broccoli:   "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/broccoli_1f966.png",
  //   black:      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/black-universal-recycling-symbol_267b.png"
  }


/*Copyright (c) 2023 by Liam Egan (https://codepen.io/shubniggurath/pen/zMBwbX)
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/


  
  const preload = PIXI.loader;
  const rate = 0.0001; // Particles per pixel per second
  const maxParticles = 2000;
  const stageBG = new PIXI.Graphics();
  let dimensions = new Vector(window.innerWidth, window.innerHeight);
  let gravity = new Vector(0, 1.);
  let pointer = new Vector(100, 100);
  let airFriction = .9;
  let app;
  let particles = [];
  let lastDelta = 0;
  let pointerdown = false;
  
  let clamp = function(number, min, max) {
    return Math.min(Math.max(number, min), max);
  };
  
  class Particle extends PIXI.Container {
    constructor() {
      super();
      
      var keys = Object.keys(preload.resources)
      let asset = preload.resources[keys[ keys.length * Math.random() << 0]];
      
      this.spriteContainer = new PIXI.Sprite(asset.texture);
      this.spriteContainer.anchor.x = .5;
      this.spriteContainer.anchor.y = .5;
      
      this.addChild(this.spriteContainer);
      
      this.scale.x = this.scale.y = Math.random() + .5;
      
      this.offset = Math.random() * 20000.;
      
      this.velocity = new Vector(0, 0);
      this.pos = new Vector(0, 0);
      
      this.pos = new Vector(Math.random() * dimensions.x, -this.height);
      
      this.rotationalVelocity = (Math.random() - .5) *.01;
      this.rotation = (Math.random() - .5) * Math.PI;
    }
    sim(delta) {
      this.velocity.add(gravity.multiplyScalarNew(this.scale.x * .3 + .3));
      this.velocity.x += Math.sin((delta+this.offset)*.002) * 5.5 * this.rotationalVelocity;
      
      if(pointerdown) {
        let pEffect = pointer.subtractNew(this.pos);
        let effect = clamp(1.-pEffect.length * .008, 0., 1.);
        this.velocity.subtract(pEffect.multiplyScalar(effect));
      }
      
      this.velocity.multiplyScalar(airFriction);
      this.pos = this.pos.add(this.velocity);
      this.rotation += this.rotationalVelocity;
      
      if(this.pos.y > dimensions.y + this.height) {
        this.pos = new Vector(Math.random() * dimensions.x, -this.height);
      }
    }
    
    set pos(val) {
      if(val instanceof Vector) {
        this._pos = val;
        this.position.x = val.x;
        this.position.y = val.y;
      }
    }
    get pos() {
      return this._pos || new Vector(0,0);
    }
  }
  
  for(const name in assets) {
    preload.add(name, assets[name]);
  }
  preload.load((loader, resources) => {
    app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor : 0x000000});
    
    stageBG.clear();
    stageBG.beginFill(0x000000);
    stageBG.drawRect(0, 0, dimensions.x, dimensions.y);
    
    app.stage.addChild(stageBG);
    // app.stage.filters = [new ascii(1), new BWFilter];
    app.stage.filters = [new BWFilter];
    document.body.appendChild(app.view);
    
    let runtime = function(delta) {
      if(particles.length < maxParticles) {
        const area = dimensions.area;
        const tick = rate * area / 1000;
  
        const flakeTime = delta - lastDelta;
        let num = flakeTime * tick;
        if(num >= 8) num = 8;
        if(num > 0) {
          for(let i = 0; i < num; i++) { 
            let p = new Particle();
            particles.push(p);
            app.stage.addChild(p);
          }
          lastDelta = delta;
        }
      }
      
      particles.forEach((particle) => {
        particle.sim(delta);
      });
      
      requestAnimationFrame(runtime);
    };
    
    requestAnimationFrame(runtime);
  
  });
  
  
  const shaderFrag = `
  precision mediump float;
    
  varying vec2 vTextureCoord;
  uniform float u_time;
  uniform sampler2D uSampler;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec2 dimensions;
  uniform vec4 filterArea;
  uniform bool u_mousedown;
  uniform float u_strength;
  
  // math const
  const float PI = 3.14159265359;
  const float DEG_TO_RAD = PI / 180.0;
  
  void main() {
    vec2 coord, uv, sample, mouse;
    uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
    mouse = (u_mouse.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
    sample = vTextureCoord;
  
    mouse.y *= -1.;
    mouse = uv - mouse + vTextureCoord*.0001;
  
    float mgrad =  clamp(sin(length(mouse) * 20. - u_time * 10.) * .5 + .5 *1. - length(mouse), 0., 1.);
  
    sample += (mgrad * u_strength) * .01;
  
    vec4 c = texture2D(uSampler, sample);
  
    float colour = c.r + c.g + c.b;
  
    // float mgrad = length((u_mouse - vTextureCoord) / dimensions);
  
    gl_FragColor = c;
    if(u_mousedown == true) {
      gl_FragColor.r += (1. - length(mouse * (sin(u_time * 3.) * .5 + .8) * 3.)) * u_strength;
    }
    // gl_FragColor = vec4(mgrad);
  }
  `;
  
  class BWFilter extends PIXI.Filter {
    constructor() {
      
      super(null, shaderFrag);
      this.uniforms.u_resolution = { type: "v2", value: { x:0, y:0 } };
      this.uniforms.u_mouse = { type: "v2", value: { x:0, y:0 } };
      this.uniforms.u_time = 0;
      this.uniforms.u_strength = 0;
      this.uniforms.u_mousedown = { type: "b", value: false };
      
      window.addEventListener('pointerdown', (e) => {
        this.uniforms.u_mousedown = true;
      });
      window.addEventListener('pointerup', (e) => {
        this.uniforms.u_mousedown = false;
      });
    }
    apply = function(filterManager, input, output)
    {
      let str = this.uniforms.u_strength;
      if(this.uniforms.u_mousedown === true) {
        str += .01;
      } else {
        str -= .01;
      }
      str = clamp(str, 0., 1.);
      this.uniforms.u_strength = str;
      this.uniforms.u_time += .01;
      this.uniforms.u_mouse.x = pointer.x;
      this.uniforms.u_mouse.y = pointer.y;
      this.uniforms.u_resolution.x = dimensions.x;
      this.uniforms.u_resolution.y = dimensions.y;
      this.uniforms.dimensions[0] = input.sourceFrame.width
      this.uniforms.dimensions[1] = input.sourceFrame.height
  
      // draw the filter...
      filterManager.applyFilter(this, input, output);
    }
  }
  
     // Add double-click event listener to navigate to /home page
     document.addEventListener('dblclick', function() {
      window.location.href = '/'; // Navigate to the / page
  });
  
  window.addEventListener('resize', (e)=> {
    dimensions = new Vector(window.innerWidth, window.innerHeight);
    app.renderer.resize(window.innerWidth, window.innerHeight);
  })
  
  window.addEventListener('pointerdown', (e) => {
    pointerdown = true;
    e.preventDefault();
  });
  window.addEventListener('pointerup', (e) => {
    pointerdown = false;
    e.preventDefault();
  });
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    e.preventDefault();
  });

};

export default FreyaFalls;