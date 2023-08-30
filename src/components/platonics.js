import React, { useEffect, useRef } from 'react';
import { Vec2, Vec3, Mat2, Mat3, Mat4, Quat } from 'https://cdn.skypack.dev/wtc-math';
import gifJs from 'https://cdn.skypack.dev/gif.js';
import '../index.css';

/* Copyright (c) 2023 by Liam Egan (https://codepen.io/shubniggurath/pen/yLbePvp)
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/



// vertex shader
const VERTEX_SHADER = `
  attribute vec4 a_position;    
  uniform mat4 u_modelViewMatrix;
  uniform mat4 u_projectionMatrix;
      
  void main() {
    gl_Position = a_position;
  }
`;

// fragment shader
const FRAGMENT_SHADER = `
#extension GL_EXT_shader_texture_lod : enable
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform sampler2D u_noise;

uniform vec2 u_cam;

uniform samplerCube u_environment;

/* Raymarching constants */
/* --------------------- */
const float MAX_TRACE_DISTANCE = 8.;             // max trace distance
const float INTERSECTION_PRECISION = 0.001;       // precision of the intersection
const int NUM_OF_TRACE_STEPS = 100;               // max number of trace steps
const float STEP_MULTIPLIER = .8;                 // the step mutliplier - ie, how much further to progress on each step

/* Structures */
/* ---------- */
struct Camera {
  vec3 ro;
  vec3 rd;
  vec3 forward;
  vec3 right;
  vec3 up;
  float FOV;
};
struct Surface {
  float len;
  vec3 position;
  vec3 colour;
  float id;
  float steps;
  float AO;
};
struct Model {
  float dist;
  vec3 colour;
  float id;
};

vec2 getScreenSpace() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
  
  return uv;
}

float easeInOutCubic(float d) {
  if (d < 0.5) return 4. * pow(d, 3.);
  return 1. - pow(-2. * d + 2., 3.) * .5;
}
float easeInOutExpo(float k) {
  if(k == 0.) return 0.;
  if(k == 1.) return 1.;
  k *= 2.;
  if(k < 1.) return .5 * pow(1024., k - 1.);
  return .5 * ( -pow(2., -10. * (k - 1.)) + 2. );
}

/*--------------------------------
/  Modelling
/ -------------------------------- */
float smin(float a, float b, float k) {
    float res = exp(-k*a) + exp(-k*b);
    return -log(res)/k;
}

mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

float udBox( vec3 p, vec3 b ) {
  return length(max(abs(p)-b,0.0));
}

float t = 0.;
Model model(vec3 p) {
  float d = length(p) - .2;
  // vec3 colour = vec3(1,0,0);
  
  d = 100.;
  vec3 colour2 = vec3(0);
  vec3 colour1 = vec3(0);
  vec3 colour = vec3(1);
  
  vec3 pos1, pos2 = vec3(0,0,0);
  vec3 endpos1 = vec3(-.25, 0, 0);
  vec3 endpos2 = vec3(.25, 0, 0);
  
  pos1 = mix(vec3(0), endpos1, t);
  pos2 = mix(vec3(0), endpos2, t);
  
  vec3 _p = p;
  
  for(float i = 0.; i < 3.; i++) {
    vec3 c;
    vec3 pos = vec3(0);
    if(i == 1.) {
      pos = pos1;
      c = colour2;
    }
    if(i == 2.) {
      pos = pos2;
      c = colour1;
    }
    p = _p + pos;
    float t5 = u_time / 5. * (i + 1.);
    p = (rotationMatrix(vec3(cos(t5), sin(t5), .5), u_time / 3. ) * vec4(p, 1.)).xyz;
    if(d == 100.) {
      d = udBox(p, vec3(.1));
    } else {
      float d1 = udBox(p, vec3(.1));
      float ddiff = (d1 - d)/d1;
      d = smin(d, d1, mix(90., 20., t));
      colour = mix(c, colour, smoothstep(0., 1., ddiff * .7)); // This mixes the colours together based on the gradient produced by the smin
    }
  }
  
  return Model(d, colour, 1.);
}
Model map( vec3 p ){
  return model(p);
}

Surface calcIntersection( in Camera cam ){
  float h =  INTERSECTION_PRECISION*2.0;
  float rayDepth = 0.0;
  float hitDepth = -1.0;
  float id = -1.;
  float steps = 0.;
  float ao = 0.;
  vec3 position;
  vec3 colour;

  for( int i=0; i< NUM_OF_TRACE_STEPS ; i++ ) {
    if( abs(h) < INTERSECTION_PRECISION || rayDepth > MAX_TRACE_DISTANCE ) break;
    position = cam.ro+cam.rd*rayDepth;
    Model m = map( position );
    h = m.dist;
    rayDepth += h * STEP_MULTIPLIER;
    id = m.id;
    steps += 1.;
    ao += max(h, 0.);
    colour = m.colour;
  }

  if( rayDepth < MAX_TRACE_DISTANCE ) hitDepth = rayDepth;
  if( rayDepth >= MAX_TRACE_DISTANCE ) id = -1.0;

  return Surface( hitDepth, position, colour, id, steps, ao );
}
Camera getCamera(in vec2 uv, in vec3 pos, in vec3 target) {
  vec3 forward = normalize(target - pos);
  vec3 right = normalize(vec3(forward.z, 0., -forward.x));
  vec3 up = normalize(cross(forward, right));
  
  float FOV = .6;
  
  return Camera(
    pos,
    normalize(forward + FOV * uv.x * right + FOV * uv.y * up),
    forward,
    right,
    up,
    FOV
  );
}


float softshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax ) {
  float res = 1.0;
  float t = mint;
  for( int i=0; i<16; i++ ) {
    float h = map( ro + rd*t ).dist;
    res = min( res, 8.0*h/t );
    t += clamp( h, 0.02, 0.10 );
    if( h<0.001 || t>tmax ) break;
  }
  return clamp( res, 0.0, 1.0 );
}
float calcAO( in vec3 pos, in vec3 nor ) {
  float occ = 0.0;
  float sca = 1.0;
  for( int i=0; i<5; i++ )
  {
    float hr = 0.01 + 0.12*float(i)/4.0;
    vec3 aopos =  nor * hr + pos;
    float dd = map( aopos ).dist;
    occ += -(dd-hr)*sca;
    sca *= 0.95;
  }
  return clamp( 1.0 - 3.0*occ, 0.0, 1.0 );    
}
// This is here to provide a fallback for devices that don't support GL_EXT_shader_texture_lod
vec4 cubeTexture(samplerCube map, vec3 uv, float lod) {
  #ifdef GL_EXT_shader_texture_lod
  return textureCubeLodEXT(map, uv, lod);
  #endif
  return textureCube(map, uv);
}
vec3 shade(Surface surface, vec3 nor, vec3 ref, Camera cam) {
  
  vec3 col = surface.colour;
  vec3 pos = surface.position;
  
  vec3 I = normalize(pos - cam.ro);
  vec3 R = reflect(I, nor);
  vec3 reflection = cubeTexture(u_environment, R, 5.).rgb;
  // reflection *= 0.;
  // col = reflection;
  // lighitng        
  float occ = 1./surface.AO;
  vec3  lig = normalize( vec3(-0.6, 0.7, -0.) );
  float amb = clamp( 0.5+0.5*nor.y, 0.0, 1.0 );
  float dif = clamp( dot( nor, lig ), 0.0, 1.0 );
  float bac = clamp( dot( nor, normalize(vec3(-lig.x,0.0,-lig.z))), 0.0, 1.0 )*clamp( 1.0-pos.y,0.0,1.0);
  // float dom = smoothstep( -0.1, 0.1, ref.y );
  float fre = pow( clamp(1.0+dot(nor,cam.rd),0.0,1.0), 2.0 );
  float spe = pow(clamp( dot( ref, lig ), 0.0, 1.0 ),4.0);

  // dif *= softshadow( pos, lig, 0.02, 2.5 );
  //dom *= softshadow( pos, ref, 0.02, 2.5 );

  vec3 lin = vec3(0.0);
  lin += 1.20*dif*vec3(.95,0.80,0.60);
  lin += 1.20*spe*vec3(1.00,0.85,0.55)*dif;
  lin += 0.80*amb*vec3(0.50,0.70,.80)*occ;
  //lin += 0.30*dom*vec3(0.50,0.70,1.00)*occ;
  lin += 0.30*bac*vec3(0.25,0.25,0.25)*occ;
  lin += 0.20*fre*vec3(1.00,1.00,1.00)*occ;
  col = col*lin;
  
  col += reflection * .5;

  return col;
}

// Calculates the normal by taking a very small distance,
// remapping the function, and getting normal for that
vec3 calcNormal( in vec3 pos ){
  vec3 eps = vec3( 0.001, 0.0, 0.0 );
  vec3 nor = vec3(
    map(pos+eps.xyy).dist - map(pos-eps.xyy).dist,
    map(pos+eps.yxy).dist - map(pos-eps.yxy).dist,
    map(pos+eps.yyx).dist - map(pos-eps.yyx).dist );
  return normalize(nor);
}

vec3 render(Surface surface, Camera cam, vec2 uv) {
  vec3 colour = vec3(.4,.4,.45);
  vec3 colourB = vec3(.1, .1, .1);
  
  colour = mix(colourB, colour, smoothstep(1., 0., (length(uv) - surface.steps/100.) * (1.+smoothstep(-1., -1.5, -abs(cam.ro.z))*.5)));
  
  // colour = mix(vec3(.5,0,.3), vec3(0,.5,0), smoothstep(-1., -1.5, cam.ro.z))+surface.steps/100.;
  
  // colour -= texture2D(u_noise, uv).rgb;
  
  if (surface.id == 1.){
    vec3 surfaceNormal = calcNormal( surface.position );
    vec3 ref = reflect(cam.rd, surfaceNormal);
    colour = surfaceNormal;
    colour = shade(surface, surfaceNormal, ref, cam);
  }

  return colour;
}

