// Routes through the two main roads; every proposed segment is collision-checked.
export function routeTo(start,target,blocked){
 if(!target)return {points:[],routed:false};
 const s=[start.x,start.z], t=[...target];
 const candidates=[[s,t],[s,[0,s[1]],[0,t[1]],t],[s,[s[0],0],[t[0],0],t]];
 const clear=(a,b)=>{const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));for(let i=1;i<=n;i++)if(blocked(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,.7))return false;return true};
 const valid=candidates.filter(p=>p.slice(1).every((v,i)=>clear(p[i],v)));
 const length=p=>p.slice(1).reduce((n,v,i)=>n+Math.hypot(v[0]-p[i][0],v[1]-p[i][1]),0);
 valid.sort((a,b)=>length(a)-length(b));
 return {points:(valid[0]||[s,t]).filter((v,i,a)=>i===0||Math.hypot(v[0]-a[i-1][0],v[1]-a[i-1][1])>.1),routed:valid.length>0};
}
export function cameraFraming(aspect,vehicle,speed=0){
 const baseD=vehicle?20:15,baseH=vehicle?20:16;
 const widening=Math.max(1,Math.min(2.8,(vehicle?1.1:1.08)/aspect));
 const boost=vehicle?1+Math.min(speed/25,1)*.18:1;
 return {distance:baseD*widening*boost,height:1.2+(baseH-1.2)*widening*boost,lead:vehicle?Math.min(speed*.22,4):0};
}
