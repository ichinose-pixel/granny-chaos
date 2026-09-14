"""Original skinned casual-3D character. No reference geometry or animations copied.
Generate a smooth implicit surface with a 17-joint skeleton and vertex colors.
"""
from pathlib import Path
import numpy as np,json
step=.09
axes=[np.arange(-.92,.94,step),np.arange(-.02,2.64,step),np.arange(-.5,.63,step)]
X,Y,Z=np.meshgrid(*axes,indexing='ij');P=np.stack([X,Y,Z],-1);fields=[];labels=[]
def ell(c,r,region):
 d=np.linalg.norm((P-np.array(c))/r,axis=-1)-1
 fields.append(d*min(r));labels.append(region)
def limb(a,b,r,region):
 a=np.array(a);b=np.array(b);v=b-a;t=np.clip(np.sum((P-a)*v,axis=-1)/np.dot(v,v),0,1)
 fields.append(np.linalg.norm(P-a-t[...,None]*v,axis=-1)-r);labels.append(region)
# Torso and skirt overlap softly into one silhouette.
ell((0,1.37,0),(.34,.4,.245),0);ell((0,1.05,.01),(.37,.3,.26),0)
ell((0,.86,0),(.40,.30,.28),8);limb((0,1.63,.025),(0,1.87,.08),.125,1)
ell((0,2.08,.1),(.305,.345,.28),1);ell((0,1.92,.19),(.235,.185,.22),1)
ell((0,2.025,.367),(.065,.077,.08),1)
for sign in [-1,1]:
 off=0 if sign>0 else 10
 ell((sign*.3,2.04,.1),(.055,.08,.07),1)
 limb((sign*.3,1.59,0),(sign*.64,1.22,.015),.115,2+off)
 limb((sign*.64,1.22,.015),(sign*.74,.96,.065),.088,3+off)
 ell((sign*.765,.88,.08),(.09,.115,.095),4+off)
 limb((sign*.19,.94,0),(sign*.2,.54,.025),.116,5+off)
 limb((sign*.2,.54,.025),(sign*.2,.17,.025),.087,6+off)
 ell((sign*.2,.115,.095),(.115,.10,.19),7+off)
# Polynomial smooth union maintains continuous rounded shoulders and knees.
D=fields[0].copy()
for f in fields[1:]:
 k=.07;h=np.maximum(k-np.abs(D-f),0)/k;D=np.minimum(D,f)-h*h*k*.25
shape=D.shape
# Marching tetrahedra, deterministic original mesh extraction.
corner=np.array([[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]])
tets=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]]
edges=[(0,1),(1,2),(2,0),(0,3),(1,3),(2,3)]
tri={1:[0,3,2],2:[0,1,4],3:[1,4,2,2,4,3],4:[1,2,5],5:[0,3,5,0,5,1],6:[0,2,5,0,5,4],7:[5,4,3],8:[3,4,5],9:[4,5,0,5,2,0],10:[1,5,0,5,3,0],11:[5,2,1],12:[3,4,2,2,4,1],13:[4,1,0],14:[2,3,0]}
lo=np.minimum.reduce([D[a:a+shape[0]-1,b:b+shape[1]-1,c:c+shape[2]-1] for a,b,c in corner]);hi=np.maximum.reduce([D[a:a+shape[0]-1,b:b+shape[1]-1,c:c+shape[2]-1] for a,b,c in corner]);cubes=np.argwhere((lo<=0)&(hi>=0));vertices=[]
for base in cubes:
 ij=corner+base;vals=D[ij[:,0],ij[:,1],ij[:,2]];pts=P[ij[:,0],ij[:,1],ij[:,2]]
 for tet in tets:
  f=vals[tet];code=sum((1<<i) for i in range(4) if f[i]<0)
  if code not in tri:continue
  for e in tri[code]:
   i,j=edges[e];a,b=tet[i],tet[j];u=vals[a]/(vals[a]-vals[b]);vertices.append(pts[a]+u*(pts[b]-pts[a]))
