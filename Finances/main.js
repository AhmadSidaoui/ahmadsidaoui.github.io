// ---- particles ----
const canvas=document.getElementById('particles'),ctx=canvas.getContext('2d');
let W=canvas.width=innerWidth,H=canvas.height=innerHeight;
const particles=[];
class P{constructor(){this.x=Math.random()*W;this.y=Math.random()*H;this.r=Math.random()*1.2;this.vx=(Math.random()-0.5)*0.3;this.vy=(Math.random()-0.5)*0.3;}update(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>W)this.vx*=-1;if(this.y<0||this.y>H)this.vy*=-1;}draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle='rgba(56,189,248,.4)';ctx.fill();}}
function init(){for(let i=0;i<90;i++)particles.push(new P());animate();}
function animate(){ctx.clearRect(0,0,W,H);particles.forEach(p=>{p.update();p.draw();});requestAnimationFrame(animate);}
addEventListener('resize',()=>{W=canvas.width=innerWidth;H=canvas.height=innerHeight;});
init();

// ---- scroll animations ----
gsap.registerPlugin(ScrollTrigger);
gsap.from('.timeline .item',{opacity:0,x:-60,stagger:.2,scrollTrigger:{trigger:'.timeline',start:'top 80%'}});
gsap.from('.skill-card',{opacity:0,y:40,stagger:.05,scrollTrigger:{trigger:'#skills',start:'top 80%'}});
gsap.from('.project-tile',{opacity:0,scale:.8,stagger:.1,scrollTrigger:{trigger:'.project-grid',start:'top 80%'}});

// ---- footer year ----
document.getElementById('year').textContent=new Date().getFullYear();



// auto-load demo report (optional) on first visit
window.addEventListener('DOMContentLoaded', () => {
  const demo = "https://app.powerbi.com/view?r=eyJrIjoiZGU2NmM3ZTYtOGRhYy00OGE4LWE4NjgtNmUxYjYyYzYxMTliIiwidCI6IjczOTczYTQtODcwZi00YjJlLWI0NWQtNmU3ZWVlYzU0MjQ2IiwidCI6IjRhMDAwYzUwLWI5ZjQtNGM4Yi1iY2YxLTFiODkyY2E3MGIyNyJ9";
  const frame = document.getElementById('pbiFrame');
  const input = document.getElementById('pbiUrl');
  input.value = demo;       // pre-fill demo link
  frame.src = demo;         // show it immediately
});

function loadReport() {
  const url = document.getElementById('pbiUrl').value.trim();
  if (!url) { alert("Please paste a Power BI link."); return; }
  document.getElementById('pbiFrame').src = url;
};


