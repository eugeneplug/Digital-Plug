(() => {
  const scene=document.querySelector('.about-scene');
  const canvas=scene?.querySelector('.about-growth-canvas');
  const output=canvas?.getContext('2d',{alpha:true,desynchronized:true});
  if(!output)return;
  const plants = {"grass":[[1117.7,209.46,130.14,129.12],[1183.73,204.68,130.14,130.07],[1272.73,200.85,130.14,130.07],[1338.76,197.02,130.14,130.07],[1427.75,193.2,130.14,130.07],[0.0,286.93,113.88,130.07],[49.76,283.1,130.14,130.07],[115.79,279.28,130.14,130.07],[204.78,275.45,130.14,129.12],[270.81,270.67,130.14,130.07],[1045.93,277.36,130.14,130.07],[1111.96,272.58,130.14,130.07],[1177.99,268.76,130.14,130.07],[1266.99,287.89,130.14,130.07],[1333.01,284.06,130.14,130.07],[1422.01,280.23,130.14,130.07],[1488.04,276.41,111.96,129.12],[0.0,351.01,108.13,130.07],[44.02,347.18,130.14,130.07],[133.01,343.36,130.14,130.07],[199.04,361.53,130.14,130.07],[288.04,357.7,130.14,130.07],[354.07,353.88,130.14,130.07],[420.1,350.05,130.14,130.07],[509.09,346.23,130.14,130.07],[885.17,349.1,130.14,130.07],[951.2,345.27,130.14,130.07],[1040.19,364.4,130.14,130.07],[1106.22,359.62,130.14,130.07],[1195.22,355.79,130.14,130.07],[1261.24,351.97,130.14,130.07],[1350.24,348.14,130.14,130.07],[1416.27,344.31,130.14,130.07],[1482.3,363.44,117.7,129.12],[1571.29,358.66,28.71,130.07],[0.0,438.04,102.39,130.07],[38.28,434.22,130.14,130.07],[127.27,430.39,130.14,130.07],[193.3,425.61,130.14,130.07],[282.3,421.79,130.14,130.07],[348.33,417.96,130.14,130.07],[437.32,437.09,130.14,130.07],[503.35,433.26,129.19,130.07],[592.34,429.44,129.19,129.12],[658.37,424.65,129.19,130.07],[813.4,439.96,129.19,130.07],[879.43,436.13,129.19,130.07],[968.42,432.31,129.19,130.07],[1034.45,427.52,129.19,130.07],[1123.44,423.7,129.19,130.07],[1189.47,419.87,129.19,130.07],[1254.55,439.0,130.14,130.07],[1343.54,435.18,130.14,130.07],[1409.57,431.35,130.14,130.07],[1498.56,426.57,101.44,130.07],[1564.59,422.74,35.41,130.07],[0.0,502.13,95.69,130.07],[54.55,498.3,130.14,130.07],[120.57,494.47,130.14,129.12],[209.57,512.65,130.14,130.07],[275.6,508.82,130.14,130.07],[341.63,504.99,130.14,130.07],[430.62,501.17,130.14,130.07],[496.65,497.34,130.14,130.07],[585.65,516.47,130.14,129.12],[651.67,511.69,130.14,130.07],[806.7,504.04,130.14,130.07],[895.69,500.21,130.14,130.07],[961.72,496.39,130.14,130.07],[1027.75,514.56,130.14,130.07],[1116.75,510.73,130.14,130.07],[1182.78,506.91,130.14,130.07],[1271.77,503.08,130.14,130.07],[1337.8,499.26,130.14,130.07],[1426.79,495.43,130.14,129.12],[1492.82,513.6,107.18,130.07],[1558.85,509.78,41.15,130.07],[0.0,589.16,112.92,130.07],[48.8,585.33,130.14,130.07],[114.83,580.55,130.14,130.07],[203.83,576.73,130.14,130.07],[269.86,572.9,130.14,130.07],[358.85,592.03,130.14,130.07],[424.88,588.2,130.14,130.07],[513.88,584.38,130.14,130.07],[579.9,579.6,130.14,130.07],[645.93,575.77,130.14,130.07],[734.93,571.94,130.14,130.07],[800.96,591.07,130.14,130.07],[889.95,587.25,130.14,130.07],[955.98,583.42,130.14,129.12],[1044.98,578.64,130.14,130.07],[1111.0,574.81,130.14,130.07],[1200.0,570.99,130.14,130.07],[1266.03,590.12,130.14,130.07],[1332.06,586.29,130.14,130.07],[1421.05,582.47,130.14,129.12],[1487.08,577.68,112.92,130.07],[1576.08,573.86,23.92,130.07],[0.0,653.24,107.18,130.07],[43.06,649.42,130.14,129.12],[132.06,667.59,130.14,130.07],[198.09,663.76,130.14,130.07],[287.08,659.94,130.14,130.07],[353.11,656.11,130.14,130.07],[419.14,652.28,130.14,130.07],[508.13,648.46,130.14,129.12],[574.16,666.63,130.14,130.07],[663.16,662.81,130.14,130.07],[729.19,658.98,130.14,130.07],[818.18,655.15,130.14,130.07],[884.21,651.33,130.14,130.07],[950.24,646.55,130.14,130.07],[1039.23,665.67,130.14,130.07],[1105.26,661.85,130.14,130.07],[1194.26,658.02,130.14,130.07],[1260.29,654.2,130.14,130.07],[1349.28,650.37,130.14,130.07],[1415.31,645.59,130.14,130.07],[1504.31,664.72,95.69,130.07],[1570.33,660.89,29.67,130.07],[0.0,740.28,101.44,130.07],[60.29,736.45,130.14,129.12],[126.32,731.67,130.14,130.07],[192.34,727.84,129.19,130.07],[281.34,724.02,129.19,130.07],[347.37,743.15,129.19,130.07],[436.36,739.32,129.19,130.07],[502.39,734.54,129.19,130.07],[591.39,730.71,129.19,130.07],[657.42,726.89,129.19,130.07],[723.44,723.06,129.19,130.07],[812.44,742.19,129.19,130.07],[878.47,738.36,129.19,130.07],[967.46,733.58,129.19,130.07],[1032.54,729.76,130.14,130.07],[1121.53,725.93,130.14,130.07],[1187.56,722.1,130.14,130.07],[1253.59,741.23,130.14,130.07],[1342.58,737.41,130.14,129.12],[1408.61,732.62,130.14,130.07],[1497.61,728.8,102.39,130.07],[1563.64,724.97,36.36,130.07],[0.0,804.36,94.74,95.64],[53.59,799.57,130.14,100.43],[119.62,818.7,130.14,81.3],[208.61,814.88,130.14,85.12],[274.64,811.05,130.14,88.95],[363.64,807.23,130.14,92.77],[429.67,803.4,130.14,96.6],[495.69,798.62,130.14,101.38],[584.69,817.75,130.14,82.25],[650.72,813.92,130.14,86.08],[739.71,810.1,130.14,89.9],[805.74,806.27,130.14,93.73],[894.74,802.44,130.14,97.56],[960.77,797.66,130.14,102.34],[1026.79,816.79,130.14,83.21],[1115.79,812.96,130.14,87.04],[1181.82,809.14,130.14,90.86],[1270.81,805.31,130.14,94.69],[1336.84,800.53,130.14,99.47],[1425.84,819.66,130.14,80.34],[1491.87,815.83,108.13,84.17],[1557.89,812.01,42.11,87.99]],"flowers":[[1316.75,277.36,49.76,43.04],[1410.53,305.1,54.55,65.99],[1213.4,310.84,44.98,46.87],[240.19,341.45,56.46,47.82],[1472.73,376.83,43.06,33.48],[1190.43,382.57,56.46,52.6],[169.38,385.44,32.54,22.95],[43.06,396.92,46.89,44.95],[383.73,400.74,49.76,43.04],[1158.85,404.57,27.75,25.82],[211.48,425.61,37.32,26.78],[1507.18,433.26,29.67,26.78],[1147.37,437.09,28.71,28.69],[357.89,441.87,59.33,47.82],[483.25,443.78,29.67,25.82],[244.98,447.61,24.88,19.13],[996.17,453.35,51.67,47.82],[1277.51,472.48,22.01,17.22],[534.93,486.82,44.98,40.17],[1278.47,489.69,23.92,20.09],[295.69,505.95,47.85,42.08],[1370.33,505.95,76.56,56.43],[1480.38,517.43,25.84,22.0],[1557.89,520.3,25.84,23.91],[435.41,530.82,31.58,25.82],[116.75,534.64,58.37,46.87],[617.22,539.43,34.45,26.78],[45.93,548.99,54.55,52.6],[401.91,553.77,22.97,18.17],[1107.18,560.47,75.6,71.73],[668.9,564.29,44.98,41.13],[1036.36,575.77,44.98,22.95],[1275.6,582.47,71.77,49.73],[455.5,592.99,53.59,46.87],[1021.05,597.77,24.88,22.95],[1358.85,628.37,35.41,27.74],[1421.05,632.2,33.49,26.78],[498.56,638.89,36.36,37.3],[597.13,644.63,35.41,33.48],[1402.87,650.37,33.49,30.61],[935.89,654.2,46.89,43.04],[1304.31,660.89,54.55,49.73],[1435.41,668.54,37.32,31.56],[272.73,670.46,35.41,28.69],[302.39,672.37,87.08,67.91],[1366.51,675.24,41.15,37.3],[967.46,693.41,131.1,80.34],[1489.0,705.84,32.54,24.87],[810.53,731.67,36.36,33.48],[1534.93,746.97,56.46,52.6],[751.2,748.88,18.18,17.22],[850.72,765.14,50.72,37.3],[1289.0,773.75,63.16,62.17],[695.69,786.18,46.89,37.3],[859.33,788.1,73.68,44.0],[533.01,818.7,30.62,30.61],[901.44,821.57,36.36,35.39],[667.94,845.48,21.05,20.09],[597.13,859.83,36.36,34.43]]};
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const W=1600,H=900;
  const cover=Math.max(scene.clientWidth,scene.clientHeight*16/9);
  const pixels=Math.min(1600,Math.max(960,Math.ceil(cover*Math.min(devicePixelRatio||1,1.25)/32)*32));
  const scale=pixels/W,maskScale=scale/2;
  const planted={grass:new Set(),flowers:new Set()};
  let images,grass,flowers,ground,terrain,groundEdge,mask,brush,edge,ready=false,loading;
  let active=[],frame=0,last=0,nextFrame=0,visible=false;
  let x=0,y=0,tx=0,ty=0,radius=0,tr=0,stamp=null,seedPoint=null;
  let point=null,painting=false,box;
  canvas.width=pixels;canvas.height=pixels*H/W;

  function buffer(width,height) {
    const node=document.createElement('canvas');
    node.width=width;node.height=height;
    return {node,ctx:node.getContext('2d')};
  }
  function loadImage(file) {
    const image=new Image();
    image.decoding='async';image.src=new URL(file,document.baseURI).href;
    return image.decode().then(()=>image);
  }
  function load() {
    if(loading)return loading;
    loading=Promise.all([
      loadImage('assets/about-grass-sprites.png'),
      loadImage('assets/about-flower-sprites.png'),
      // Optional support must never prevent the actual grass from growing.
      loadImage('assets/about-terrain-support.png').catch(()=>null),
    ]).then(([grassImage,flowerImage,terrainImage])=>{
      images={grass:grassImage,flowers:flowerImage};
      // Settled layers are changed once per completed plant, never rebuilt
      // plant by plant on idle. Flowers stay above every grass clump.
      grass=buffer(pixels,pixels*H/W);flowers=buffer(pixels,pixels*H/W);
      grass.ctx.scale(scale,scale);flowers.ctx.scale(scale,scale);
      ground=buffer(pixels,pixels*H/W);ground.ctx.scale(scale,scale);
      terrain=terrainImage;
      groundEdge=buffer(128,128);
      const horizontal=groundEdge.ctx.createLinearGradient(0,0,128,0);
      for(const [stop,alpha] of [[0,0],[.06,1],[.94,1],[1,0]])horizontal.addColorStop(stop,`rgba(255,255,255,${alpha})`);
      groundEdge.ctx.fillStyle=horizontal;groundEdge.ctx.fillRect(0,0,128,128);
      const vertical=groundEdge.ctx.createLinearGradient(0,0,0,128);
      for(const [stop,alpha] of [[0,0],[.06,1],[.94,1],[1,0]])vertical.addColorStop(stop,`rgba(255,255,255,${alpha})`);
      groundEdge.ctx.globalCompositeOperation='destination-in';
      groundEdge.ctx.fillStyle=vertical;groundEdge.ctx.fillRect(0,0,128,128);
      mask=buffer(pixels/2,pixels*H/W/2);mask.ctx.scale(maskScale,maskScale);
      brush=buffer(256,256);
      const feather=brush.ctx.createRadialGradient(128,128,0,128,128,128);
      for(const [offset,alpha] of [[0,1],[.4,1],[.57,.96],[.72,.65],[.86,.18],[1,0]])
        feather.addColorStop(offset,`rgba(255,255,255,${alpha})`);
      brush.ctx.fillStyle=feather;brush.ctx.fillRect(0,0,256,256);
      edge=buffer(128,128);
      const falloff=edge.ctx.createRadialGradient(64,64,0,64,64,64);
      falloff.addColorStop(.54,'#fff');falloff.addColorStop(1,'rgba(255,255,255,0)');
      edge.ctx.fillStyle=falloff;edge.ctx.fillRect(0,0,128,128);
      ready=true;wake();
    }).catch(error=>{
      loading=null;
      console.warn('DigitalPlug: growth artwork could not load.',error);
    });
    return loading;
  }
  function join(a,b) {
    if(!a)return {...b};
    const right=Math.max(a.x+a.w,b.x+b.w),bottom=Math.max(a.y+a.h,b.y+b.h);
    a.x=Math.min(a.x,b.x);a.y=Math.min(a.y,b.y);
    a.w=right-a.x;a.h=bottom-a.y;return a;
  }
  function intersects(a,b) {
    return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  }
  function addPlant(kind,index,bounds,distance) {
    const [left,top,width,height]=bounds,flower=kind==='flowers';
    const image=images[kind];
    const item={kind,flower,left,top,width,height,image,sprite:null,
      sx:left*image.naturalWidth/W,sy:top*image.naturalHeight/H,
      sw:width*image.naturalWidth/W,sh:height*image.naturalHeight/H,
      cx:left+width/2,root:top+height*(flower ? .64 : 1),
      age:-(flower?620+(index*67%270):index*43%140)-distance*.28,
      duration:flower?1020+(index*37%180):1250+(index*53%260),
      sway:(index%2?1:-1)*(flower?9:1.8),
      bounds:{x:left-12,y:top-12,w:width+24,h:height+24}};
    planted[kind].add(index);active.push(item);
  }
  function seed() {
    if(seedPoint&&Math.hypot(x-seedPoint.x,y-seedPoint.y)<2&&radius===seedPoint.r)return;
    seedPoint={x,y,r:radius};
    const reach=radius*.77;
    for(const kind of ['grass','flowers']){
      plants[kind].forEach((bounds,index)=>{
        if(planted[kind].has(index))return;
        const [left,top,width,height]=bounds;
        const dx=Math.max(left-x,0,x-left-width),dy=Math.max(top-y,0,y-top-height);
        const distance=Math.hypot(dx,dy);
        if(distance<reach)addPlant(kind,index,bounds,distance);
      });
    }
  }
  function sprite(item) {
    if(item.flower||item.sprite)return;
    const patch=buffer(Math.ceil(item.width*scale),Math.ceil(item.height*scale));
    patch.ctx.drawImage(item.image,item.sx,item.sy,item.sw,item.sh,0,0,patch.node.width,patch.node.height);
    patch.ctx.globalCompositeOperation='destination-in';
    patch.ctx.drawImage(edge.node,0,0,patch.node.width,patch.node.height);
    item.sprite=patch.node;
    if(!terrain)return;
    const support=buffer(patch.node.width,patch.node.height);
    support.ctx.drawImage(terrain,item.left*terrain.naturalWidth/W,item.top*terrain.naturalHeight/H,item.width*terrain.naturalWidth/W,item.height*terrain.naturalHeight/H,0,0,support.node.width,support.node.height);
    support.ctx.globalCompositeOperation='destination-in';
    support.ctx.drawImage(groundEdge.node,0,0,support.node.width,support.node.height);
    item.groundSprite=support.node;
  }
  function draw(ctx,item,p,soil=false) {
    if(p<=0)return;
    sprite(item);
    ctx.save();
    if(p<1){
      const ease=item.flower?(p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2):1-Math.pow(1-p,3);
      const bloom=ease+Math.sin(p*Math.PI)*.035;
      const sx=item.flower ? .025+bloom*.975 : .45+ease*.55;
      const sy=item.flower ? .025+bloom*.975 : .012+ease*.988;
      const angle=item.sway*Math.sin(p*Math.PI)*(1-ease)*Math.PI/180;
      const sprout=Math.min(1,p/.18);
      ctx.globalAlpha=sprout*sprout*(3-2*sprout);
      ctx.translate(item.cx,item.root);ctx.rotate(angle);ctx.scale(sx,sy);
      ctx.translate(-item.cx,-item.root);
    }
    if(soil&&item.groundSprite)ctx.drawImage(item.groundSprite,item.left,item.top,item.width,item.height);
    else if(soil){ctx.restore();return;}
    else if(item.sprite)ctx.drawImage(item.sprite,item.left,item.top,item.width,item.height);
    else ctx.drawImage(item.image,item.sx,item.sy,item.sw,item.sh,item.left,item.top,item.width,item.height);
    ctx.restore();
  }
  // A bounded bitmap replaces accumulating SVG paths and per-frame blur.
  // Only new brush samples update this mask; resting never repaints it.
  function paint() {
    const outer=radius*.62+72,step=radius*.18;
    const distance=stamp?Math.hypot(x-stamp.x,y-stamp.y):0;
    if(stamp&&distance<step&&Math.abs(stamp.r-radius)<1)return null;
    const count=stamp?Math.max(1,Math.floor(distance/step)):1;
    const start=stamp||{x,y};
    let dirty=null;
    for(let i=1;i<=count;i++){
      const t=i/count,cx=start.x+(x-start.x)*t,cy=start.y+(y-start.y)*t;
      mask.ctx.drawImage(brush.node,cx-outer,cy-outer,outer*2,outer*2);
      dirty=join(dirty,{x:cx-outer-2,y:cy-outer-2,w:outer*2+4,h:outer*2+4});
    }
    stamp={x,y,r:radius};return dirty;
  }
  function composite(dirty) {
    // Clip on whole backing pixels: fractional dirty edges would leave thin
    // compositing seams when the canvas is rendered below image resolution.
    const px=Math.max(0,Math.floor(dirty.x*scale)-1),py=Math.max(0,Math.floor(dirty.y*scale)-1);
    const pw=Math.min(canvas.width,Math.ceil((dirty.x+dirty.w)*scale)+1)-px;
    const ph=Math.min(canvas.height,Math.ceil((dirty.y+dirty.h)*scale)+1)-py;
    if(pw<=0||ph<=0)return;
    const left=px/scale,top=py/scale,width=pw/scale,height=ph/scale;
    const region={x:left,y:top,w:width,h:height};
    output.save();output.setTransform(1,0,0,1,0,0);
    output.clearRect(px,py,pw,ph);
    output.beginPath();output.rect(px,py,pw,ph);output.clip();
    output.setTransform(scale,0,0,scale,0,0);
    const settled=layer=>output.drawImage(layer.node,px,py,pw,ph,left,top,width,height);
    settled(ground);
    for(const item of active)if(!item.flower&&item.age>0&&intersects(region,item.bounds))draw(output,item,item.progress,true);
    settled(grass);
    for(const item of active)if(!item.flower&&item.age>0&&intersects(region,item.bounds))draw(output,item,item.progress);
    settled(flowers);
    for(const item of active)if(item.flower&&item.age>0&&intersects(region,item.bounds))draw(output,item,item.progress);
    output.globalCompositeOperation='destination-in';
    output.drawImage(mask.node,left*maskScale,top*maskScale,width*maskScale,height*maskScale,left,top,width,height);
    output.restore();
  }
  function tick(now) {
    frame=0;
    if(document.hidden||!visible||!ready){last=nextFrame=0;return;}
    // Avoid redundant work on high-refresh monitors. No idle frame loop.
    if(nextFrame&&now<nextFrame){frame=requestAnimationFrame(tick);return;}
    const dt=last?Math.min(now-last,50):1000/60;
    last=now;
    nextFrame=nextFrame ? now+1000/60-((now-nextFrame)%(1000/60)) : now+1000/60;
    let moving=false,dirty=null;
    if(painting){
      x+=(tx-x)*(motion.matches?1:1-Math.exp(-dt*.007));
      y+=(ty-y)*(motion.matches?1:1-Math.exp(-dt*.007));radius=tr;
      moving=Math.abs(tx-x)+Math.abs(ty-y)>.1;
      if(!moving){x=tx;y=ty;}
      dirty=paint();seed();
    }
    for(let i=active.length-1;i>=0;i--){
      const item=active[i];item.age+=dt;
      item.progress=motion.matches?1:Math.min(1,Math.max(0,item.age/item.duration));
      if(item.progress<=0)continue;
      dirty=join(dirty,item.bounds);
      if(item.progress>=1){
        if(!item.flower)draw(ground.ctx,item,1,true);
        draw((item.flower?flowers:grass).ctx,item,1);
        item.sprite=item.groundSprite=null;active.splice(i,1);
      }
    }
    if(dirty)composite(dirty);
    if(moving||active.length)frame=requestAnimationFrame(tick);else last=nextFrame=0;
  }
  function wake() {
    if(!frame&&ready&&visible&&!document.hidden&&(painting||active.length))frame=requestAnimationFrame(tick);
  }
  function geometry() {box=scene.getBoundingClientRect();}
  function locate(event) {
    if(!box)geometry();
    const sx=event?event.clientX-box.left:box.width*.68;
    const sy=event?event.clientY-box.top:box.height*.66;
    if(sx<0||sy<0||sx>box.width||sy>box.height)return null;
    const width=Math.max(box.width,box.height*16/9),height=width*9/16;
    const imageScale=width/W;
    return {x:(sx-(box.width-width)/2)/imageScale,y:(sy-(box.height-height))/imageScale,
      r:Math.max(125,Math.min(260,box.width*.19))/imageScale};
  }
  function show(event) {
    const target=locate(event);if(!target)return;
    tx=target.x;ty=target.y;tr=target.r;
    if(!painting){x=tx;y=ty;radius=tr;seedPoint=null;stamp=null;}
    painting=true;load();wake();
  }
  function end() {painting=false;point=null;wake();}
  function input(event) {point={clientX:event.clientX,clientY:event.clientY};show(point);}
  scene.addEventListener('pointerenter',event=>{
    geometry();if(event.pointerType!=='touch')input(event);
  });
  scene.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'&&!event.buttons)return;
    input(event);
  },{passive:true});
  scene.addEventListener('pointerdown',event=>{
    if(event.pointerType==='touch'){geometry();input(event);}
  },{passive:true});
  scene.addEventListener('pointerleave',end);
  scene.addEventListener('pointercancel',end);
  scene.addEventListener('pointerup',event=>{if(event.pointerType==='touch')end();});
  scene.addEventListener('focus',()=>{if(scene.matches(':focus-visible')){geometry();show();}});
  scene.addEventListener('blur',end);
  window.addEventListener('scroll',()=>{
    if(!painting||!point)return;
    geometry();if(locate(point))show(point);else end();
  },{passive:true});
  new ResizeObserver(()=>{geometry();if(painting&&point)show(point);}).observe(scene);
  new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting))load();
  },{rootMargin:'500px'}).observe(scene);
  new IntersectionObserver(entries=>{
    visible=entries.some(entry=>entry.isIntersecting);
    if(!visible){end();if(frame)cancelAnimationFrame(frame);frame=last=nextFrame=0;}else wake();
  }).observe(scene);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){end();if(frame)cancelAnimationFrame(frame);frame=last=nextFrame=0;}else wake();
  });
  window.addEventListener('blur',end);
  motion.addEventListener('change',wake);
})();
