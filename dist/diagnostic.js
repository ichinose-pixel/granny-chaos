// Canvas-only observer: all gameplay, input, collision and camera calculations stay in game.js.
export class DiagnosticRenderer {
  constructor(){
    this.domElement=document.createElement('canvas');this.domElement.setAttribute('aria-label','検証用俯瞰マップ');this.shadowMap={};this.last=null;this.trail=[];this.gesture=null;this.release=null;this.results=[];
    document.body.classList.add('diagnostic');
    const style=document.createElement('style');style.textContent='.diagnostic #joystick{display:block}.diagnostic #mapbox{display:none}#diagnostics{position:fixed;top:15px;left:50%;transform:translateX(-50%);z-index:8;background:#101c2fee;padding:10px;border:1px solid #81c9ff;border-radius:8px;width:min(440px,90vw);font:13px/1.6 monospace}#diagnostics button{padding:7px;margin:3px;background:#284459;border:1px solid #8ca4b0;color:white}#diagnostics output{display:block;white-space:pre-line}#diagnostics summary{cursor:pointer}.diagnostic #destination{top:200px}';document.head.append(style);
    const panel=document.createElement('details');panel.id='diagnostics';panel.open=true;panel.innerHTML='<summary>2D操作検証（3D性能は対象外）</summary><div id="diag-actions"></div><output id="diag-live"></output><output id="diag-result"></output>';document.body.append(panel);
  }
  setPixelRatio(){} setSize(w,h){this.domElement.width=w;this.domElement.height=h;}
  setup(actions){for(const [label,action] of Object.entries(actions)){const b=document.createElement('button');b.textContent=label;b.onclick=action;document.getElementById('diag-actions').append(b);}}
  inspect(state){this.state=state;}
  render(scene,camera){
    const s=this.state;if(!s)return;const c=this.domElement.getContext('2d'),w=this.domElement.width,h=this.domElement.height;
    const f=camera.getWorldDirection(camera.position.clone());const yaw=Math.atan2(f.x,f.z),sin=Math.sin(yaw),cos=Math.cos(yaw),scale=12;
    const vector=(x,z)=>[-cos*x+sin*z,-sin*x-cos*z];const pt=(x,z)=>{const v=vector(x-s.pos.x,z-s.pos.z);return [w/2+v[0]*scale,h/2+v[1]*scale]};
    c.fillStyle='#b5c8b4';c.fillRect(0,0,w,h);
    const polygon=(points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,z],i)=>{const p=pt(x,z);i?c.lineTo(...p):c.moveTo(...p)});c.closePath();c.fill()};
    polygon([[-90,-8],[90,-8],[90,8],[-90,8]],'#414f5b');polygon([[-8,-90],[8,-90],[8,90],[-8,90]],'#414f5b');
    for(const b of s.solids)polygon([[b.x-b.w,b.z-b.d],[b.x+b.w,b.z-b.d],[b.x+b.w,b.z+b.d],[b.x-b.w,b.z+b.d]],'#71897a');
    const dot=(x,z,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(...pt(x,z),r,0,Math.PI*2);c.fill()};
    for(const p of s.props)if(p.alive)dot(p.x,p.z,4,'#db965d');for(const p of s.people)dot(p.g.position.x,p.g.position.z,3,'#f4d0c0');
    const arrow=(x,z,dx,dz,color,length)=>{const p=pt(x,z),v=vector(dx,dz),a=Math.atan2(v[1],v[0]);c.strokeStyle=color;c.fillStyle=color;c.lineWidth=3;c.beginPath();c.moveTo(...p);const ex=p[0]+Math.cos(a)*length,ey=p[1]+Math.sin(a)*length;c.lineTo(ex,ey);c.stroke();c.beginPath();c.moveTo(ex,ey);c.lineTo(ex-9*Math.cos(a-.5),ey-9*Math.sin(a-.5));c.lineTo(ex-9*Math.cos(a+.5),ey-9*Math.sin(a+.5));c.fill()};
    for(const v of s.cars){dot(v.g.position.x,v.g.position.z,v.type===0?9:14,v===s.vehicle?'#e4ef51':v.type===2?'#ff7171':'#73c6f4');arrow(v.g.position.x,v.g.position.z,Math.sin(v.angle),Math.cos(v.angle),'#fff',22)}
    if(!s.vehicle)dot(s.pos.x,s.pos.z,8,'#e4ef51');if(s.target)dot(s.target[0],s.target[1],10,'#f6bd31');
    this.trail.push([s.pos.x,s.pos.z]);if(this.trail.length>350)this.trail.shift();c.strokeStyle='#f6df8380';c.lineWidth=2;c.beginPath();this.trail.forEach(([x,z],i)=>i?c.lineTo(...pt(x,z)):c.moveTo(...pt(x,z)));c.stroke();
    arrow(s.pos.x,s.pos.z,Math.sin(s.angle),Math.cos(s.angle),'#fff',42);
    const active=Math.hypot(s.ix,s.iy)>.12;
    if(active)arrow(s.pos.x,s.pos.z,sin*s.iy-cos*s.ix,cos*s.iy+sin*s.ix,'#60e6ff',72);
    if(s.vehicle?.speed>.08)arrow(s.pos.x,s.pos.z,s.vehicle.vx,s.vehicle.vz,'#ff90d2',Math.min(95,20+s.vehicle.speed*4));
    if(active&&!this.gesture)this.gesture={distance:0,along:0,side:0,start:s.time};
    if(this.last&&s.time>this.last.time){const dx=s.pos.x-this.last.x,dz=s.pos.z-this.last.z,d=vector(dx,dz),n=Math.hypot(this.last.ix,this.last.iy);if(this.gesture&&n>.12){this.gesture.distance+=Math.hypot(dx,dz);this.gesture.along+=(d[0]*this.last.ix-d[1]*this.last.iy)/n;this.gesture.side+=Math.abs(d[0]*this.last.iy+d[1]*this.last.ix)/n;}}
    if(!active&&this.gesture){this.release={...this.gesture,x:s.pos.x,z:s.pos.z,time:s.time};this.gesture=null;}
    if(this.release&&(!s.vehicle||s.vehicle.speed===0)){const r=this.release;const result=`操作 ${r.distance.toFixed(2)}m / 入力方向 ${r.along.toFixed(2)}m / 横ずれ ${r.side.toFixed(2)}m\n停止 ${(s.time-r.time).toFixed(2)}秒 / 停止距離 ${Math.hypot(s.pos.x-r.x,s.pos.z-r.z).toFixed(2)}m`;document.getElementById('diag-result').textContent=result;this.results.push(result);this.release=null;}
    document.getElementById('diag-live').textContent=`${s.vehicle?(s.vehicle.type===0?'シニアカー':'乗用車'):'徒歩'} | 入力 ${s.ix.toFixed(2)},${s.iy.toFixed(2)} | 速度 ${(s.vehicle?.speed||0).toFixed(2)}m/s\n位置 ${s.pos.x.toFixed(2)},${s.pos.z.toFixed(2)} | カメラ ${(yaw*180/Math.PI).toFixed(0)}° | 衝突 ${s.hits}\n白:車の正面 水色:入力 ピンク:移動`;
    this.last={x:s.pos.x,z:s.pos.z,time:s.time,ix:s.ix,iy:s.iy};
  }
}