void main() {
  vec2 uv = getScreenSpace();
  
  t = easeInOutExpo( smoothstep(0., 1., sin(u_time * .25) * 2.) );
  
  float camd = mix(.8, 1.5, t);
  
  float c = cos(u_cam.x);
  float s = sin(u_cam.x);
  mat3 xrot = mat3(
    c, 0, s,
    0, 1, 0,
    -s, 0, c
  );
  // c = cos(u_cam.y);
  // s = sin(u_cam.y);
  // mat3 yrot = mat3(
  //   1, 0, 0,
  //   0, c, -s,
  //   0, s, c
  // );
  // xrot *= yrot;
  
  vec3 campos = vec3( 0, 0, camd ) * xrot;
  // campos += vec3( 0, cos(u_cam.y)*camd, sin(u_cam.y)*camd );
  
  // Camera cam = getCamera(uv, mix(vec3(0,0,-.8), vec3(0,0,-1.5), t), vec3(0));
  // Camera cam = getCamera(uv, vec3(0.,0.,1.25), vec3(0, 0, 0));
  Camera cam = getCamera(uv, campos, vec3(0));
  
  Surface surface = calcIntersection(cam);
  
  gl_FragColor = vec4(render(surface, cam, uv), 1.);
  // gl_FragColor = vec4(vec3(surface.steps/100.), 1.);
}
`;

const Platonics = ({ children }) => {

    
    console.clear();
    
    // Determine whether a number is a power of 2
    function powerOf2(v) {
      return v && !(v & (v - 1));
    }
    // Return the next greatest power of 2
    function nextPow2( v ) {
      v--;
      v |= v >> 1;
      v |= v >> 2;
      v |= v >> 4;
      v |= v >> 8;
      v |= v >> 16;
      v++;
      return v;
    }
    // Update a provided image to the nearest power of 2 in size.
    const pow2Image = (c) => {
      const newWidth = powerOf2(c.width) ? c.width : nextPow2(c.width);
      const newHeight = powerOf2(c.height) ? c.height : nextPow2(c.height);
      const _c = document.createElement('canvas');
      const ctx = _c.getContext('2d');
      _c.width = newWidth;
      _c.height = newHeight;
      ctx.drawImage(c, 0, 0, newWidth, newHeight);
      return _c;
    }
    const asyncImageLoad = function(img, src) {
      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      })
    }
    const glEnumToString = (function() {
      const haveEnumsForType = {};
      const enums = {};
    
      function addEnums(gl) {
        const type = gl.constructor.name;
        if (!haveEnumsForType[type]) {
          for (const key in gl) {
            if (typeof gl[key] === 'number') {
              const existing = enums[gl[key]];
              enums[gl[key]] = existing ? `${existing} | ${key}` : key;
            }
          }
          haveEnumsForType[type] = true;
        }
      }
    
      return function glEnumToString(gl, value) {
        addEnums(gl);
        return enums[value] || (typeof value === 'number' ? `0x${value.toString(16)}` : value);
      };
    }());
    const addExtensions = (ctx) => {
      // Set up the extensions
      ctx.getExtension('OES_standard_derivatives');
      ctx.getExtension('EXT_shader_texture_lod');
      ctx.getExtension('OES_texture_float');
      ctx.getExtension('WEBGL_color_buffer_float');
      ctx.getExtension('OES_texture_float_linear');
      ctx.getExtension('EXT_color_buffer_float');
    }
    function createContext(c, opt_attribs, params) {
      const ctx = c.getContext("webgl", params) || this._el.getContext("experimental-webgl", params);
      
      addExtensions(ctx);
      
      return ctx;
    }
    
    const quatToMat4 = (q) => {
        if(q.array) q = q.array; // This just transforms a provided vector into to an array.
        
        if(q instanceof Array && q.length >= 4) {
          const [x, y, z, w] = q;
          const [x2, y2, z2] = q.map(x => x * 2.);
          
          const xx = x * x2,
                yx = y * x2,
                yy = y * y2,
                zx = z * x2,
                zy = z * y2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2;
          
          return new Mat4(
            1 - yy -zz, yx -wz, zx + wy, 0, 
            yx + wz, 1 - xx - zz, zy - wx, 0, 
            zx - wy, zy + wx, 1 - xx - yy, 0,
            0, 0, 0, 1
          );
        }
      }
    
    class Renderer {
      static #defaultOptions = {
        width: 512,
        height: 512,
        pxRatio: Math.min(window.devicePixelRatio, 2),
        clearing: true,
        depthTesting: true,
        premultipliedAlpha: true
      }
        
      static BLENDING_DEBUG      = -1;
      static BLENDING_NORMAL      = 1;
      static BLENDING_ADDITIVE    = 2;
      static BLENDING_SUBTRACTIVE = 4;
      static BLENDING_MULTIPLY    = 8;
      static BLENDING_OFF         = 16;
    
      isWebgl2 = false;
    
      #blending;
      #blendingEnabled = false;
      #buffers = [];
    
      constructor(canvas, options) {
        options = Object.assign({}, Renderer.#defaultOptions, options);
        this.width = options.width;
        this.height = options.height;
        this.pxRatio = options.pxRatio;
        this.clearing = options.clearing;
        this.depthTesting = options.depthTesting;
        this.canvas = canvas || document.createElement('canvas');
        this.canvas.width = this.width * this.pxRatio;
        this.canvas.height = this.height * this.pxRatio;
        this.premultipliedAlpha = options.premultipliedAlpha;
        
        this.ctx = this.canvas.getContext("webgl", options) || this.canvas.getContext("experimental-webgl", options);
        
        this.ctx.viewportWidth = this.canvas.width;
        this.ctx.viewportHeight = this.canvas.height;
        
        this.uniformResolution = new Uniform(this.ctx, 'resolution', Uniform.TYPE_V2, [this.canvas.width, this.canvas.height]);
        
        this.addExtensions();
      }
      resize(w, h, ratio) {
        this.width = w;
        this.height = h;
        this.pxRatio = ratio || this.pxRatio;
        this.canvas.width = this.width * this.pxRatio;
        this.canvas.height = this.height * this.pxRatio;
        
        this.ctx.viewportWidth = this.canvas.width;
        this.ctx.viewportHeight = this.canvas.height;
        
        this.uniformResolution = new Uniform(this.ctx, 'resolution', Uniform.TYPE_V2, [this.canvas.width, this.canvas.height]);
      }
      setViewport(dimensions) {
        let w = this.width*this.pxRatio;
        let h = this.height*this.pxRatio;
        if(dimensions) {
          w = dimensions[0];
          h = dimensions[1];
        }
        this.ctx.viewport(0, 0, w, h);
        this.uniformResolution = new Uniform(this.ctx, 'resolution', Uniform.TYPE_V2, [w, h]);
      }
      addExtensions() {
        this.ctx.getExtension('OES_standard_derivatives');
        this.ctx.getExtension('EXT_shader_texture_lod');
        this.ctx.getExtension('OES_texture_float');
        this.ctx.getExtension('WEBGL_color_buffer_float');
        this.ctx.getExtension('OES_texture_float_linear');
        this.ctx.getExtension('EXT_color_buffer_float');
      }
      linkBuffer(buffer) {
        let hasBuffer = false;
        this.#buffers.forEach((b) => {
          if(buffer === b) hasBuffer = true;
        });
        if(!hasBuffer) {
          this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buffer.buffer);
          this.ctx.bufferData(
            this.ctx.ARRAY_BUFFER,
            buffer.data,
            buffer.drawType);
        }
        buffer.link(this.currentProgram.program);
      }
      setupProgram(program, buffers, attributes, uniforms) {
        this.currentProgram = program;
        this.ctx.useProgram(program.program);
        
        this.premultiplied = program.premultiplied;
        
        this.depthTesting = program.depthTesting;
        
        
        if(program.blending === Program.BLENDING_NORMAL && program.transparent === false ) {
          this.blending = Program.BLENDING_OFF;
        } else {
          this.blending = program.blending;
        }
        
        this.clearColour = program.clearColour;
        const a = this.clearColour[3];
        // console.log('prem', this.premultipliedAlpha)
        if(this.premultipliedAlpha) this.clearColour = this.clearColour.map((c, i) => c * a );
        
        this.ctx.clearColor(...this.clearColour);
        
        // TODO: Unlink unused buffers during this setup phase as well.
        buffers.forEach(buffer => {
          this.linkBuffer(buffer);
        });
          
        // this.ctx.enable(ctx.DEPTH_TEST);
        if(this.depthTesting) this.ctx.enable(ctx.DEPTH_TEST);
        else this.ctx.disable(ctx.DEPTH_TEST);
        
        uniforms.forEach(uniform => {
          uniform.bind(program.program);
        });
        this.uniformResolution.bind(program.program);
      }
      render(points, buffer) {
        this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, buffer?.fb || null);
        if(this.clearing) {
          this.ctx.clear( this.ctx.COLOR_BUFFER_BIT );
          
          if(this.depthTesting) this.ctx.clear( this.ctx.DEPTH_BUFFER_BIT );
        }
        switch(this.currentProgram.renderType) {
          case Program.RENDER_TRIANGLES: 
            this.ctx.drawArrays(this.ctx.TRIANGLES, 0, points);
            break;
          case Program.RENDER_STRIP: 
            this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, points);
            break;
          case Program.RENDER_LINES: 
            this.ctx.drawArrays(this.ctx.LINE_STRIP, 0, points);
            break;
          case Program.RENDER_LINELOOP: 
            this.ctx.drawArrays(this.ctx.LINE_LOOP, 0, points);
            break;
          case Program.RENDER_POINTS: 
            this.ctx.drawArrays(this.ctx.POINTS, 0, points);
            break;
        }
        
      }
    
      /* SETTERS AND GETTERS */
      get blending() {
        return this.#blending || Program.BLENDING_NORMAL;
      }
      set blending(blending) {
        
        if(blending === Renderer.BLENDING_DEBUG) {
          
          if(!this.breakLog) {
            console.log(blending, Renderer.BLENDING_OFF, this.premultiplied)
            this.breakLog = true;
          }
          this.#blending = blending;
          this.ctx.enable(this.ctx.BLEND);
            this.ctx.blendFuncSeparate( this.ctx.ONE, this.ctx.ONE_MINUS_SRC_ALPHA, this.ctx.ONE, this.ctx.ONE_MINUS_SRC_ALPHA );
          return;
        }
        
        this.#blending = blending;
        if(blending === Renderer.BLENDING_OFF) {
          this.ctx.disable(this.ctx.BLEND);
          this.#blendingEnabled = false;
          return;
        }
            if ( this.#blendingEnabled === false ) {
          this.ctx.enable(this.ctx.BLEND);
          // this.ctx.alphaFunc(this.ctx.GL_GREATER, 0.5);
          // this.ctx.enable(this.ctx.GL_ALPHA_TEST);
                this.#blendingEnabled = true;
            }
        
            if( this.premultiplied ) {
          switch (this.blending) {
            case Renderer.BLENDING_NORMAL:
              this.ctx.blendFuncSeparate( this.ctx.ONE, this.ctx.ONE_MINUS_SRC_ALPHA, this.ctx.ONE, this.ctx.ONE_MINUS_SRC_ALPHA );
              break;
            case Renderer.BLENDING_ADDITIVE: 
              this.ctx.blendFunc( this.ctx.ONE, this.ctx.ONE );
              break;
            case Renderer.BLENDING_SUBTRACTIVE: 
              this.ctx.blendFuncSeparate( this.ctx.ZERO, this.ctx.ZERO, this.ctx.ONE_MINUS_SRC_COLOR, this.ctx.ONE_MINUS_SRC_ALPHA );
              break;
            case Renderer.BLENDING_MULTIPLY:
              this.ctx.blendFuncSeparate( this.ctx.ZERO, this.ctx.SRC_COLOR, this.ctx.ZERO, this.ctx.SRC_ALPHA );
              break;
          }
        } else {
          switch (this.blending) {
            case Renderer.BLENDING_NORMAL: 
              this.ctx.blendFuncSeparate( this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA, this.ctx.ONE, this.ctx.ONE_MINUS_SRC_ALPHA );
              break;
            case Renderer.BLENDING_ADDITIVE: 
              this.ctx.blendFunc( this.ctx.SRC_ALPHA, this.ctx.ONE );
              break;
            case Renderer.BLENDING_SUBTRACTIVE: 
              this.ctx.blendFunc( this.ctx.ZERO, this.ctx.ONE_MINUS_SRC_COLOR );
              break;
            case Renderer.BLENDING_MULTIPLY:
              this.ctx.blendFunc( this.ctx.ZERO, this.ctx.SRC_COLOR );
              break;
          }
        }
      }
    }
    class Buffer {
      static #defaultAttribute = {
            numComponents: 2,
            offset: 0,
            stride: 0
          };
      static #defaults = {
        attributes: [{
            name: 'position'
          }
        ],
        normalized: false,
        drawType: window.WebGLRenderingContext.STATIC_DRAW,
        type: window.WebGLRenderingContext.FLOAT
      }
      constructor(ctx, data, options) {
        this.ctx = ctx;
        // eslint-disable-next-line no-restricted-globals
        this.name = name;
        options = Object.assign({}, Buffer.#defaults, options);
        this.attributes = options.attributes.map(a => Object.assign({}, Buffer.#defaultAttribute, a));
        
        this.normalized = options.normalized;
        this.drawType = options.drawType;
        this.type = options.type;
        if(data instanceof Array) data = new Float32Array(data);
        this.data = data;
        this.buffer = ctx.createBuffer();
      }
    
      link(program, hasBuffer = false) {
        let location = this.ctx.getAttribLocation(program, `a_${this.name}`);
        
        this.attributes.forEach(attribute => {
          const location = this.ctx.getAttribLocation(program, `a_${attribute.name}`);
          this.ctx.vertexAttribPointer(location, attribute.numComponents, this.type, this.normalized, attribute.stride, attribute.offset);
          this.ctx.enableVertexAttribArray(location);
        });
      }
    
      get length() {
        return this.data.length;
      }
    }
    class Program {
      
      static RENDER_TRIANGLES     = 0;
      static RENDER_STRIP         = 1;
      static RENDER_LINES         = 2;
      static RENDER_LINELOOP      = 4;
      static RENDER_POINTS        = 8;
      
      static #defaultOptions = {
        renderType: Program.RENDER_TRIANGLES,
        clearColour: [1.0, 1.0, 1.0, 1.0],
        blending: Renderer.BLENDING_OFF,
        premultiplied: true,
        transparent: false,
        depthTesting: true
      }
      
      #vShader
      #fShader
      #p
      #renderType
      
      constructor(ctx, vertexShaderSource, fragmentShaderSource, options = {}) {
        options = Object.assign({}, Program.#defaultOptions, options);
        
        this.ctx = ctx;
        
        this.renderType = options.renderType;
        
        this.clearColour = options.clearColour;
        this.blending = options.blending;
        this.premultiplied = options.premultiplied;
        this.transparent = options.transparent;
        this.depthTesting = options.depthTesting;
        
        // Create the shaders
        this.vShader = Program.createShaderOfType(this.ctx, this.ctx.VERTEX_SHADER, vertexShaderSource);
        this.fShader = Program.createShaderOfType(this.ctx, this.ctx.FRAGMENT_SHADER, fragmentShaderSource);
        
        // Create the program and link the shaders
        this.#p = this.ctx.createProgram();
        this.ctx.attachShader(this.#p, this.vShader);
        this.ctx.attachShader(this.#p, this.fShader);
        
        this.ctx.linkProgram(this.#p);
        
        // Check the result of linking
        var linked = this.ctx.getProgramParameter(this.#p, this.ctx.LINK_STATUS);
        if (!linked) {
          var error = this.ctx.getProgramInfoLog(this.#p);
          console.log('Failed to link program: ' + error);
          this.ctx.deleteProgram(this.#p);
          this.ctx.deleteShader(this.fShader);
          this.ctx.deleteShader(this.vShader);
        }
      }
      
      get program() {
        return this.#p;
      }
    
      /* SETTERS AND GETTERS */
    
      set renderType(value) {
        if([
          Program.RENDER_TRIANGLES,
          Program.RENDER_STRIP,
          Program.RENDER_LINES,
          Program.RENDER_LINELOOP,
          Program.RENDER_POINTS
        ].indexOf(value) > -1) this.#renderType = value;
      }
      get renderType() {
        return this.#renderType;
      }
      
      /**
       * Static Methods
       */
    
        /**
         * Create a shader of a given type given a context, type and source.
         *
       * @static
         * @param  {WebGLContext} ctx The context under which to create the shader
         * @param  {WebGLShaderType} type The shader type, vertex or fragment
         * @param  {string} source The shader source.
         * @return {WebGLShader} The created shader
         */
      static createShaderOfType(ctx, type, source) {
        const shader = ctx.createShader(type);
        ctx.shaderSource(shader, source);
        ctx.compileShader(shader);
        
        // Check the compile status
        const compiled = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);
        if (!compiled) {
          // Something went wrong during compilation; get the error
          const lastError = ctx.getShaderInfoLog(shader);
          console.error(`${Program.addLineNumbersWithError(source, lastError)}\nError compiling ${glEnumToString(ctx, type)}: ${lastError}`);
          ctx.deleteShader(shader);
          return null;
        }
        
        return shader;
      }
      static addLineNumbersWithError(src, log = '') {
        console.log(src)
        const errorRE = /ERROR:\s*\d+:(\d+)/gi;
        // Note: Error message formats are not defined by any spec so this may or may not work.
        const matches = [...log.matchAll(errorRE)];
        const lineNoToErrorMap = new Map(matches.map((m, ndx) => {
          const lineNo = parseInt(m[1]);
          const next = matches[ndx + 1];
          const end = next ? next.index : log.length;
          const msg = log.substring(m.index, end);
          return [lineNo - 1, msg];
        }));
        return src.split('\n').map((line, lineNo) => {
          const err = lineNoToErrorMap.get(lineNo);
          return `${lineNo + 1}: ${line}${err ? `\n\n^^^ ${err}` : ''}`;
        }).join('\n');
      }
    }
    class Uniform {
      static TYPE_INT = 0
      static TYPE_FLOAT = 1
      static TYPE_V2 = 2
      static TYPE_V3 = 3
      static TYPE_V4 = 4
      static TYPE_BOOL = 5
      static TYPE_M2 = 6
      static TYPE_M3 = 7
      static TYPE_M4 = 8
      
      #prefix = 'u'
      
      constructor(ctx, name, type, value) {
        this.ctx = ctx;
        this.name = name;
        this.type = type;
        this.value = value;
      }
      
      prebind() {
        
      }
      
      bind(program) {
        this.prebind(program);
        const location = this.ctx.getUniformLocation(program, `${this.#prefix}_${this.name}`);
        switch(this.type) {
          case Uniform.TYPE_INT : 
            if(!isNaN(this.value)) this.ctx.uniform1i( location, this.value );
            break;
          case Uniform.TYPE_FLOAT : 
            if(!isNaN(this.value)) this.ctx.uniform1f( location, this.value);
            break;
          case Uniform.TYPE_V2 : 
            if(this.value instanceof Array && this.value.length === 2.) this.ctx.uniform2fv( location, this.value);
            break;
          case Uniform.TYPE_V3 : 
            if(this.value instanceof Array && this.value.length === 3.) this.ctx.uniform3fv( location, this.value);
            break;
          case Uniform.TYPE_V4 : 
            if(this.value instanceof Array && this.value.length === 4.) this.ctx.uniform4fv( location, this.value);
            break;
          case Uniform.TYPE_BOOL : 
            if(!isNaN(this.value)) this.ctx.uniform1i( location, this.value);
            break;
          case Uniform.TYPE_M2 : 
            if(this.value instanceof Array && this.value.length === 4.) this.ctx.uniformMatrix2fv( location, false, this.value);
          case Uniform.TYPE_M3 : 
            if(this.value instanceof Array && this.value.length === 9.) this.ctx.uniformMatrix3fv( location, false, this.value);
          case Uniform.TYPE_M4 : 
            if(this.value instanceof Array && this.value.length === 16.) this.ctx.uniformMatrix4fv( location, false, this.value);
            break;
        }
      }
    }
    class Texture extends Uniform {
      #prefix = 's'
      static #defaultOptions = {
        textureType: 0,
        minFilter: window.WebGLRenderingContext.LINEAR,
        magFilter: window.WebGLRenderingContext.LINEAR,
        makePowerOf2: false,
        generateMipMap: false,
        textureTarget: window.WebGLRenderingContext.TEXTURE_2D
      }
      static masteri = 0
      
      static IMAGETYPE_REGULAR = 0
      static IMAGETYPE_TILE = 1
      static IMAGETYPE_MIRROR = 2
      
      constructor(ctx, name, options) {
        super(ctx, name, 0, null);
        options = Object.assign({}, Texture.#defaultOptions, options);
        this.textureType = options.textureType;
        this.minFilter = options.minFilter;
        this.magFilter = options.magFilter;
        this.makePowerOf2 = options.makePowerOf2;
        this.generateMipMap = options.generateMipMap;
        this.url = options.url;
        this.data = options.data;
        this.value = Texture.masteri++;
        this.textureTarget = options.textureTarget;
      }
      async preload() {
        const store = {};
    
        const img = new Image();
        img.crossOrigin = "anonymous";
    
        await asyncImageLoad(img, this.url);
        
        if(this.makePowerOf2) this.image = pow2Image(img);
        else this.image = img;
    
        // this.loadTexture(gl, n, store);
        return this;
      }
      
      prebind(program) {
        // Just an initialisation optimisation here.
        // Hopefully this works
        if(this.currentProgram === program) return;
        this.currentProgram = program;
        
        if(this.textureTarget == window.WebGLRenderingContext.TEXTURE_CUBE_MAP) {
          this.ctx.activeTexture(this.ctx.TEXTURE0 + this.value);
          // Create a texture.
          var tex = this.ctx.createTexture();
          this.ctx.bindTexture(this.ctx.TEXTURE_CUBE_MAP, tex);
          this.data.forEach((faceInfo) => {
            const {target, img} = faceInfo;
    
            // Upload the canvas to the cubemap face.
            const level = 0;
            const internalFormat = this.ctx.RGBA;
            const format = this.ctx.RGBA;
            const type = this.ctx.UNSIGNED_BYTE;
            this.ctx.texImage2D(target, level, internalFormat, format, type, img);
          });
          this.ctx.generateMipmap(this.ctx.TEXTURE_CUBE_MAP);
      this.ctx.texParameteri(this.ctx.TEXTURE_CUBE_MAP, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR_MIPMAP_LINEAR);
          return;
        }
        
        if(!this.image && !this.data) return;
        
        if(!window.log || window.log < 3) {
          window.log = window.log ? window.log+1 : 1;
          console.log('ss')
        }
        
        this.ctx.activeTexture(this.ctx.TEXTURE0 + this.value);
        
        const texture = this.ctx.createTexture(); // Create the texture object
        
        // this.ctx.pixelStorei(this.ctx.UNPACK_FLIP_Y_WEBGL, true);
        this.ctx.bindTexture(this.textureTarget, texture);
        
        if(this.textureTarget == window.WebGLRenderingContext.TEXTURE_2D) {
          // Set the parameters based on the passed type
          // In WebGL images are wrapped by default, so we don't need to check for that
          if(this.textureType === Texture.IMAGETYPE_MIRROR) {
            this.ctx.texParameteri(this.textureTarget, this.ctx.TEXTURE_WRAP_S, this.ctx.MIRRORED_REPEAT);
            this.ctx.texParameteri(this.textureTarget, this.ctx.TEXTURE_WRAP_T, this.ctx.MIRRORED_REPEAT);
          } else if(this.textureType === Texture.IMAGETYPE_REGULAR) {
            this.ctx.texParameteri(this.textureTarget, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
            this.ctx.texParameteri(this.textureTarget, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
          }
    
          this.ctx.texParameteri(this.textureTarget, this.ctx.TEXTURE_MIN_FILTER, this.minFilter);
          this.ctx.texParameteri(this.textureTarget, this.ctx.TEXTURE_MAG_FILTER, this.magFilter);
        
          // Upload the image into the texture.
          if(this.data) {
            this.ctx.texImage2D(this.textureTarget, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, this.data);
          } else {
            this.ctx.texImage2D(this.textureTarget, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, this.image);
          }
        }
        
        
        if(!window.log1 || window.log1 < 3) {
          window.log1 = window.log1 ? window.log1+1 : 1;
          console.log(this.textureTarget, this.ctx.TEXTURE_CUBE_MAP)
        }
        
        if(this.generateMipMap) this.ctx.generateMipmap(this.textureTarget);
      }
    }
    class FrameBuffer {
      static #defaultOptions = {
        width: 512,
        height: 512,
        pxRatio: Math.min(window.devicePixelRatio, 2),
        tiling: Texture.IMAGETYPE_REGULAR,
        texdepth: FrameBuffer.TEXTYPE_HALF_FLOAT_OES,
        data: null,
        depthTesting: false
      }
      static TEXTYPE_FLOAT = 0
      static TEXTYPE_UNSIGNED_BYTE = 1
      static TEXTYPE_HALF_FLOAT_OES = 2
    
      #fb1
      #fb2
      #activeFB
      #name
      #width
      #height
      #pxRatio
      #tiling = Texture.IMAGETYPE_REGULAR
      #texdepth = FrameBuffer.TEXTYPE_HALF_FLOAT_OES
      #data;
    
      constructor(renderer, name, options) {
        options = Object.assign({}, FrameBuffer.#defaultOptions, options);
        
        this.width = options.width;
        this.height = options.height;
        this.pxRatio = options.pxRatio;
        this.tiling = options.tiling;
        this.texdepth = options.texdepth;
        this.depthTesting = options.depthTesting;
        
        this.#name = name;
        this.value = Texture.masteri++;
        
        this.ctx = renderer.ctx;
        this.renderer = renderer;
        
        this.data = options.data;
        
        this.#fb1 = this.createFrameBuffer();
        this.#fb2 = this.createFrameBuffer();
        this.#activeFB = this.#fb1;
      }
      resize(width, height) {
        this.width = width;
        this.height = height;
        this.#fb1 = this.createFrameBuffer();
        this.#fb2 = this.createFrameBuffer();
        this.#activeFB = this.#fb1;
      }
      createFrameBuffer() {
        const targetTexture = this.ctx.createTexture();
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, targetTexture);
        {
          // define size and format of level 0
          const level = 0;
          let internalFormat = this.ctx.RGBA;
          const border = 0;
          let format = this.ctx.RGBA;
          let t;
          if(this.texdepth === FrameBuffer.TEXTYPE_FLOAT) {
            const e = this.ctx.getExtension('OES_texture_float');
            t = this.ctx.FLOAT;
            // internalFormat = this.ctx.FLOAT;
            // format = this.ctx.FLOAT;
          } else if(this.texdepth & FrameBuffer.TEXTYPE_HALF_FLOAT_OES) {
            // t = gl.renderer.isWebgl2 ? e.HALF_FLOAT : e.HALF_FLOAT_OES;
            //     gl.renderer.extensions['OES_texture_half_float'] ? gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES : 
            //     gl.UNSIGNED_BYTE;
            const e = this.ctx.getExtension('OES_texture_half_float');
            t = this.renderer.isWebgl2 ? this.ctx.HALF_FLOAT : e.HALF_FLOAT_OES;
            // format = gl.RGBA;
            if(this.renderer.isWebgl2) {
              internalFormat = this.ctx.RGBA16F;
            }
            // internalFormat = gl.RGB32F;
            // format = gl.RGB32F;
            // window.gl = gl
            // t = e.HALF_FLOAT_OES;
          } else {
            t = this.ctx.UNSIGNED_BYTE;
          }
          const type = t;
          const data = this.data;
          this.ctx.texImage2D(this.ctx.TEXTURE_2D, level, internalFormat,
                        this.width*this.pxRatio, this.height*this.pxRatio, border,
                        format, type, data);
          // gl.generateMipmap(gl.TEXTURE_2D);
    
          // set the filtering so we don't need mips
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.NEAREST);
          this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.NEAREST);
          
          // Set the parameters based on the passed type
          if(this.tiling === Texture.IMAGETYPE_TILE) {
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.REPEAT);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.REPEAT);
          } else if(this.tiling === Texture.IMAGETYPE_MIRROR) {
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.MIRRORED_REPEAT);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.MIRRORED_REPEAT);
          } else if(this.tiling === Texture.IMAGETYPE_REGULAR) {
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
          }
        }
        
        // Create and bind the framebuffer
        const fb = this.ctx.createFramebuffer();
        this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, fb);
        
        if(this.depthTesting) {
          var ext = this.ctx.getExtension('WEBGL_depth_texture');
          let depth = this.ctx.createTexture();
          this.ctx.bindTexture(this.ctx.TEXTURE_2D, depth);
          this.ctx.texImage2D(
            this.ctx.TEXTURE_2D, 0, this.ctx.DEPTH_COMPONENT, this.width*this.pxRatio, this.height*this.pxRatio, 0, this.ctx.DEPTH_COMPONENT, this.ctx.UNSIGNED_SHORT, null);
          this.ctx.framebufferTexture2D(this.ctx.FRAMEBUFFER, this.ctx.DEPTH_ATTACHMENT, this.ctx.TEXTURE_2D, depth, 0);
        }
    
        // attach the texture as the first color attachment
        const attachmentPoint = this.ctx.COLOR_ATTACHMENT0;
        const level = 0;
        this.ctx.framebufferTexture2D(
          this.ctx.FRAMEBUFFER, 
          attachmentPoint, 
          this.ctx.TEXTURE_2D, 
          targetTexture, 
          level);
    
        return {
          fb: fb,
          frameTexture: targetTexture
        };
      }
      bind() {
        // find the active texture based on the index
        let uniform = this.ctx.getUniformLocation(this.renderer.currentProgram.program, `b_${this.#name}`);
        
        // Set the texture unit to the uniform
        this.ctx.uniform1i(uniform, this.value);
        this.ctx.activeTexture(this.ctx.TEXTURE0 + this.value);
        // Bind the texture
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.#activeFB.frameTexture);
      }
      render(n) {
        this.bind();
        
        // Finally, ping-pong the texture
        this.#activeFB = this.#activeFB === this.#fb1 ? this.#fb2 : this.#fb1;
        
        // this.renderer.render(n, this.#activeFB);
        this.renderer.render(n, this.#activeFB, [this.width, this.height]);
      }
    
      set data(value) {
        if(value instanceof Float32Array) this.#data = value;
      }
      get data() {
        return this.#data || null;
      }
      set width(value) {
        if(value > 0) this.#width = value;
      }
      get width() {
        return this.#width || 1;
      }
      set height(value) {
        if(value > 0) this.#height = value;
      }
      get height() {
        return this.#height || 1;
      }
      set pxRatio(value) {
        if(value > 0) this.#pxRatio = value;
      }
      get pxRatio() {
        return this.#pxRatio || 1;
      }
      set tiling(value) {
        if([Texture.IMAGETYPE_REGULAR, Texture.IMAGETYPE_TILE, Texture.IMAGETYPE_MIRROR].indexOf(value) > -1) this.#tiling = value;
      }
      get tiling() {
        return this.#tiling;
      }
      set texdepth(value) {
        if([FrameBuffer.TEXTYPE_FLOAT, FrameBuffer.TEXTYPE_UNSIGNED_BYTE, FrameBuffer.TEXTYPE_HALF_FLOAT_OES].indexOf(value) > -1) this.#texdepth = value;
      }
      get texdepth() {
        return this.#texdepth;
      }
    }
    class Camera {
      static #defaultOptions = {
        fov: 30 * Math.PI / 180,
        aspect: window.innerWidth / window.innerHeight,
        near: .5,
        far: 100,
        pos: new Vec3(3, 1, -5),
        target: new Vec3(0, 0, 0),
        up: new Vec3(0, 1, 0)
      }
    
      #fov
      #aspect
      #near
      #far
      #pos
      #target
      #up
      #updateDebounce
      
      #model
      #view
      #proj
      #MVP
      
      #u_model
      #u_view
      #u_proj
      #u_MVP
      
      #q
      
      #name
      
      constructor(renderer, name, options) {
        options = Object.assign({}, Camera.#defaultOptions, options);
        
        this.renderer = renderer; 
        this.ctx = renderer.ctx;
        
        this.fov = options.fov;
        this.aspect = options.aspect;
        this.near = options.near;
        this.far = options.far;
        this.pos = options.pos;
        this.target = options.target;
        this.up = options.up;
        
        this.q = new Quat();
        
        this.name = name;
        
        this.update(true);
      }
      set q(value) {
        if(value instanceof Quat) {
          this.#q = value;
          this.#model = quatToMat4(this.#q);
          this.#u_model = new Uniform(this.ctx, 'm_model', Uniform.TYPE_M4, this.#model.array);
        }
      }
      get q() {
        return this.#q || new Quat();
      }
      update(nt = false) {
        clearTimeout(this.#updateDebounce);
        // this.#updateDebounce = setTimeout(() => {
          this.#model = new Mat4();
          this.#view = Mat4.lookAt(this.pos, this.target, this.up);
          this.#proj = Mat4.perspective(this.fov, this.aspect, this.near, this.far);
          this.#MVP = this.#proj.multiplyNew(this.#view).multiply(this.#model);
          
          this.#u_view = new Uniform(this.ctx, 'm_view', Uniform.TYPE_M4, this.#view.array);
          this.#u_proj = new Uniform(this.ctx, 'm_proj', Uniform.TYPE_M4, this.#proj.array);
          this.#u_MVP = new Uniform(this.ctx, 'm_MVP', Uniform.TYPE_M4, this.#MVP.array);
          
          this.setup = true;
        // }, nt ? 0 : 50);
      }
    
      set name(value) {
        if(typeof value === 'string') this.#name = value;
      }
      get name() {
        return this.#name || 'camera';
      }
      set fov(value) {
        if(!isNaN(value)) this.#fov = value;
      }
      get fov() {
        return this.#fov;
      }
      set aspect(value) {
        if(!isNaN(value)) this.#aspect = value;
      }
      get aspect() {
        return this.#aspect;
      }
      set near(value) {
        if(!isNaN(value)) this.#near = value;
      }
      get near() {
        return this.#near;
      }
      set far(value) {
        if(!isNaN(value)) this.#far = value;
      }
      get far() {
        return this.#far;
      }
      set pos(value) {
        if(value instanceof Vec3) this.#pos = value;
      }
      get pos() {
        return this.#pos;
      }
      set target(value) {
        if(value instanceof Vec3) this.#target = value;
      }
      get target() {
        return this.#target;
      }
      set up(value) {
        if(value instanceof Vec3) this.#up = value;
      }
      get up() {
        return this.#up;
      }
      get u_model() {
        return this.#u_model;
      }
      get u_view() {
        return this.#u_view;
      }
      get u_proj() {
        return this.#u_proj;
      }
      get u_MVP() {
        return this.#u_MVP;
      }
      get uniforms() {
        return [this.u_model, this.u_view, this.u_proj, this.u_MVP];
      }
    }
    
    const dimensions = [window.innerWidth, window.innerHeight];
    
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    
    const renderer = new Renderer(canvas, { width: dimensions[0], height: dimensions[1], alpha: false, premultipliedAlpha: true, preserveDrawingBuffer: true });
    const ctx = renderer.ctx;
    
    let drawing = new Float32Array([ -1.0,  1.0,   1.0,  1.0,   -1.0, -1.0,   1.0, -1.0]);
    
    const drawBuffer = new Buffer(ctx, drawing);
    
    // const vertexShader_buffer = document.getElementById('vertexShader_buffer').innerText;
    
    const programMain = new Program(ctx, VERTEX_SHADER, FRAGMENT_SHADER, { 
      clearColour: [.15, .15, 0.25, 1.],
      renderType: Program.RENDER_STRIP
    });
    
    const time = new Uniform(ctx, 'time', Uniform.TYPE_FLOAT, 100);
    const uDelta = new Uniform(ctx, 'delta', Uniform.TYPE_FLOAT, 100);
    const mouse = new Uniform(ctx, 'mouse', Uniform.TYPE_V2, [0.,0.]);
    
    // const noise = new Texture(ctx, 'noise', {
    //   textureType: Texture.IMAGETYPE_TILE,
    //   url: 'https://assets.codepen.io/982762/noise.png'
    // });
    
    // Load all our textures. We only initiate the instance once all images are loaded.
    const loadedTextures = {};
    const textures = [
      {
        name: 'noise',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/noise.png',
        type: Texture.IMAGETYPE_TILE,
        img: null
      },{
        name: 'cube_NEGATIVE_Z',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/miramar_bk.jpg',
        img: null,
        defer: true
      },{
        name: 'cube_NEGATIVE_X',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/miramar_lf.jpg',
        img: null,
        defer: true
      },{
        name: 'cube_POSITIVE_Z',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/miramar_ft.jpg',
        img: null,
        defer: true
      },{
        name: 'cube_NEGATIVE_Y',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/miramar_dn.jpg',
        img: null,
        defer: true
      },{
        name: 'cube_POSITIVE_Y',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/miramar_up.jpg',
        img: null,
        defer: true
      },{
        name: 'cube_POSITIVE_X',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/miramar_rt.jpg',
        img: null,
        defer: true
      }
    ];
    const loadImage = function (imageObject) {
      let img = document.createElement('img');
      img.crossOrigin="anonymous";
      
      return new Promise((resolve, reject) => {
        img.addEventListener('load', (e) => {
          imageObject.img = img;
          resolve(imageObject);
        });
        img.addEventListener('error', (e) => {
          reject(e);
        });
        img.src = imageObject.url
      });
    }
    const loadTextures = function(textures) {
      return new Promise((resolve, reject) => {
        const loadTexture = (pointer) => {
          if(pointer >= textures.length || pointer > 10) {
            resolve(textures);
            return;
          };
          const imageObject = textures[pointer];
    
          const p = loadImage(imageObject);
          p.then(
            (result) => {
              if(!result.defer) {
                // twodWebGL.addTexture(result.name, result.type, result.img);
                loadedTextures[result.name] = (new Texture(ctx, result.name, {
                   textureType: result.type,
                   data: result.img
                }));
              }
            },
            (error) => {
              console.log('error', error)
            }).finally((e) => {
              loadTexture(pointer+1);
          });
        }
        loadTexture(0);
      });
      
    }
    
    loadTextures(textures).then(
      (result) => {
        
        const gl = renderer.ctx;
    
    
        const faceInfos = [
          { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X },
          { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X },
          { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y },
          { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y },
          { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z },
          { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z },
        ];
    
        textures.forEach((tex) => {
          if(tex.name === 'cube_POSITIVE_X') {
            faceInfos[4].img = tex.img;
          } else if(tex.name === 'cube_NEGATIVE_X') {
            faceInfos[5].img = tex.img;
          } else if(tex.name === 'cube_POSITIVE_Y') {
            faceInfos[3].img = tex.img;
          } else if(tex.name === 'cube_NEGATIVE_Y') {
            faceInfos[2].img = tex.img;
          } else if(tex.name === 'cube_POSITIVE_Z') {
            faceInfos[0].img = tex.img;
          } else if(tex.name === 'cube_NEGATIVE_Z') {
            faceInfos[1].img = tex.img;
          }
        });
        
        console.log(faceInfos)
        
        loadedTextures['env'] = (new Texture(ctx, 'environment', {
          textureType: result.type,
          data: faceInfos,
          textureTarget: gl.TEXTURE_CUBE_MAP,
          generateMipMap: true
        }));
        
        requestAnimationFrame(run);
        
    //     gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    //     gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    //     twodWebGL.pushTexture('cube_env', texture, faceInfos, gl.TEXTURE_CUBE_MAP, false);
        
    //     twodWebGL.initTextures();
    //     // twodWebGL.render();
    //     twodWebGL.running = true;
      },
      (error) => {
        console.log('error');
      }
    );
    
    // noise.preload().then((n) => {
    //   requestAnimationFrame(run);
    // });
    
    let pointerdown = false;
    let lastPos = new Vec2();
    window.addEventListener('pointerdown', (e) => {
      pointerdown = true;
      lastPos = new Vec2(e.x, e.y);
    });
    window.addEventListener('pointerup', (e) => {
      pointerdown = false;
    });
    window.addEventListener('pointermove', (e) => {
      if(pointerdown) {
        let newPos = new Vec2(e.x, e.y);
        mouse.value = newPos.array;
      }
    });
    
    let playing = true;
    const setPlaying = (value) => {
      playing = value;
    }
    
    let autoTransitionTimer = 0;
    let timeToTransition = 0;
    const setupValues = (i) => {
      dimensions[0] = window.innerWidth;
      dimensions[1] = window.innerHeight;
      
      time.value = -10000;
    }
    
    setupValues(0);
    
    let timeout;
    window.addEventListener('resize', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        dimensions[0] = window.innerWidth;
        dimensions[1] = window.innerHeight;
        renderer.resize(dimensions[0], dimensions[1]);
      }, 100);
    });
    
    const cam = new Uniform(renderer.ctx, 'cam', Uniform.TYPE_V2, [0, 0.]);
    let pointermoving = false;
    let pointerTimeout;
    window.addEventListener('pointerdown', (e) => {
      pointerdown = true;
      pointerTimeout = setTimeout(() => {
        pointermoving = true;
      }, 200)
      lastPos = new Vec2(e.x, e.y);
    });
    window.addEventListener('pointerup', (e) => {
      pointerdown = false;
      pointermoving = false;
      clearTimeout(pointerTimeout);
    });
    window.addEventListener('pointermove', (e) => {
      if(pointerdown) {
        let newPos = new Vec2(e.x, e.y);
        let diff = newPos.clone().subtract(lastPos);
        lastPos = newPos.clone();
        cam.value[0] -= diff.x * -.01;
        cam.value[1] -= diff.y * -.01;
      }
    });
    
    const opx = renderer.pxRatio;
    let then = 0;
    // let framenum = 0;
    // let framesPerFrame = 10;
    // let gif = new gifJs({
    //   workers: 2,
    //   quality: 10
    // });
    // gif.on('finished', function(blob) {
    //   console.log('ss')
    //   window.open(URL.createObjectURL(blob));
    // });
    
    // const offscreenCanvas = document.createElement("canvas");
    // offscreenCanvas.className = 'osc';
    // offscreenCanvas.width = canvas.width;
    // offscreenCanvas.height = canvas.height;
    // const osctx = offscreenCanvas.getContext("2d");
    // document.body.appendChild(offscreenCanvas);
    
    let gifDone = false;
    const run = (delta) => {
      
    //   if(framenum < 10 * framesPerFrame) {
    //     if(framenum % framesPerFrame == 0) {
    //       // gif.addFrame(canvas, {delay: 100});
    
    //       osctx.drawImage(canvas,0,0);
    
    //       gif.addFrame(offscreenCanvas, {copy: true, delay: 100});
    //       // gif.addFrame(ctx, {copy: true});
    //     }
    //     framenum++;
    //   } else if(gifDone === false) {
    //     console.log(framenum)
    
    //     gif.render();
        
    //     window.gif = gif;
        
    //     gifDone = true;
    //   }
      
        let now = Date.now() / 1000;
        let _delta = now - then;
        then = now;
      
      if(_delta > 1000) {
        requestAnimationFrame(run);
        return;
      }
      
      if(playing) {
    
      uDelta.value = Math.min(_delta, 0.5);
      time.value += _delta;
        
      // console.log(loadedTextures.noise.value);
      // console.log(loadedTextures.env.value);
      
      renderer.setViewport();
      renderer.setupProgram(programMain, [drawBuffer], [], [time, mouse, loadedTextures.noise, loadedTextures.env, cam]);
      renderer.render(4);
        // console.log(loadedTextures)
        
      
      requestAnimationFrame(run);
    }
    };

    return (
        <div className="platonics-background">
            {children}
        </div>
    );
};

export default Platonics;