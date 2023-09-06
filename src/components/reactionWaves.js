// Copyright (c) 2023 by Liam Egan (https://codepen.io/shubniggurath/pen/yxERVe)
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



export const ReactionWaves = () => {

    const VERTEX_SHADER = `
        void main() {
            gl_Position = vec4( position, 1.0 );
        }
    `

    const FRAGMENT_SHADER = `
        uniform vec2 u_resolution;
        uniform vec4 u_mouse;
        uniform float u_time;
        uniform sampler2D u_environment;
        uniform sampler2D u_noise;
        uniform sampler2D u_buffer;
        uniform sampler2D u_buffer2;
        uniform bool u_renderpass;
        uniform bool u_renderpass2;
        uniform int u_frame;

        #define PI 3.141592653589793
        #define TAU 6.283185307179586

        vec2 hash2(vec2 p)
        {
        vec2 o = texture2D( u_noise, (p+0.5)/256.0, -100.0 ).xy;
        return o;
        }

        vec3 hsb2rgb( in vec3 c ){
        vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                6.0)-3.0)-1.0,
                        0.0,
                        1.0 );
        rgb = rgb*rgb*(3.0-2.0*rgb);
        return c.z * mix( vec3(1.0), rgb, c.y);
        }

        vec3 domain(vec2 z){
        return vec3(hsb2rgb(vec3(atan(z.y,z.x)/TAU,1.,1.)));
        }
        vec3 colour(vec2 z) {
            return domain(z);
        }

        // Shorthand, so that the texture lines read a little better.
        // Borrowed from Shane
        vec4 tx(vec2 p, sampler2D buffer){ return texture2D(buffer, p); }

        // 25 (or 9) tap Laplacian -- Gaussian Laplacian, to be more precise. I think of it as taking
        // the sum of the partial second derivatives of a blurry 2D height map... in each channel...
        // I think I'm making things more confusing, but it works anyway. :D Seriously, just look
        // up the Laplacian operator of a 2D function.
        // Borrowed from Shane
        vec4 Laplacian(vec2 p, sampler2D buffer) {

        // Kernel matrix dimension, and a half dimension calculation.
        const int mDim = 5, halfDim = (mDim - 1)/2;

        //     float scale = .25;
        //     float kernel[25];
        //     kernel[0] = 1. * scale;
        //     kernel[1] = 1. * scale;
        //     kernel[2] = 1. * scale;
        //     kernel[3] = 1. * scale;
        //     kernel[4] = 1. * scale;

        //     kernel[5] = 1. * scale;
        //     kernel[6] = 1. * scale;
        //     kernel[7] = 1. * scale;
        //     kernel[8] = 1. * scale;
        //     kernel[9] = 1. * scale;

        //     kernel[10] = 1. * scale;
        //     kernel[11] = 1. * scale;
        //     kernel[12] = -24. * scale;
        //     kernel[13] = 1. * scale;
        //     kernel[14] = 1. * scale;

        //     kernel[15] = 1. * scale;
        //     kernel[16] = 1. * scale;
        //     kernel[17] = 1. * scale;
        //     kernel[18] = 1. * scale;
        //     kernel[19] = 1. * scale;

        //     kernel[20] = 1. * scale;
        //     kernel[21] = 1. * scale;
        //     kernel[22] = 1. * scale;
        //     kernel[23] = 1. * scale;
        //     kernel[24] = 1. * scale;
        
        
        
        float kernel[25];
        kernel[0] = 0.;
        kernel[1] = 0.;
        kernel[2] = 0.25;
        kernel[3] = 0.;
        kernel[4] = 0.;

        kernel[5] = 0.;
        kernel[6] = 0.25;
        kernel[7] = 0.50;
        kernel[8] = 0.25;
        kernel[9] = 0.;

        kernel[10] = 0.25;
        kernel[11] = 0.50;
        kernel[12] = -4.0;
        kernel[13] = 0.50;
        kernel[14] = 0.25;

        kernel[15] = 0.;
        kernel[16] = 0.25;
        kernel[17] = 0.50;
        kernel[18] = 0.25;
        kernel[19] = 0.;

        kernel[20] = 0.;
        kernel[21] = 0.;
        kernel[22] = 0.25;
        kernel[23] = 0.;
        kernel[24] = 0.;
        
        vec4 col = vec4(0);

        float px = 1./u_resolution.y; 

        for (int j=0; j<mDim; j++){
            for (int i=0; i<mDim; i++){ 
            col += kernel[j*mDim + i]*tx(p + vec2(i - halfDim, j - halfDim)*px, buffer);
            }
        }

        return col;
        }


        void render( out vec4 fragColor, in vec2 fragCoord, sampler2D thebuffer, int step ) {

        vec2 p = fragCoord.xy/u_resolution.xy;

        vec4 rdVal = texture2D(thebuffer, p);

        vec2 lap = Laplacian(p, thebuffer).xy;

        float mixamt = clamp(length(p-.5) * 2., 0., 1.);

        float feed = 0.04567;
        float kill = 0.06649;
        vec2 dAB = vec2(.10685, .05405);
        
        if(step == 1) {
            rdVal = texture2D(thebuffer, p * 1.00001 + 0.00002);
            feed = 0.03167;
            kill = 0.059149;

            dAB = vec2(.16685, .06405);
        }
        
        float shade1 = smoothstep(0.3, 0.2, texture2D(u_buffer, (p+.5+vec2(u_time*.05, 0.))).y);
        
        if(step == 2) {
            // shade1 = 1.;
            feed = mix(0.040867, .0159, shade1);
            kill = mix(0.0819149, .0496, shade1);
            // dAB = mix(dAB, vec2(.07685, .03405), shade1);
        }

        const float t = 1.5; 

        vec2 diffusion = dAB*lap;

        vec2 reaction = vec2(rdVal.x*rdVal.y*rdVal.y)*vec2(-1, 1);

        vec2 feedKill = vec2(feed*(1. - rdVal.x), (kill + feed)*rdVal.y)*vec2(1, -1);
        vec2 delta = diffusion + reaction + feedKill;

        fragColor.xy = clamp(rdVal.xy + delta*t, 0., 1.);

        fragColor.zw = u_resolution.xy;
        if(step == 1) {
            if( u_frame<100 || u_mouse.z == 1. ) {
            vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
            uv *= 3.;
            vec2 ids = floor(uv);
            uv = fract(uv);
            float shade = smoothstep(.3, .2, length(uv-.5));
            fragColor.y = mix(fragColor.y, 1., shade);
            fragColor.x = mix(fragColor.x, 0., shade);
            }
        } else {
            
            // float shade1 = smoothstep(0.05, 0.25, texture2D(u_buffer, (p+.5)).y);
            // fragColor.y = mix(fragColor.y, 1., (1. - shade1));
            // fragColor.x = mix(fragColor.x, 0., (1. - shade1));
            
        //       if( u_frame<10) {
        //         vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        //         uv *= 3.;
        //         vec2 ids = floor(uv);
        //         uv = fract(uv);
        //         float shade = smoothstep(.3, .2, length(uv-.5));
        //         fragColor.y = mix(fragColor.y, 1., shade);
        //         fragColor.x = mix(fragColor.x, 0., shade);
            
        //       } else {
            vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
            uv *= 30.;
            vec2 ids = floor(uv);
            vec2 rand = hash2(ids);
            if(rand.y > .5) {
                uv = fract(uv);
                float shade = smoothstep(.5, .0, length(uv-.5))*.5;
                fragColor.y += shade * .1 * clamp(sin(u_time*4. + rand.x * 20.)-.5, 0., 1.)*2.;
            // }
            }
        }

        }

        // Epsilon value
        const float eps = 0.005;

        const vec3 ambientLight = 0.99 * vec3(1.0, 1.0, 1.0);
        const vec3 light1Pos = vec3(10., 5.0, -25.0);
        const vec3 light1Intensity = vec3(0.35);
        const vec3 light2Pos = vec3(-20., -25.0, 85.0);
        const vec3 light2Intensity = vec3(0.2);

        // movement variables
        vec3 movement = vec3(.0);

        // Gloable variables for the raymarching algorithm.
        const int maxIterations = 256;
        const int maxIterationsShad = 16;
        const float stepScale = .2;
        const float stopThreshold = 0.001;



        // The world!
        float world_sdf(in vec3 p) {
        float world = 10.;
        
        //     p.xz = mod(p.xz, 2.) -1.;
        
        //     return length(p) - .5;
        
        float shade = texture2D(u_buffer2, (p.xz) * .1).y * .5;
        shade *= shade;
        
        shade += texture2D(u_buffer2, (p.xz) * .05).y * .2;
        
        shade += texture2D(u_buffer2, (p.xz) * .2).y * .05;
        
        world = p.y + 1. - shade;
        
        return world;
        }

        // Fuck yeah, normals!
        vec3 calculate_normal(in vec3 p)
        {
        const vec3 small_step = vec3(0.0001, 0.0, 0.0);
        
        float gradient_x = world_sdf(vec3(p.x + eps, p.y, p.z)) - world_sdf(vec3(p.x - eps, p.y, p.z));
        float gradient_y = world_sdf(vec3(p.x, p.y + eps, p.z)) - world_sdf(vec3(p.x, p.y - eps, p.z));
        float gradient_z = world_sdf(vec3(p.x, p.y, p.z  + eps)) - world_sdf(vec3(p.x, p.y, p.z - eps));
        
        vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

        return normalize(normal);
        }

        // Raymarching.
        float rayMarching( vec3 origin, vec3 dir, float start, float end, inout float field ) {
        
        float sceneDist = 1e4;
        float rayDepth = start;
        for ( int i = 0; i < maxIterations; i++ ) {
            sceneDist = world_sdf( origin + dir * rayDepth ); // Distance from the point along the ray to the nearest surface point in the scene.

            if (( sceneDist < stopThreshold ) || (rayDepth >= end)) {        
            break;
            }
            // We haven't hit anything, so increase the depth by a scaled factor of the minimum scene distance.
            rayDepth += sceneDist * stepScale;
        }

        if ( sceneDist >= stopThreshold ) rayDepth = end;
        else rayDepth += sceneDist;
            
        // We've used up our maximum iterations. Return the maximum distance.
        return rayDepth;
        }

        /**
         * Lighting
         * This stuff is way way better than the model I was using.
         * Courtesy Shane Warne
         * Reference: http://raymarching.com/
         * -------------------------------------
         * */

        // Lighting.
        vec3 lighting( vec3 sp, vec3 camPos, int reflectionPass, float dist, float field, vec3 rd) {
        
        // Start with black.
        vec3 sceneColor = vec3(0.0);

        vec3 objColor = vec3(1.0, .5, .5);
        // objColor = vec3(smoothstep(.3, 0.4, texture2D(u_buffer2, (sp.xz) * .6).r));
        objColor = smoothstep(
            vec3(0.5, 0., 0.), 
            vec3(.0, 0.5, 1.), 
            texture2D(u_buffer2, (sp.xz) * .05).rgb * .6 + 
            texture2D(u_buffer2, (sp.xz) * .1).rgb * .6 + 
            texture2D(u_buffer2, (sp.xz) * .2).rgb * .6) * .5;

        // Obtain the surface normal at the scene position "sp."
        vec3 surfNormal = calculate_normal(sp);

        // Lighting.

        // lp - Light position. Keeping it in the vacinity of the camera, but away from the objects in the scene.
        vec3 lp = vec3(0., .5, .0) + movement;
        // ld - Light direction.
        vec3 ld = lp-sp;
        // lcolor - Light color.
        vec3 lcolor = vec3(1.,0.97,0.92) * .8;
        
        // Light falloff (attenuation).
        float len = length( ld ); // Distance from the light to the surface point.
        ld /= len; // Normalizing the light-to-surface, aka light-direction, vector.
        float lightAtten = min( 1.0 / ( 0.15*len*len ), 1.0 ); // Removed light attenuation for this because I want the fade to white
        
        float sceneLen = length(camPos - sp); // Distance of the camera to the surface point
        float sceneAtten = min( 1.0 / ( 0.015*sceneLen*sceneLen ), 1.0 ); // Keeps things between 0 and 1.   

        // Obtain the reflected vector at the scene position "sp."
        vec3 ref = reflect(-ld, surfNormal);
        
        
        float ao = 1.0; // Ambient occlusion.
        // ao = calculateAO(sp, surfNormal); // Ambient occlusion.

        float ambient = .5; //The object's ambient property.
        float specularPower = 200.; // The power of the specularity. Higher numbers can give the object a harder, shinier look.
        float diffuse = max( 0.0, dot(surfNormal, ld) ); //The object's diffuse value.
        float specular = max( 0.0, dot( ref, normalize(camPos-sp)) ); //The object's specular value.
        specular = pow(specular, specularPower); // Ramping up the specular value to the specular power for a bit of shininess.
            
        // Bringing all the lighting components togethr to color the screen pixel.
        sceneColor += (objColor*(diffuse*0.8+ambient)+specular*0.5*lightAtten)*lcolor*1.3;
        sceneColor = mix(sceneColor, vec3(0.), 1.-sceneAtten*sceneAtten); // fog
        
        vec3 refenv = reflect(normalize(rd), surfNormal);
        sceneColor += texture2D(u_environment, refenv.xz).rgb * .2;
        
        // float shadow = softShadow(sp, lp, .1, 1.);
        // sceneColor *= shadow + .8;
        
        return sceneColor;

        }

        void renderOutput(inout vec4 fragcolour) {
        
            // Setting up our screen coordinates.
            vec2 aspect = vec2(u_resolution.x/u_resolution.y, 1.0); //
            vec2 uv = (2.0*gl_FragCoord.xy/u_resolution.xy - 1.0)*aspect;
            
            // This just gives us a touch of fisheye
            // uv *= 1. + dot(uv, uv) * 0.4;
            
            // movement
            movement = vec3(sin(u_time*.5)*.5, 0., u_time*.5);
            
            // The sin in here is to make it look like a walk.
            vec3 lookAt = vec3(u_mouse.x, -.6 + u_mouse.y*.5, -.5);  // This is the point you look towards, or at, if you prefer.
            vec3 camera_position = vec3(0., -.2, -1.0); // This is the point you look from, or camera you look at the scene through. Whichever way you wish to look at it.
            
            lookAt += movement;
            // lookAt.z += sin(u_time / 10.) * .5;
            // lookAt.x += cos(u_time / 10.) * .5;
            camera_position += movement;
            
            vec3 forward = normalize(lookAt-camera_position); // Forward vector.
            vec3 right = normalize(vec3(forward.z, 0., -forward.x )); // Right vector... or is it left? Either way, so long as the correct-facing up-vector is produced.
            vec3 up = normalize(cross(forward,right)); // Cross product the two vectors above to get the up vector.

            // FOV - Field of view.
            float FOV = 0.4;

            // ro - Ray origin.
            vec3 ro = camera_position; 
            // rd - Ray direction.
            vec3 rd = normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
            
            // Ray marching.
            const float clipNear = 0.0;
            const float clipFar = 16.0;
            float field = 0.;
            float dist = rayMarching(ro, rd, clipNear, clipFar, field );
            if ( dist >= clipFar ) {
            gl_FragColor = vec4(vec3(1.), 1.0);
            return;
            }

            // sp - Surface position. If we've made it this far, we've hit something.
            vec3 sp = ro + rd*dist;

            // Light the pixel that corresponds to the surface position. The last entry indicates that it's not a reflection pass
            // which we're not up to yet.
            vec3 sceneColor = lighting( sp, camera_position, 0, dist, field, rd);

            // Clamping the lit pixel, then put it on the screen.
            fragcolour = vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
        }

        void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        
        vec2 mouse = u_mouse.xy - uv;
        
        float shade = smoothstep(.1, .15, length(mouse));
        
        vec4 fragcolour = vec4(shade);
        
        if(u_mouse.z == 1.) {
            fragcolour = vec4(shade, 0., 0., 0.);
        } else if(u_mouse.a == 1.) {
            fragcolour = vec4(0., shade, 0., 0.);
        }
        
        // vec3 fragcolour = colour(uv);
        
        if(u_renderpass == true) {
            render( gl_FragColor, gl_FragCoord.xy, u_buffer, 1 );
        } else if(u_renderpass2 == true) {
            render( gl_FragColor, gl_FragCoord.xy, u_buffer2, 2 );
        } else {
            
            renderOutput(gl_FragColor);
            
        }

        // gl_FragColor = fragcolour;
        }
    `

    let container;
    let camera, scene, renderer;
    let uniforms;

    let divisor = 1 / 8;
    let textureFraction = 1 / 1;

    let w = 2048;
    let h = 1024;
    let tw = 256.;
    let th = 256.;
    let tw2 = 2048.;
    let th2 = 2048.;

    let newmouse = {
    x: 0,
    y: 0 };


    let loader = new THREE.TextureLoader();
    let texture, rtTexture, rtTexture2, environment;
    let rt2Texture, rt2Texture2;
    loader.setCrossOrigin("anonymous");
    loader.load(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/noise.png',
    tex => {
    texture = tex;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    loader.load(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/env_lat-lon.png',
    tex => {
        environment = tex;
        environment.wrapS = THREE.RepeatWrapping;
        environment.wrapT = THREE.RepeatWrapping;
        environment.minFilter = THREE.LinearFilter;
        init();
        animate();
    });

    });


    function init() {
    // Dynamically create the container div
    let containerDiv = document.createElement("div");
    containerDiv.id = "container";
    containerDiv.setAttribute("touch-action", "none");
    document.body.appendChild(containerDiv); // Append it to the body  
    
    container = document.getElementById('container');

    camera = new THREE.Camera();
    camera.position.z = 1;

    scene = new THREE.Scene();

    var geometry = new THREE.PlaneBufferGeometry(2, 2);

    rtTexture = new THREE.WebGLRenderTarget(tw, th);
    rtTexture2 = new THREE.WebGLRenderTarget(tw, th);
    rt2Texture = new THREE.WebGLRenderTarget(tw2, th2);
    rt2Texture2 = new THREE.WebGLRenderTarget(tw2, th2);

    uniforms = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_noise: { type: "t", value: texture },
        u_environment: { type: "t", value: environment },
        u_buffer: { type: "t", value: rtTexture.texture },
        u_buffer2: { type: "t", value: rt2Texture.texture },
        u_mouse: { type: "v3", value: new THREE.Vector3() },
        u_frame: { type: "i", value: -1. },
        u_renderpass: { type: 'b', value: false },
        u_renderpass2: { type: 'b', value: false } };


    var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER  
        });

    material.extensions.derivatives = true;

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);


       // Add double-click event listener to navigate to /home page
       document.addEventListener('dblclick', function() {
        window.location.href = '/'; // Navigate to the / page
    });
    
    document.addEventListener('pointermove', e => {
        let ratio = window.innerHeight / window.innerWidth;
        if (window.innerHeight > window.innerWidth) {
        newmouse.x = (e.pageX - window.innerWidth / 2) / window.innerWidth;
        newmouse.y = (e.pageY - window.innerHeight / 2) / window.innerHeight * -1 * ratio;
        } else {
        newmouse.x = (e.pageX - window.innerWidth / 2) / window.innerWidth / ratio;
        newmouse.y = (e.pageY - window.innerHeight / 2) / window.innerHeight * -1;
        }

        e.preventDefault();
    });
    document.addEventListener('pointerdown', e => {
        if (e.button === 0) {
        uniforms.u_mouse.value.z = 1;
        } else if (e.button === 2) {
        uniforms.u_mouse.value.w = 1;
        }
        e.preventDefault();
    });
    document.addEventListener('pointerup', e => {
        if (e.button === 0) {
        uniforms.u_mouse.value.z = 0;
        } else if (e.button === 2) {
        uniforms.u_mouse.value.w = 0;
        }
        e.preventDefault();
    });
    }

    function onWindowResize(event) {
        w = 2048;
        h = 1024;
        w = window.innerWidth;
        h = window.innerHeight;

        renderer.setSize(w, h);
        uniforms.u_resolution.value.x = renderer.domElement.width;
        uniforms.u_resolution.value.y = renderer.domElement.height;

        uniforms.u_frame.value = 0;

        // rtTexture = new THREE.WebGLRenderTarget(w * textureFraction, h * textureFraction);
        // rtTexture2 = new THREE.WebGLRenderTarget(w * textureFraction, h * textureFraction);
        rtTexture = new THREE.WebGLRenderTarget(tw, th);
        rtTexture2 = new THREE.WebGLRenderTarget(tw, th);
        rt2Texture = new THREE.WebGLRenderTarget(tw2, th2);
        rt2Texture2 = new THREE.WebGLRenderTarget(tw2, th2);

        rtTexture.texture.wrapS = THREE.RepeatWrapping;
        rtTexture.texture.wrapT = THREE.RepeatWrapping;
        rtTexture.texture.minFilter = THREE.LinearFilter;
        rtTexture.texture.magFilter = THREE.LinearFilter;
        rtTexture2.texture.wrapS = THREE.RepeatWrapping;
        rtTexture2.texture.wrapT = THREE.RepeatWrapping;
        rtTexture2.texture.minFilter = THREE.LinearFilter;
        rtTexture2.texture.magFilter = THREE.LinearFilter;


        rt2Texture.texture.wrapS = THREE.RepeatWrapping;
        rt2Texture.texture.wrapT = THREE.RepeatWrapping;
        rt2Texture.texture.minFilter = THREE.LinearFilter;
        rt2Texture.texture.magFilter = THREE.LinearFilter;
        rt2Texture2.texture.wrapS = THREE.RepeatWrapping;
        rt2Texture2.texture.wrapT = THREE.RepeatWrapping;
        rt2Texture2.texture.minFilter = THREE.LinearFilter;
        rt2Texture2.texture.magFilter = THREE.LinearFilter;
    }

    function animate(delta) {
        requestAnimationFrame(animate);
        render(delta);
    }






    let capturer = new CCapture({
    verbose: true,
    framerate: 30,
    // motionBlurFrames: 4,
    quality: 90,
    format: 'webm',
    workersPath: 'js/' });

    let capturing = false;

    isCapturing = function (val) {
    if (val === false && window.capturing === true) {
        capturer.stop();
        capturer.save();
    } else if (val === true && window.capturing === false) {
        capturer.start();
    }
    capturing = val;
    };
    toggleCapture = function () {
    isCapturing(!capturing);
    };

    window.addEventListener('keyup', function (e) {if (e.keyCode == 68) toggleCapture();
    onWindowResize();});

    let then = 0;
    let odims = uniforms.u_resolution.value.clone();
    function renderTexture(delta) {

        let odims = uniforms.u_resolution.value.clone();
        uniforms.u_resolution.value.x = tw;
        uniforms.u_resolution.value.y = th;

        uniforms.u_buffer.value = rtTexture2.texture;

        uniforms.u_renderpass.value = true;

        window.rtTexture = rtTexture;
        renderer.setRenderTarget(rtTexture);
        renderer.render(scene, camera, rtTexture, true);

        let buffer = rtTexture;
        rtTexture = rtTexture2;
        rtTexture2 = buffer;

        uniforms.u_buffer.value = rtTexture.texture;
        // uniforms.u_resolution.value = odims;
        uniforms.u_renderpass.value = false;



        uniforms.u_resolution.value.x = tw2;
        uniforms.u_resolution.value.y = th2;

        uniforms.u_buffer2.value = rt2Texture2.texture;

        uniforms.u_renderpass2.value = true;

        window.rt2Texture = rt2Texture;
        renderer.setRenderTarget(rt2Texture);
        renderer.render(scene, camera, rt2Texture, true);

        buffer = rt2Texture;
        rt2Texture = rt2Texture2;
        rt2Texture2 = buffer;

        uniforms.u_buffer2.value = rt2Texture.texture;
        uniforms.u_resolution.value = odims;
        uniforms.u_renderpass2.value = false;
    }
    function render(delta) {
        uniforms.u_frame.value++;

        uniforms.u_mouse.value.x += (newmouse.x - uniforms.u_mouse.value.x) * divisor;
        uniforms.u_mouse.value.y += (newmouse.y - uniforms.u_mouse.value.y) * divisor;

        uniforms.u_time.value = delta * 0.0005;
        renderer.render(scene, camera);
        renderTexture();
        renderTexture();
        renderTexture();

        if (capturing) {
            capturer.capture(renderer.domElement);
        }
    }
}

export default ReactionWaves;