vertices=np.array(vertices);V,inv=np.unique(np.round(vertices,5),axis=0,return_inverse=True);faces=inv.reshape(-1,3)
# Smooth normals from the scalar-field gradient, then make triangle winding outward.
from scipy.ndimage import map_coordinates
G=np.gradient(D,step);grid=np.array([(V[:,i]-axes[i][0])/step for i in range(3)])
N=np.stack([map_coordinates(g,grid,order=1,mode='nearest') for g in G],-1);N/=np.maximum(np.linalg.norm(N,axis=1,keepdims=True),1e-9)
cross=np.cross(V[faces[:,1]]-V[faces[:,0]],V[faces[:,2]]-V[faces[:,0]]);flip=np.sum(cross*N[faces[:,0]],axis=1)<0;faces[flip]=faces[flip][:,[0,2,1]]
F=np.stack([map_coordinates(f,grid,order=1,mode='nearest') for f in fields]);regions=np.array(labels)[F.argmin(axis=0)]
bones=[[-1,[0,1,0]],[0,[0,1.3,0]],[1,[0,1.58,0]],[2,[0,1.76,.07]],[3,[0,2.09,.11]],[2,[.37,1.58,0]],[5,[.64,1.18,.015]],[6,[.765,.88,.07]],[2,[-.37,1.58,0]],[8,[-.64,1.18,.015]],[9,[-.765,.88,.07]],[0,[.19,1,0]],[11,[.2,.52,.025]],[12,[.2,.16,.02]],[0,[-.19,1,0]],[14,[-.2,.52,.025]],[15,[-.2,.16,.02]]]
SI=[];SW=[];C=[]
colors={'skin':'e1b092','cardigan':'9462ad','skirt':'574c79','shoe':'493741','stocking':'bea393'}
def rgb(h):
 a=np.array([int(h[i:i+2],16)/255 for i in (0,2,4)]);return np.where(a<=.04045,a/12.92,((a+.055)/1.055)**2.4).tolist()
for v,region in zip(V,regions):
 x,y,z=v;r=int(region);side=3 if r>=10 else 0;r%=10
 if r==0:
  if y<1.2:a,b,t=0,1,np.clip((y-.98)/.3,0,1)
  else:a,b,t=1,2,np.clip((y-1.28)/.29,0,1)
  col='cardigan'
 elif r==1:a,b,t=3,4,np.clip((y-1.74)/.16,0,1);col='skin'
 elif r==8:a,b,t=0,0,0;col='skirt'
 elif r in [2,3,4]:
  if y>1.19:a,b,t=5+side,6+side,np.clip((1.32-y)/.24,0,1)
  else:a,b,t=6+side,7+side,np.clip((1.01-y)/.2,0,1)
  col='cardigan' if y>.99 else 'skin'
 else:
  if y>.52:a,b,t=11+side,12+side,np.clip((.64-y)/.24,0,1)
  else:a,b,t=12+side,13+side,np.clip((.27-y)/.2,0,1)
  col='shoe' if r==7 else 'stocking'
 weights={a:1-float(t)};weights[b]=weights.get(b,0)+float(t)
 if r==8:
  t=float(np.clip((1.07-y)/.4,0,1));right=float(np.clip(x/.7+.5,0,1));weights={0:1-t,11:t*right,14:t*(1-right)}
 if r in [0,2] and y>1.42 and abs(x)>.2:
  influence=float(np.clip((abs(x)-.22)/.24,0,1));arm=5 if x>0 else 8;weights={2:1-influence,arm:influence}
 items=list(weights.items());items+= [(0,0)]*(4-len(items));SI.extend([a for a,b in items]);SW.extend([round(b,5) for a,b in items]);C.extend(rgb(colors[col]))
data={'positions':np.round(V,5).ravel().tolist(),'normals':np.round(N,5).ravel().tolist(),'indices':faces.ravel().tolist(),'colors':np.round(C,5).tolist(),'skinIndex':SI,'skinWeight':SW,'bones':bones}
out=Path(__file__).resolve().parents[1]/'dist'/'granny-rig-data.js';out.write_text('export default '+json.dumps(data,separators=(',',':'))+';\n');print(len(V),'vertices',len(faces),'triangles',len(bones),'bones',out.stat().st_size,'bytes')
