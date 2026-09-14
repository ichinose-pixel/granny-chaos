import * as T from './three.module.js';
import data from './granny-rig-data.js';
const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(data.positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(data.normals,3));geo.setAttribute('color',new T.Float32BufferAttribute(data.colors,3));geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(data.skinIndex,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(data.skinWeight,4));geo.setIndex(data.indices);geo.computeBoundingSphere();
function mesh(g,geometry,color,x,y,z){let m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.56}));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m}
function ell(g,c,x,y,z,rx,ry,rz){const m=mesh(g,new T.SphereGeometry(1,18,12),c,x,y,z);m.scale.set(rx,ry,rz);return m}
function tube(g,points,r,c){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),20,r,7,false),c,0,0,0)}
export function makeCharacter(isGranny=true,variant=0){
 const group=new T.Group(),root=new T.Group();group.add(root);const bones=data.bones.map((_,i)=>{let b=new T.Bone();b.name='joint_'+i;return b});data.bones.forEach(([parent,p],i)=>{let offset=parent<0?[0,0,0]:data.bones[parent][1];bones[i].position.set(...p.map((n,j)=>n-offset[j]));if(parent>=0)bones[parent].add(bones[i])});
 const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.58,metalness:0});const body=new T.SkinnedMesh(geo,material);root.add(body);body.add(bones[0]);root.updateMatrixWorld(true);body.bind(new T.Skeleton(bones));body.castShadow=body.receiveShadow=true;body.frustumCulled=false;
 const head=bones[4],chest=bones[2],wrist=bones[7];
 if(isGranny){
  // Soft sculpted silver hair cap, bun and large glasses identify the silhouette.
  let cap=mesh(head,new T.SphereGeometry(1,24,16,0,Math.PI*2,0,Math.PI*.55),'#dedbce',0,.11,-.035);cap.scale.set(.322,.273,.282);cap.rotation.x=-.2;
  ell(head,'#d6d6ce',0,.34,-.205,.165,.165,.155);
  for(let i=0;i<7;i++){let a=Math.PI*.15+i/6*Math.PI*.7;ell(head,i%2?'#e5e1d6':'#d1d1ca',Math.cos(a)*.29,.17,Math.sin(a)*.15-.07,.08,.092,.075)}
  for(let side of [-1,1]){
   let x=side*.136;let ring=mesh(head,new T.TorusGeometry(.112,.02,8,28),'#815629',x,.0,.285);ring.scale.y=.86;
   tube(head,[[x+side*.11,0,.28],[side*.30,-.015,.19],[side*.30,-.02,.01]],.013,'#815629');
   ell(head,'#292e35',x,-.005,.274,.024,.031,.015);ell(head,'#f6ead8',x-.006,.006,.286,.007,.009,.004);
   tube(head,[[x-.055,.10,.272],[x,.118,.28],[x+.055,.10,.273]],.013,'#aaa79c');
   ell(head,'#dda38b',side*.19,-.115,.256,.059,.028,.009);ell(head,'#d4aa55',side*.316,-.105,-.007,.03,.038,.023);
  }
  tube(head,[[-.025,0,.304],[0,.012,.307],[.025,0,.304]],.014,'#815629');tube(head,[[-.055,-.195,.273],[0,-.203,.28],[.055,-.19,.273]],.009,'#9b6564');
  for(let y of [-.02,-.15,-.28,-.41])ell(chest,'#efdbb2',0,y,.244,.022,.022,.012);
  tube(chest,[[-.18,.02,.19],[-.1,-.065,.25],[0,-.10,.26],[.1,-.065,.25],[.18,.02,.19]],.025,'#eddfc5');
 }else{
  let cap=mesh(head,new T.SphereGeometry(1,16,10,0,Math.PI*2,0,Math.PI*.54),['#514839','#624035','#303f49'][variant%3],0,.10,-.025);cap.scale.set(.315,.275,.28);
  for(let x of [-.125,.125])ell(head,'#303033',x,.015,.278,.022,.028,.012);
  material.color.set(['#cfdae6','#e8d6c1','#c9e6d8'][variant%3]);
 }
 let bag=new T.Group();wrist.add(bag);bag.position.set(.015,-.14,.04);ell(bag,'#93502c',0,-.10,0,.23,.185,.12);tube(bag,[[-.13,.02,0],[-.11,.19,0],[.11,.19,0],[.13,.02,0]],.021,'#623926');ell(bag,'#ebc86a',0,-.045,.121,.038,.032,.012);bag.visible=isGranny;
 group.userData={bones,body,root,bag,move:0,phase:0,attack:0,seat:0,isGranny};return group;
}
const damp=(a,b,dt)=>T.MathUtils.damp(a,b,10,dt);
export function animateCharacter(group,{speed=0,seated=false,attack=0,dt=.016,time=0}={}){
 const u=group.userData,b=u.bones;u.move=damp(u.move,Math.min(1,Math.abs(speed)/4),dt);u.seat=damp(u.seat,seated?1:0,dt);u.phase+=dt*(5+Math.min(8,Math.abs(speed)*1.1));let walk=u.move*(1-u.seat),s=Math.sin(u.phase),c=Math.cos(u.phase),seat=u.seat;
 b[0].position.y=1+Math.abs(s)*.055*walk-.09*seat;b[0].rotation.y=s*.05*walk;b[1].rotation.x=.055+.06*walk;b[2].rotation.y=-s*.06*walk;b[4].rotation.x=Math.sin(time*1.8)*.018;b[4].rotation.y=Math.sin(time*.7)*.045*(1-u.move);
 for(let [hip,knee,foot,sign] of [[11,12,13,1],[14,15,16,-1]]){let swing=s*sign;b[hip].rotation.x=swing*.62*walk-Math.PI*.43*seat;b[knee].rotation.x=Math.max(0,-swing)*.75*walk+Math.PI*.47*seat;b[foot].rotation.x=-Math.max(0,swing)*.13*walk-.12*seat}
 b[5].rotation.x=-s*.48*walk-seat*.95;b[8].rotation.x=s*.48*walk-seat*.95;b[6].rotation.x=-.16-Math.max(0,c)*.22*walk-seat*.25;b[9].rotation.x=-.16-Math.max(0,-c)*.22*walk-seat*.25;b[5].rotation.z=-.06;b[8].rotation.z=.06;
 if(attack>0){let p=Math.sin((1-attack/.6)*Math.PI);b[5].rotation.x-=p*1.8;b[5].rotation.z=-p*.7;b[6].rotation.x-=p*.8;b[2].rotation.y-=p*.22}
 u.bag.rotation.x=s*.14*walk;u.bag.rotation.z=Math.sin(time*3)*.035;u.root.rotation.z=-s*.025*walk;
}
