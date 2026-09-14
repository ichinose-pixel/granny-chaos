// Screen-relative arcade driving. Heading affects presentation, not input direction.
export function stepDrive(state,input,dt){
 dt=Math.max(0,Math.min(.05,dt));
 const length=Math.hypot(input.x,input.y),active=length>.12;
 const strength=active?Math.min(1,(length-.12)/.88):0;
 const nx=active?input.x/length:0,ny=active?input.y/length:0;
 const dx=Math.sin(input.yaw)*ny-Math.cos(input.yaw)*nx;
 const dz=Math.cos(input.yaw)*ny+Math.sin(input.yaw)*nx;
 const tx=dx*input.maxSpeed*strength,tz=dz*input.maxSpeed*strength;
 const vx=state.vx||0,vz=state.vz||0;
 const braking=!active||vx*tx+vz*tz<0;
 const blend=1-Math.exp(-(braking?20:10)*dt);
 let nextX=vx+(tx-vx)*blend,nextZ=vz+(tz-vz)*blend;
 if(!active&&Math.hypot(nextX,nextZ)<.08)nextX=nextZ=0;
 let angle=state.angle||0;
 if(active){const target=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(target-angle),Math.cos(target-angle));angle+=Math.max(-9*dt,Math.min(9*dt,delta))}
 return {vx:nextX,vz:nextZ,speed:Math.hypot(nextX,nextZ),angle,active,strength,dx:nextX*dt,dz:nextZ*dt};
}
