import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// An original, stylized Tokyo diorama. Coordinates are art-directed, not a street map.
export default function CityScene({ night, reducedMotion, onReady, landmarkRef }) {
  const host = useRef(null);
  const options = useRef({ night, reducedMotion });
  useEffect(() => { options.current = { night, reducedMotion }; }, [night, reducedMotion]);

  useEffect(() => {
    const container = host.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch { onReady('unavailable'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 180);
    const city = new THREE.Group();
    scene.add(city);
    const ambient = new THREE.HemisphereLight('#fff7e2', '#b4aaa1', 2.5);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight('#ffdcc0', 4);
    sun.position.set(-12, 25, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: .5, far: 65 });
    sun.shadow.bias = -.001;
    sun.shadow.normalBias = .04;
    scene.add(sun);
    const rim = new THREE.DirectionalLight('#b5cded', 1.4);
    rim.position.set(10, 10, -12); scene.add(rim);

    const materials = {};
    const buckets = new Map();
    const material = (name, color, props = {}) => materials[name] = new THREE.MeshStandardMaterial({ color, roughness: .78, ...props });
    material('base', '#c9c4b9'); material('ground', '#ddd7c9'); material('road', '#a9a89f');
    material('cream', '#e4dfd1'); material('white', '#f4eee1'); material('pink', '#d6b6a6');
    material('sage', '#9fae9f'); material('slate', '#9bacae'); material('sand', '#cabc9f');
    material('glass', '#6e8585', { metalness: .3, roughness: .3 });
    material('window', '#5c7374', { emissive: '#ffc56e', emissiveIntensity: 0 });
    material('red', '#e44e2c', { emissive: '#e74c23', emissiveIntensity: 0 });
    material('dark', '#435454'); material('leaf', '#88966b'); material('leafLight', '#a6ac7b');
    material('bloom', '#e6b8b3'); material('trunk', '#93816a'); material('water', '#87adb0', { metalness: .15, roughness: .3 });
    material('mark', '#eae3d0'); material('light', '#ffe6a0', { emissive: '#ffd78c', emissiveIntensity: .3 });
    const add = (geo, name, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const matrix = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(1, 1, 1));
      geo.applyMatrix4(matrix);
      if (!buckets.has(name)) buckets.set(name, []);
      buckets.get(name).push(geo);
    };
    const box = (x,y,z,w,h,d,mat,ry=0) => add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,0,ry);
    const beam = (a,b,r,mat) => {
      const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), mid = va.clone().add(vb).multiplyScalar(.5);
      const geo = new THREE.CylinderGeometry(r,r,va.distanceTo(vb),5);
      geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),vb.sub(va).normalize()));
      geo.translate(...mid.toArray()); if (!buckets.has(mat)) buckets.set(mat,[]); buckets.get(mat).push(geo);
    };
    let seed = 18;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed-1)/2147483646; };

    // Layered architectural model base, canal and connected city blocks.
    box(0,-.45,0,21,.65,17,'base'); box(0,-.075,0,21,.12,17,'ground');
    box(7.9,.005,0,3.5,.045,17,'water');
    for (let z=-7.5;z<8;z+=.6) box(7.9,.037,z,2.8,.013,.015,'white');
    const roadsX = [-7,-3.5,0,3.5];
    const roadsZ = [-5.4,-1.9,1.6,5.1];
    roadsX.forEach(x => box(x,.018,0,.68,.04,17,'road'));
    roadsZ.forEach(z => box(-2,.02,z,17,.04,.65,'road'));
    for(const x of roadsX) for(let z=-8;z<8;z+=.6) box(x,.044,z,.035,.008,.26,'mark');
    for(const z of roadsZ) for(let x=-10;x<6;x+=.6) box(x,.047,z,.26,.008,.035,'mark');
    for(const x of roadsX) for(const z of roadsZ) for(let i=0;i<5;i++) {
      box(x-.24+i*.12,.052,z+.53,.065,.008,.28,'white');
      box(x+.53,.052,z-.24+i*.12,.28,.008,.065,'white');
    }
    const palette = ['cream','white','pink','sage','slate','sand'];
    for (let ix=0;ix<5;ix++) for(let iz=0;iz<5;iz++) {
      const cx=-8.8+ix*3.5, cz=-7.15+iz*3.5;
      if(ix===2 && (iz===2 || iz===3)) continue;
      if(ix===4 && iz===4) continue;
      for(let j=0;j<4;j++) {
        const x=cx+(j%2)*1.38-.65, z=cz+Math.floor(j/2)*1.36-.65;
        const h=.7+rand()*2.8+(iz===0?rand()*1.7:0), w=.8+rand()*.38, d=.8+rand()*.37;
        const mat=palette[Math.floor(rand()*palette.length)];
        box(x,h/2+.09,z,w,h,d,mat);
        box(x,h+.12,z,w+.07,.09,d+.07,'white');
        box(x+.16,h+.27,z+.12,w*.35,.25,d*.35,'base');
        for(let floor=.35;floor<h-.1;floor+=.34) {
          for(let k=-1;k<=1;k++) {
            box(x+k*w*.27,floor,z+d/2+.008,w*.15,.15,.014,'window');
            box(x+w/2+.008,floor,z+k*d*.27,.014,.15,d*.15,'window');
          }
        }
        if(rand()>.73) { box(x-w/2-.035,h*.64,z+.1,.06,h*.47,.23,'red'); }
        if(rand()>.8) beam([x,h,z],[x,h+.6,z],.017,'dark');
      }
    }
    // A glass landmark with a stepped crown.
    box(2,2.8,-6.8,1.5,5.6,1.7,'glass');
    for(let y=.3;y<5.6;y+=.24) box(2,y,-6.8,1.54,.045,1.74,'white');
    box(2,5.8,-6.8,1.2,.4,1.3,'slate');
    // Tokyo Tower: four tapered legs with real open lattice geometry.
    const tx=-1.8,tz=.15;
    const levels = [{y:.05,r:1.55},{y:2.2,r:1.03},{y:4.3,r:.53},{y:6.3,r:.3},{y:8.0,r:.14},{y:9.2,r:.035}];
    for(let l=0;l<levels.length-1;l++) {
      const a=levels[l],b=levels[l+1];
      for(let side=0;side<4;side++) {
        const corners=[[-1,-1],[1,-1],[1,1],[-1,1]], c=corners[side],next=corners[(side+1)%4];
        beam([tx+c[0]*a.r,a.y,tz+c[1]*a.r],[tx+c[0]*b.r,b.y,tz+c[1]*b.r],l<2?.07:.045,l===3?'white':'red');
        for(let s=0;s<4;s++) {
          const p=s/4,q=(s+1)/4, y1=THREE.MathUtils.lerp(a.y,b.y,p), y2=THREE.MathUtils.lerp(a.y,b.y,q),r1=THREE.MathUtils.lerp(a.r,b.r,p),r2=THREE.MathUtils.lerp(a.r,b.r,q);
          const mat=l===3?'white':'red';
          beam([tx+c[0]*r1,y1,tz+c[1]*r1],[tx+next[0]*r2,y2,tz+next[1]*r2],.024,mat);
          beam([tx+next[0]*r1,y1,tz+next[1]*r1],[tx+c[0]*r2,y2,tz+c[1]*r2],.024,mat);
          beam([tx+c[0]*r1,y1,tz+c[1]*r1],[tx+next[0]*r1,y1,tz+next[1]*r1],.032,mat);
        }
      }
    }
    box(tx,4.25,tz,1.8,.25,1.8,'white'); box(tx,4.48,tz,1.55,.24,1.55,'red');
    box(tx,4.5,tz,1.58,.13,1.58,'window'); box(tx,4.68,tz,1.7,.07,1.7,'white');
    box(tx,6.7,tz,.85,.27,.85,'white'); box(tx,6.73,tz,.87,.12,.87,'window');
    beam([tx,9,tz],[tx,10.4,tz],.045,'red'); beam([tx,9.7,tz],[tx,10.4,tz],.049,'white');
    // Park, cherry trees and a shrine south of the tower.
    box(-1.8,.035,3.7,2.6,.06,2.5,'sage');
    const tree = (x,z,bloom=false,size=1) => {
      beam([x,.04,z],[x,.6*size,z],.07,'trunk');
      add(new THREE.IcosahedronGeometry(.45*size,1),bloom?'bloom':'leaf',x,.9*size,z);
      add(new THREE.IcosahedronGeometry(.3*size,0),bloom?'bloom':'leafLight',x+.22*size,1.03*size,z+.06);
    };
    for(let i=0;i<43;i++) { const x=-9.8+rand()*15.4,z=-8+rand()*16; tree(x,z,rand()>.7,.7+rand()*.5); }
    for(let i=0;i<7;i++) tree(-2.8+(i%3)*.8,3+Math.floor(i/3)*.8,true,.85);
    for(let z=-7;z<8;z+=1.3) tree(5.8,z,false,.75);
    box(-1.8,.8,6.4,1.5,1.5,1.5,'white');
    for(let i=0;i<3;i++) { const y=1.4+i*.65,w=2-i*.32; box(-1.8,y,6.4,w,.17,w,'dark'); box(-1.8,y+.25,6.4,w*.63,.4,w*.63,'red'); }
    beam([-2.5,0,5.6],[-2.5,1.5,5.6],.085,'red'); beam([-1.1,0,5.6],[-1.1,1.5,5.6],.085,'red');
    box(-1.8,1.5,5.6,1.9,.15,.2,'red'); box(-1.8,1.23,5.6,1.65,.11,.15,'red');
    // Canal bridges, rail viaduct and an animated commuter train.
    for(const z of [-5.4,1.6]) {
      box(8,.18,z,4.2,.25,.8,'ground');
      for(const dz of [-.42,.42]) { box(8,.48,z+dz,4.2,.06,.05,'white'); for(let x=6.2;x<10;x+=.4) box(x,.35,z+dz,.035,.4,.035,'white'); }
    }
    box(0,.62,7.4,21,.2,.62,'base');
    for(let x=-9;x<10;x+=2) box(x,.28,7.4,.25,.56,.4,'white');
    for(const z of [7.2,7.6]) box(0,.74,z,21,.035,.025,'dark');
    const train = new THREE.Group();
    for(let i=0;i<3;i++) {
      const carriage = new THREE.Mesh(new THREE.BoxGeometry(1.5,.42,.44),materials.white); carriage.position.set(i*1.65,.99,7.4);train.add(carriage);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.51,.08,.46),materials.red);stripe.position.set(i*1.65,.9,7.4);train.add(stripe);
      for(let j=0;j<5;j++) { const win=new THREE.Mesh(new THREE.BoxGeometry(.16,.14,.455),materials.glass);win.position.set(i*1.65-.52+j*.26,1.05,7.4);train.add(win); }
    }
    city.add(train);
    for(let i=0;i<15;i++) { const x=roadsX[i%4]+.15,z=-7+rand()*14; box(x,.16,z,.19,.19,.43,i%3===0?'red':'white'); }
    // Bake repeated details into a small set of draw calls.
    for(const [name,geometries] of buckets) {
      const merged=mergeGeometries(geometries); const mesh=new THREE.Mesh(merged,materials[name]);
      mesh.castShadow=name!=='water' && name!=='mark';mesh.receiveShadow=true;city.add(mesh);geometries.forEach(g=>g.dispose());
    }
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({ opacity:.14 }));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=-.79;shadow.receiveShadow=true;scene.add(shadow);
    const target = new THREE.Vector3();
    const desired = new THREE.Vector3();
    const labelPoint = new THREE.Vector3();
    const keyframes = [
      { p:[24,20,28],t:[0,2,0],r:-.28 },
      { p:[17,12,22],t:[-1.7,4,.1],r:.18 },
      { p:[-20,15,24],t:[-1,1.6,2],r:.15 },
      { p:[23,24,27],t:[0,1.9,0],r:-.6 },
    ];
    camera.position.set(...keyframes[0].p);target.set(...keyframes[0].t);city.rotation.y=-.28;
    let width=1,height=1,frame,previous=0,progress=0,nightMix=options.current.night?1:0,pointerX=0,pointerY=0,visible=true;
    const resize = () => { width=container.clientWidth;height=container.clientHeight;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height); };
    const observer=new ResizeObserver(resize);observer.observe(container);resize();
    const pointer = e => {pointerX=(e.clientX/window.innerWidth-.5);pointerY=(e.clientY/window.innerHeight-.5);};
    window.addEventListener('pointermove',pointer,{passive:true});
    const visibility=()=>{visible=!document.hidden;};document.addEventListener('visibilitychange',visibility);
    const contextLost = e => { e.preventDefault(); onReady('unavailable'); };
    renderer.domElement.addEventListener('webglcontextlost',contextLost);
    const animate = now => {
      frame=requestAnimationFrame(animate); if(!visible)return;
      const dt=Math.min((now-previous)/1000,.05);previous=now;
      const reduced=options.current.reducedMotion;
      const raw=Math.min(window.scrollY/(document.querySelector('.chapter')?.offsetHeight||window.innerHeight),3);
      progress=THREE.MathUtils.lerp(progress,raw,reduced?1:1-Math.exp(-dt*5));
      const index=Math.min(Math.floor(progress),2),f=THREE.MathUtils.smoothstep(progress-index,0,1);
      const a=keyframes[index],b=keyframes[index+1];
      desired.fromArray(a.p).lerp(new THREE.Vector3(...b.p),f);
      if(width<700) desired.multiplyScalar(1.28);
      if(!reduced) {desired.x+=pointerX*.7;desired.y+=pointerY*.35;}
      camera.position.copy(desired);target.fromArray(a.t).lerp(new THREE.Vector3(...b.t),f);camera.lookAt(target);
      city.rotation.y=THREE.MathUtils.lerp(a.r,b.r,f);
      if(!reduced)train.position.x=((now*.00085)%23)-13;
      nightMix=THREE.MathUtils.lerp(nightMix,options.current.night?1:0,1-Math.exp(-dt*3));
      ambient.intensity=THREE.MathUtils.lerp(2.5,.55,nightMix);sun.intensity=THREE.MathUtils.lerp(4,.35,nightMix);rim.intensity=THREE.MathUtils.lerp(1.4,2,nightMix);
      materials.window.emissiveIntensity=nightMix*2.3;materials.red.emissiveIntensity=nightMix*.5;
      renderer.toneMappingExposure=THREE.MathUtils.lerp(1.3,1.05,nightMix);
      renderer.render(scene,camera);
      if(landmarkRef.current) {
        labelPoint.set(tx,6.7,tz).applyMatrix4(city.matrixWorld).project(camera);
        landmarkRef.current.style.left=`${(labelPoint.x*.5+.5)*width}px`;
        landmarkRef.current.style.top=`${(-labelPoint.y*.5+.5)*height}px`;
      }
    };
    frame=requestAnimationFrame(animate);onReady('ready');
    return () => {
      cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',visibility);
      renderer.domElement.removeEventListener('webglcontextlost',contextLost);
      scene.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();});
      Object.values(materials).forEach(m=>m.dispose());shadow.material.dispose();renderer.dispose();renderer.domElement.remove();
    };
  }, [onReady,landmarkRef]);
  return <div ref={host} className="city-canvas" role="img" aria-label="Animated three-dimensional Tokyo diorama featuring Tokyo Tower, a shrine, cherry trees, a canal, and a moving commuter train" />;
}
