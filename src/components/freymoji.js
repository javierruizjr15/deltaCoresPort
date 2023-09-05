import { Renderer, Drawable, Texture, Program, Plane, Geometry, GeometryAttribute, Mesh, Uniform } from "https://cdn.skypack.dev/wtc-gl@1.0.0-beta.49";
import { Vec2 } from "https://cdn.skypack.dev/wtc-math@1.0.17";
import FreyaHOG from '../images/FreyaHOG2.png';
import Bone from '../images/freyaFalls/boneemoji200.png';
import DCLogo from '../images//freyaFalls/DCOGW75.png';
import Moon from '../images/freyaFalls/moon100.png';


export const Freymoji = () => {

    const VERTEX_SHADER = `#version 300 es
    in vec3 position;
    in vec3 normal;
    in vec2 uv;
    in float index;

    in vec2 offset;
    in vec2 scale;
    in float type;

    out vec2 vUv;
    out float vType;

    uniform vec2 u_resolution;

    vec2 getScreenSpace(vec2 p) {
    vec2 uv = (p - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);

    return uv;
    }

    void main() {
    vec2 vuv = getScreenSpace(position.xy);
    float a = scale.y;
    float s = sin(a);
    float c = cos(a);
    vUv = uv;
    vType = mod(type, 10.);
    // gl_Position = vec4(position.xy * scale.x + offset, 0, 0);
    vec2 pos = position.xy * mat2(c,-s,s,c);
    gl_Position = vec4(pos/u_resolution * scale.x + offset/u_resolution, .5, 1);
    }
    `

    const FRAGMENT_SHADER = `#version 300 es
    precision highp float;

    in vec2 vUv;
    in float vType;

    uniform sampler2D s_ball1;
    uniform sampler2D s_ball2;
    uniform sampler2D s_ball3;
    uniform sampler2D s_ball4;
    uniform sampler2D s_ball5;
    uniform sampler2D s_ball6;
    uniform sampler2D s_ball7;
    uniform sampler2D s_ball8;
    uniform sampler2D s_ball9;
    uniform sampler2D s_ball10;

    out vec4 col;

    void main() {
    col = vec4(smoothstep(0.01, 0., length(vUv-.5) - .495));
    if(vType == 0.) col = texture(s_ball1, vUv);
    else if(vType == 1.) col = texture(s_ball2, vUv);
    else if(vType == 2.) col = texture(s_ball3, vUv);
    else if(vType == 3.) col = texture(s_ball4, vUv);
    else if(vType == 4.) col = texture(s_ball5, vUv);
    else if(vType == 5.) col = texture(s_ball6, vUv);
    else if(vType == 6.) col = texture(s_ball7, vUv);
    else if(vType == 7.) col = texture(s_ball8, vUv);
    else if(vType == 8.) col = texture(s_ball9, vUv);
    else if(vType == 9.) col = texture(s_ball10, vUv);
    
    col *= col.a;
    // col = vec4(vUv, 1., 1.);
    }
    `

    console.clear();

    const searchParams = new URLSearchParams(window.location.search);

    // Initialize global properties
    const p = new Vec2(); // window size
    const g = new Vec2(0, -1); // gravity
    const num = searchParams.get('num') || 500; // The number of instances

    // Create the renderer and add it to the document
    const r = new Renderer({dpr:2, premultipliedAlpha: true, alpha: true});
    const gl = r.gl;
    document.body.appendChild(gl.canvas);

    // Create the uniforms array
    const uniforms = {
    'u_resolution': new Uniform({name: 'resolution', value: r.dimensions.array})
    };

    // Handle window resize
    const resize = (e)=>{
    p.reset(window.innerWidth, window.innerHeight);
    r.dimensions = new Vec2(window.innerWidth, window.innerHeight);
    uniforms.u_resolution.value = p.array;
    }
    window.addEventListener('resize', resize);
    resize();

    // Create the scene, this is the thing that we render
    const scene = new Drawable(gl);

    // Initialize the program (the shaders are in the HTML view)
    const vertex = VERTEX_SHADER;
    const fragment = FRAGMENT_SHADER;
    const program = new Program(gl, {
    vertex, fragment, uniforms, transparent:true, depthTest: false
    });

    // Initialize the various object properties
    const offset = new Float32Array(num*2); // The offset on screen, basically the position
    const sr = new Float32Array(num*2); // Scale and rotation vec2
    const type = new Float32Array(num); // The object type - gets coerced in the fragment shader
    const vels = []; // Velocity tracking - updated in the runloop
    const spin = []; // spin tracking - updated in the runloop
    const b = new Vec2(0,0); // The position of the main barrier
    offset.set( b.array, 0 );
    sr.set( [ 5, 1 ], 0 );
    type.set([0], 0);
    // Loop thgrough everything and update the properties
    for(let i=1;i<num;i++) {
    const os =                                       // Offset
            new Vec2(Math.random(),Math.random())      // Random vector
            .multiply(p.scaleNew(2).addScalar(100))  // Multiply by the window size
            .subtract(p.subtractScalarNew(100));     // center
    offset.set( os.array, i * 2 );                   // Set the offset property
    const s = .5 + Math.random()*2;                    // Random scale
    sr.set( [ s, 0 ], i * 2 );                       // Set the scale and rotation
    vels[i] = new Vec2(0,0);                         // Set the initial velocity to zero
    spin[i] = 0;                                     // Set the initial spin to zero
    type.set([i], i)                                 // Type is just instance index
    }

    // Set up the geometry attributes. Note the instanced property
    const attributes = {
    offset : new GeometryAttribute({ instanced: 1, size: 2, data: offset }),
    scale : new GeometryAttribute({ instanced: 1, size: 2, data: sr }),
    type : new GeometryAttribute({ instanced: 1, size: 1, data: type })
    };
    const geometry = new Plane(gl, { width: 100, height: 100, attributes });

    // Create the mesh from the geo and the program
    const mesh = new Mesh(gl, { geometry, program });

    // Set up the run loop
    let running = true;
    const run = (delta) => {
    running && requestAnimationFrame(run);
    
    // Loop through our instances and update based on "physics"
    for(let i=1;i<num;i++) {
        const v = vels[i].add(g.scaleNew(sr[i*2]*.5)).scale(.95);    // Velocity is the object velocity, plus the gravity, multiplied by some frictional constant
        const os = new Vec2(offset[i*2], offset[i*2+1] ).add(v);  // Add the velocity to the offset
        const h = os.subtractNew(b);                              // Find the relational position between the falling object and the static one
        const d = sr[i*2]*50+sr[0]*50-10;                         // Find the minimum distance that can exist between the objects (fudgy)
        if(h.lengthSquared < d*d) {                               // If the length is below the threshold, do stuff
        const ha = h.angle;                                     // Find the angle of the collision
        const hp = new Vec2(Math.cos(ha) * d, Math.sin(ha) * d);// Get the positional correction, based on this angle and the minimum length between objects
        os.resetToVector(b.addNew(hp));                         // Move the offset to the correction plus the position of the ball
        const vn = v.normaliseNew();                            // Get the velocity normal
        const ref = h.normaliseNew();                           // Get the reflection normal (the arrow pointing out of the static ball)
        const r = vn.subtractNew(ref.scale(2*vn.dot(ref)));     // Get the reflection vector of both normals
        spin[i] = Math.max(-1, Math.min(1, spin[i] + (h.angle-Math.PI*.5)*.2));// Update the spin based on the collision angle (very fudgy)
        vels[i].resetToVector(r.scale(v.length*1.5))                // Reset the velocity to the bounce velocity
        }
        sr[i*2+1] += spin[i]*.1;                                  // Set the spin
        
        // If the object is below the threshold, move it to the top
        if(os.y < -p.y-100) {
        os.x = -p.x + Math.random()*p.x*2
        os.y = p.y+100;
        }
        // Update the offset property
        offset.set( os.array, i * 2 );
    }
    // Update the attributes in place
    attributes.offset.updateAttribute(gl);
    attributes.scale.updateAttribute(gl);
    
    // Render
    r.render({ scene: mesh });
    }



    const createEmojiTexture = (t) => {
    const c = document.createElement('canvas').getContext('2d');
    const cn = c.canvas;
    const d = 800;
    cn.width=cn.height=d;

    c.font = "512px sans";
    c.textAlign = "center"
    c.textBaseline = "middle"; 
    c.fillText(t, d/2, d/2);
    
    return trim(cn);
    }


    function trim(c) {
    var ctx = c.getContext('2d'),
        copy = document.createElement('canvas').getContext('2d'),
        pixels = ctx.getImageData(0, 0, c.width, c.height),
        l = pixels.data.length,
        i,
        bound = {
        top: null,
        left: null,
        right: null,
        bottom: null
        },
        x, y;

    for (i = 0; i < l; i += 4) {
        if (pixels.data[i+3] !== 0) {
        x = (i / 4) % c.width;
        y = ~~((i / 4) / c.width);
    
        if (bound.top === null) {
            bound.top = y;
        }
        
        if (bound.left === null) {
            bound.left = x; 
        } else if (x < bound.left) {
            bound.left = x;
        }
        
        if (bound.right === null) {
            bound.right = x; 
        } else if (bound.right < x) {
            bound.right = x;
        }
        
        if (bound.bottom === null) {
            bound.bottom = y;
        } else if (bound.bottom < y) {
            bound.bottom = y;
        }
        }
    }
        
    var trimHeight = bound.bottom - bound.top,
        trimWidth = bound.right - bound.left,
        trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);
    
        // copy.canvas.width = trimWidth;
        // copy.canvas.height = trimHeight;
        // copy.putImageData(trimmed, 0, 0);
    copy.canvas.width = Math.max(trimWidth, trimHeight);
    copy.canvas.height = Math.max(trimWidth, trimHeight);
    copy.putImageData(trimmed, (Math.max(trimWidth, trimHeight)-trimWidth)/2, (Math.max(trimWidth, trimHeight)-trimHeight)/2);
    
    
    // open new window with trimmed image:
    return copy.canvas;
    }

    let emoji = searchParams.get('emojis')?.split(',') || [ FreyaHOG, '😀' ];
    // let emoji = searchParams.get('emojis')?.split(',') || [ FreyaHOG,'🤣','🤨','🥸','🥳','🥶','🤔','😡','🤡','💩'];

    //function to load images to array
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    

    if(emoji.length < 10) {
    while(emoji.length < 10) {
        emoji = emoji.concat(emoji);
    }
    }
    emoji.length=10;

    for (let i = 0; i < emoji.length; i++) {
        // Check if it's an emoji or an image based on file extensions
        const isImage = /\.jpg|\.jpeg|\.png|\.gif|\.bmp$/i.test(emoji[i]);
        
        if (isImage) {
            loadImage(emoji[i]).then(image => {
                const texture = new Texture(gl, {image});
                uniforms[`s_ball${i+1}`] = new Uniform({
                    name: `ball${i+1}`,
                    value: texture,
                    kind: "texture"
                });
            }).catch(error => {
                console.error('Error loading image:', error);
            });
        } else {
            const tex = createEmojiTexture(emoji[i]);
            const texture = new Texture(gl, {image: tex});
            uniforms[`s_ball${i+1}`] = new Uniform({
                name: `ball${i+1}`,
                value: texture,
                kind: "texture"
            });
        }
    }

    // for(let i = 0; i < emoji.length; i++) {
    //     const tex = createEmojiTexture(emoji[i]);
        
    //     const texture = new Texture(gl, {image:tex});
    //     uniforms[`s_ball${i+1}`] = new Uniform({
    //       name: `ball${i+1}`,
    //       value: texture,
    //       kind: "texture"
    //     });
    
    requestAnimationFrame(run);

}

export default Freymoji;