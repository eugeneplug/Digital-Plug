(() => {
  const canvas = document.querySelector('.main-waves');
  const surface = document.querySelector('.surface');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return;
  const vertex = 'attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.,1.);}';
  const fragment = `
    precision highp float;
    uniform vec2 uSize;
    uniform float uTime;
    uniform vec4 uDrops[8];
    float heightAt(vec2 p) {
      float height = 0.;
      for(int i=0;i<8;i++) {
        vec4 drop=uDrops[i];
        float age=uTime-drop.z;
        if(drop.w>0. && age>0. && age<9.) {
          float distance=length(p-drop.xy);
          float front=distance-age*.115;
          float envelope=exp(-front*front/ .0075)*exp(-age*.38);
          height+=sin(front*76.)*envelope*drop.w*.013;
        }
      }
      return height;
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/uSize;
      float unit=min(uSize.x,uSize.y);
      vec2 p=gl_FragCoord.xy/unit;
      float eps=.0018;
      float h=heightAt(p);
      vec2 slope=vec2(heightAt(p+vec2(eps,0.))-h,heightAt(p+vec2(0.,eps))-h)/eps;
      vec3 normal=normalize(vec3(-slope*1.8,1.));
      vec2 refracted=uv+slope*.025;
      vec3 paper=vec3(.941176,.960784,.976471);
      float wash=exp(-dot((refracted-vec2(.8,.65))*vec2(1.,1.4),(refracted-vec2(.8,.65))*vec2(1.,1.4))*4.);
      vec3 color=paper-mix(vec3(0.),vec3(.025,.013,0.),wash);
      float relief=dot(normal.xy,vec2(-.55,.8));
      color+=relief*vec3(.24,.21,.17);
      float gloss=pow(max(dot(normal,normalize(vec3(-.32,.45,1.))),0.),30.);
      float flatGloss=pow(dot(vec3(0.,0.,1.),normalize(vec3(-.32,.45,1.))),30.);
      color+=(gloss-flatGloss)*vec3(.1,.11,.12);
      float caustic=clamp(length(slope)*.12,0.,.10);
      color-=vec3(.14,.065,0.)*caustic;
      gl_FragColor=vec4(clamp(color,0.,1.),1.);
    }`;
  function shader(type, source) {
    const value = gl.createShader(type);
    gl.shaderSource(value, source); gl.compileShader(value);
    if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(value));
    return value;
  }
  let program;
  try {
    program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Wave renderer could not link');
  } catch (error) { console.warn('Wave renderer unavailable',error.message); return; }
  gl.useProgram(program);
  const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'aPosition');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const sizeUniform=gl.getUniformLocation(program,'uSize');
  const timeUniform=gl.getUniformLocation(program,'uTime');
  const dropsUniform=gl.getUniformLocation(program,'uDrops[0]');
  const drops=new Float32Array(32);
  let slot=0, frame=0, lastPointer=0, lastAmbient=0, width=0, height=0;
  const start=performance.now();
  const clock=()=> (performance.now()-start)/1000;
  function drop(x,y,strength=1,age=0) {
    const unit=Math.min(width,height);
    if (!unit) return;
    const index=(slot++%8)*4;
    drops.set([x/unit,(height-y)/unit,clock()-age,strength],index);
  }
  function render(){
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.uniform2f(sizeUniform,canvas.width,canvas.height);
    gl.uniform1f(timeUniform,clock());
    gl.uniform4fv(dropsUniform,drops);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function resize(){
    const rect=surface.getBoundingClientRect(); width=rect.width; height=rect.height;
    const ratio=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*ratio); canvas.height=Math.round(height*ratio);
    drops.fill(0);
    if (!motion.matches) drop(width*.76,height*.34,.9,1.4);
    render();
  }
  function animate(){
    frame=0;
    if(document.hidden || motion.matches) return;
    if(clock()-lastAmbient>4.7){
      lastAmbient=clock();
      const alternate=Math.floor(lastAmbient/4.7)%2;
      drop(width*(alternate?.67:.82),height*(alternate?.3:.55),.65);
    }
    render(); frame=requestAnimationFrame(animate);
  }
  function resume(){
    if(frame) cancelAnimationFrame(frame); frame=0;
    if(motion.matches){drops.fill(0);render();}
    else if(!document.hidden) frame=requestAnimationFrame(animate);
  }
  surface.addEventListener('pointermove',event=>{
    if(motion.matches || performance.now()-lastPointer<140) return;
    const rect=surface.getBoundingClientRect();
    drop(event.clientX-rect.left,event.clientY-rect.top,.55);
    lastPointer=performance.now();
  },{passive:true});
  surface.addEventListener('pointerdown',event=>{
    if(motion.matches) return;
    const rect=surface.getBoundingClientRect();drop(event.clientX-rect.left,event.clientY-rect.top,1.25);
  },{passive:true});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(frame)cancelAnimationFrame(frame);frame=0;});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  new ResizeObserver(resize).observe(surface);
  document.addEventListener('visibilitychange',resume); motion.addEventListener('change',resume);
  resize(); resume(); canvas.dataset.renderer='water';
})();

