import assert from 'node:assert/strict';
import {stepDrive} from '../dist/drive-controls.js';
for(const yaw of [0,.5,Math.PI/2,Math.PI,4.2])for(const heading of [0,Math.PI/2,Math.PI,4.7])for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1],[1,1]]){
 let s={angle:heading};for(let i=0;i<60;i++)s=stepDrive(s,{x,y,yaw,maxSpeed:12},1/60);
 const right=-Math.cos(yaw)*s.vx+Math.sin(yaw)*s.vz,up=Math.sin(yaw)*s.vx+Math.cos(yaw)*s.vz;
 if(x)assert(Math.sign(right)===Math.sign(x));else assert(Math.abs(right)<1e-7);
 if(y)assert(Math.sign(up)===Math.sign(y));else assert(Math.abs(up)<1e-7);
 assert(s.speed<=12.00001);
}
let s={vx:12,vz:0,angle:Math.PI/2};for(let i=0;i<20;i++)s=stepDrive(s,{x:0,y:0,yaw:0,maxSpeed:12},1/60);assert.equal(s.speed,0);
assert.equal(stepDrive({},{x:.06,y:.06,yaw:0,maxSpeed:12},1/60).speed,0);
s={vx:12,vz:0,angle:Math.PI/2};for(let i=0;i<12;i++)s=stepDrive(s,{x:1,y:0,yaw:0,maxSpeed:12},1/60);assert(s.vx<0);
let a=stepDrive({},{x:1,y:0,yaw:0,maxSpeed:12},1/60),b=stepDrive({},{x:.5,y:0,yaw:0,maxSpeed:12},1/60);assert(b.speed<a.speed);
console.log('PASS: 100 camera/heading/direction combinations; diagonal speed cap; release braking; dead zone; reversal; analog speed.');
