import assert from 'node:assert/strict';
import {routeTo,cameraFraming} from '../dist/navigation.js';
import * as T from '../dist/three.module.js';
const blocked=(x,z,r=0)=>Math.abs(x)>8-r&&Math.abs(z)>8-r;
const route=routeTo({x:32,z:4},[4,45],blocked);assert(route.routed);assert(route.points.length>2);
for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i];for(let t=0;t<=1;t+=.05)assert(!blocked(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,.7));}
assert(!routeTo({x:0,z:0},[20,20],blocked).routed);
for(const vehicle of [false,true]){const a=cameraFraming(390/844,vehicle,0),b=cameraFraming(390/844,vehicle,18);assert(b.distance>=a.distance);const c=new T.PerspectiveCamera(32,390/844,.1,240);c.position.set(0,a.height,-a.distance);c.lookAt(0,1.2,0);c.updateMatrixWorld();const plane=new T.Plane(new T.Vector3(0,1,0),0);const hit=x=>new T.Ray(c.position,new T.Vector3(x,0,.5).unproject(c).sub(c.position).normalize()).intersectPlane(plane,new T.Vector3());const width=hit(-1).distanceTo(hit(1));assert(width>(vehicle?15:12));console.log('Portrait ground span',vehicle?'vehicle':'walking',width.toFixed(2));}
console.log('PASS: collision-checked route, invalid-route fallback, portrait coverage and speed zoom');
