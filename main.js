import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

console.log('Starting App');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd8d8d8);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = 0;

// Rack dimensions
const rackWidth = 6, rackDepth = 8, rackHeight = 42;
controls.target.set(0, rackHeight / 2, 0);
camera.position.set(2, rackHeight / 2, 40);
controls.update();
const postGeom = new THREE.BoxGeometry(0.2, rackHeight, 0.2);
const postMat = new THREE.MeshBasicMaterial({color:0x333333});
const posts=[
    new THREE.Mesh(postGeom, postMat),
    new THREE.Mesh(postGeom, postMat),
    new THREE.Mesh(postGeom, postMat),
    new THREE.Mesh(postGeom, postMat)
];
posts[0].position.set(-rackWidth/2,rackHeight/2,rackDepth/2);
posts[1].position.set(rackWidth/2,rackHeight/2,rackDepth/2);
posts[2].position.set(-rackWidth/2,rackHeight/2,-rackDepth/2);
posts[3].position.set(rackWidth/2,rackHeight/2,-rackDepth/2);
posts.forEach(p=>scene.add(p));

for(let i=1;i<=rackHeight;i++){
    const div=document.createElement('div');

    div.textContent=i;
    div.style.background='rgba(0,0,0,0.4)';
    div.style.color='#fff';
    div.style.padding='2px 4px';
    const lbl=new CSS2DObject(div);
    lbl.position.set(-rackWidth/2-0.5,i-0.5,rackDepth/2);

    scene.add(lbl);
}

const floorGeom = new THREE.PlaneGeometry(50,50);
const floorMat = new THREE.MeshBasicMaterial({color:0xcccccc});
const floor = new THREE.Mesh(floorGeom, floorMat);
floor.rotation.x = -Math.PI/2;
scene.add(floor);
const grid = new THREE.GridHelper(50, 50, 0x999999, 0xcccccc);
grid.position.y = 0.01;
scene.add(grid);

const devices = new Array(42).fill(null); // track occupancy by unit
const deviceMeshes = [];
const dropAnimations = [];
let ghostMesh = null;
let ghostStart = 1;
let dragging = null;
let selected = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function colorFor(type){
    return {server:0xaaaaaa, router:0x5555ff, patch:0x55aa55, blank:0x000000}[type] || 0xffffff;
}

function addDevice(type,label,start,height,animate){
    start = parseInt(start); height = parseInt(height);
    if(start<1 || start+height-1>rackHeight) return;
    for(let i=start-1;i<start-1+height;i++) if(devices[i]) return;
    const geom = new THREE.BoxGeometry(rackWidth-0.4, height, rackDepth-0.4);
    const mat = new THREE.MeshLambertMaterial({color:colorFor(type)});
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(0,start-0.5+height/2,-0.1);
    scene.add(mesh);
    const div = document.createElement('div');
    div.textContent = label || type;
    div.style.background='rgba(255,255,255,0.7)';
    div.style.padding='2px 4px';
    const labelObj = new CSS2DObject(div);
    labelObj.position.set(0,start-0.5+height/2,rackDepth/2);
    scene.add(labelObj);
    mesh.userData.labelObj = labelObj;
    mesh.userData.start = start;
    mesh.userData.height = height;
    mesh.userData.type = type;
    deviceMeshes.push(mesh);
    for(let i=start-1;i<start-1+height;i++) devices[i]=mesh;
    if(animate){
        const startY = mesh.position.y + 5;
        dropAnimations.push({mesh,labelObj,startY,targetY:mesh.position.y,start:performance.now()});
        mesh.position.y = startY;
        labelObj.position.y = startY;
    }
}


const light=new THREE.DirectionalLight(0xffffff,1);
light.position.set(10,20,10);
scene.add(light);
const amb=new THREE.AmbientLight(0x404040);
scene.add(amb);

document.querySelectorAll('.palette-item').forEach(el=>{
    el.addEventListener('dragstart',e=>{
        dragging={type:el.dataset.type,height:1,label:el.textContent};
    });
});


renderer.domElement.addEventListener('dragover',e=>{
    e.preventDefault();
    if(!dragging) return;
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.x=(e.clientX-rect.left)/rect.width*2-1;
    pointer.y=-(e.clientY-rect.top)/rect.height*2+1;
    raycaster.setFromCamera(pointer,camera);
    const plane=new THREE.Plane(new THREE.Vector3(0,0,1),-rackDepth/2);
    const pos=new THREE.Vector3();
    raycaster.ray.intersectPlane(plane,pos);
    ghostStart=Math.min(rackHeight,Math.max(1,Math.round(pos.y+0.5)));
    if(ghostMesh) scene.remove(ghostMesh);
    const g=new THREE.BoxGeometry(rackWidth-0.2, dragging.height, rackDepth-0.2);
    const m=new THREE.MeshBasicMaterial({color:0xffffff,opacity:0.5,transparent:true});
    ghostMesh=new THREE.Mesh(g,m);
    ghostMesh.position.set(0,ghostStart-0.5+dragging.height/2,-0.1);
    scene.add(ghostMesh);
});

renderer.domElement.addEventListener('drop',e=>{
    e.preventDefault();
    if(!dragging) return;
    addDevice(dragging.type,dragging.label,ghostStart,dragging.height,true);
    dragging=null;
    if(ghostMesh){scene.remove(ghostMesh);ghostMesh=null;}

});

renderer.domElement.addEventListener('pointerdown',e=>{
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.x=(e.clientX-rect.left)/rect.width*2-1;
    pointer.y=-(e.clientY-rect.top)/rect.height*2+1;
    raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects(deviceMeshes);
    if(hits.length){
        selected=hits[0].object;
        document.getElementById('prop-name').value=selected.userData.labelObj.element.textContent;
        document.getElementById('props').style.display='block';
    } else {
        document.getElementById('props').style.display='none';
    }
});

document.getElementById('prop-save').onclick=()=>{
    if(selected){
        const name=document.getElementById('prop-name').value;
        selected.userData.labelObj.element.textContent=name;
    }
    document.getElementById('props').style.display='none';
};

window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
    labelRenderer.setSize(window.innerWidth,window.innerHeight);
});

function animate(){
    requestAnimationFrame(animate);
    const now=performance.now();
    for(let i=dropAnimations.length-1;i>=0;i--){
        const a=dropAnimations[i];
        const t=Math.min(1,(now-a.start)/500);
        const y=a.startY-(a.startY-a.targetY)*t;
        a.mesh.position.y=y;
        a.labelObj.position.y=y;
        if(t>=1) dropAnimations.splice(i,1);
    }
    renderer.render(scene,camera);
    labelRenderer.render(scene,camera);
}
animate();
