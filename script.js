
// MOBILE NAVIGATION

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");

    const isOpen = navLinks.classList.contains("active");

    menuToggle.setAttribute("aria-expanded", isOpen);
});

// CLOSE MENU AFTER CLICKING A LINK

document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

// AUTOMATIC YEAR

document.getElementById("year").textContent =
    new Date().getFullYear();


// SUBTLE 3D TILT + SPOTLIGHT — supports dynamically loaded portfolio cards
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const selector = ".project-card, .skill-card, .portrait-frame";

  function onMove(event) {
    if (reduceMotion.matches || !finePointer.matches) return;
    const card = event.target.closest(selector);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    card.style.setProperty("--spot-x", (x * 100) + "%");
    card.style.setProperty("--spot-y", (y * 100) + "%");
    const maxTilt = card.classList.contains("portrait-frame") ? 6 : 8;
    const tiltX = (0.5 - y) * maxTilt;
    const tiltY = (x - 0.5) * maxTilt;
    card.style.transform = "perspective(900px) rotateX(" + tiltX + "deg) rotateY(" + tiltY + "deg) translateY(-3px)";
  }

  function onLeave(event) {
    const card = event.target.closest(selector);
    if (!card) return;
    card.style.transform = "";
    card.style.removeProperty("--spot-x");
    card.style.removeProperty("--spot-y");
  }

  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerout", (event) => {
    const card = event.target.closest(selector);
    if (card && !card.contains(event.relatedTarget)) onLeave(event);
  });

  function reveal(root) {
    const items = root.querySelectorAll(".about-card, .project-card, .skill-card");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(item => observer.observe(item));
  }

  // Watch cards added later by portfolio-data.json fetch.
  reveal(document);
  const projects = document.querySelector(".projects-grid");
  const skills = document.querySelector(".skills-grid");
  if ("MutationObserver" in window) {
    const observer = new MutationObserver(() => {
      if (projects) reveal(projects);
      if (skills) reveal(skills);
    });
    [projects, skills].filter(Boolean).forEach(node => observer.observe(node, { childList: true }));
  }
})();


// GLOBAL NEON CURSOR GLOW — desktop pointer only
(function () {
  const glow = document.querySelector(".cursor-glow");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!glow || !finePointer.matches || reduceMotion.matches) return;

  let frame = 0;
  let x = -200;
  let y = -200;
  document.addEventListener("pointermove", function (event) {
    if (event.pointerType !== "mouse") return;
    x = event.clientX;
    y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(function () {
      glow.style.transform = "translate3d(" + x + "px, " + y + "px, 0) translate(-50%, -50%)";
      glow.classList.add("is-active");
      frame = 0;
    });
  }, { passive: true });
  document.addEventListener("pointerleave", function () { glow.classList.remove("is-active"); });
  document.addEventListener("pointerenter", function () { glow.classList.add("is-active"); });
})();


// PROFILE PARALLAX — gentle pointer response, no image manipulation
(function(){
  const frame=document.querySelector(".portrait-frame");
  if(!frame || !window.matchMedia("(hover:hover) and (pointer:fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let raf=0;
  frame.addEventListener("pointermove",function(e){
    const r=frame.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width-.5;
    const py=(e.clientY-r.top)/r.height-.5;
    if(raf) cancelAnimationFrame(raf);
    raf=requestAnimationFrame(function(){
      frame.style.transform="perspective(1000px) rotateX("+(-py*7)+"deg) rotateY("+(px*9)+"deg)";
    });
  });
  frame.addEventListener("pointerleave",function(){frame.style.transform="";});
})();


// PORTFOLIO EXTRAS: scroll progress, local clock, and safe simulated terminal
(function(){
 const bar=document.getElementById("scrollProgress");
 function updateProgress(){if(!bar)return;const max=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=(max>0?(window.scrollY/max)*100:0)+"%";}
 window.addEventListener("scroll",updateProgress,{passive:true});window.addEventListener("resize",updateProgress);updateProgress();
 const toTop=document.getElementById("backToTop");
 function updateToTop(){if(!toTop)return;toTop.hidden=window.scrollY<=600;}
 window.addEventListener("scroll",updateToTop,{passive:true});updateToTop();
 if(toTop)toTop.addEventListener("click",function(){window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});});
 const clock=document.getElementById("liveClock");
 function tick(){if(clock)clock.textContent=new Date().toLocaleTimeString("id-ID",{hour12:false});}
 tick();setInterval(tick,1000);
 const form=document.getElementById("terminalForm"),input=document.getElementById("terminalInput"),output=document.getElementById("terminalOutput");
 if(!form||!input||!output)return;
 const isEN = () => document.documentElement.lang === "en";
 const commands={help:()=>isEN()?"Commands: help, about, projects, skills, socials, theme, lang, clear, date":"Perintah: help, about, projects, skills, socials, theme, lang, clear, date",about:()=>isEN()?"Leonard — developer, programmer, and cybersecurity enthusiast. Always learning and building.":"Leonard — developer, programmer, dan penggemar cybersecurity. Selalu belajar dan membangun.",projects:()=>isEN()?"Featured work: SENTINEL X and other development experiments. Visit the Projects section above.":"Karya unggulan: SENTINEL X dan eksperimen pengembangan lainnya. Lihat bagian Projects di atas.",skills:()=>isEN()?"Current stack: Python, HTML, CSS, JavaScript, Linux, Git, and GitHub.":"Stack saat ini: Python, HTML, CSS, JavaScript, Linux, Git, dan GitHub.",socials:()=>"Instagram: instagram.com/eonll.ard | GitHub: github.com/muchammadleonardtaufikputra-bot",theme:()=>{const b=document.getElementById("themeToggle");if(b)b.click();return isEN()?"Theme switched.":"Tema diubah.";},lang:()=>{const b=document.getElementById("langToggle");if(b)b.click();return isEN()?"Language switched to Indonesian.":"Bahasa diubah ke English.";},date:()=>new Date().toString()};
 form.addEventListener("submit",function(e){e.preventDefault();const cmd=input.value.trim().toLowerCase();if(!cmd)return;const line=document.createElement("p");line.className="terminal-command";line.textContent="visitor@leonard:~$ "+cmd;output.appendChild(line);if(cmd==="clear"){output.innerHTML="";}else{const response=document.createElement("p");response.className="terminal-response";const result=commands[cmd];response.textContent=typeof result==="function"?result():(result||(isEN()?"Command not found. Type help to see available commands.":"Perintah tidak ditemukan. Ketik help untuk melihat perintah yang tersedia."));output.appendChild(response);}input.value="";output.scrollTop=output.scrollHeight;});
})();


// SECTION NAVIGATION: cinematic 3D + glitch transitions
(function(){
 const sections=Array.from(document.querySelectorAll("main > section[id]"));
 const links=Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
 if(!sections.length)return;
 const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
 sections.forEach(section=>section.classList.add("nav-reveal"));
 const home=document.querySelector("main > section#home");
 if(home)requestAnimationFrame(()=>home.classList.add("section-entered"));
 if("IntersectionObserver" in window&&!reduceMotion.matches){
   const revealObserver=new IntersectionObserver(entries=>{
     entries.forEach(entry=>{
       if(entry.isIntersecting){
         entry.target.classList.add("section-entered");
         revealObserver.unobserve(entry.target);
       }
     });
   },{threshold:0.1,rootMargin:"0px 0px -7% 0px"});
   sections.filter(section=>section!==home).forEach(section=>revealObserver.observe(section));
 }else{
   sections.forEach(section=>section.classList.add("section-entered"));
 }
 const activeObserver=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
     if(!entry.isIntersecting)return;
     links.forEach(link=>{
       const active=link.getAttribute("href")==="#"+entry.target.id;
       link.classList.toggle("active",active);
       if(active)link.setAttribute("aria-current","location");
       else link.removeAttribute("aria-current");
     });
   });
 },{rootMargin:"-32% 0px -52% 0px",threshold:0});
 sections.forEach(section=>activeObserver.observe(section));
 let transitionTimer;
 function playTransition(target){
   if(reduceMotion.matches)return;
   document.body.classList.remove("page-glitch");
   target.classList.remove("section-jump");
   // Restart the CSS animations for repeated visits to the same section.
   void document.body.offsetWidth;
   document.body.classList.add("page-glitch");
   target.classList.add("section-jump");
   clearTimeout(transitionTimer);
   transitionTimer=setTimeout(()=>{
     document.body.classList.remove("page-glitch");
     target.classList.remove("section-jump");
   },900);
 }
 links.forEach(link=>link.addEventListener("click",event=>{
   const id=link.getAttribute("href").slice(1);
   const target=document.getElementById(id);
   if(!target)return;
   event.preventDefault();
   playTransition(target);
   target.classList.add("section-entered");
   target.scrollIntoView({behavior:reduceMotion.matches?"auto":"smooth",block:"start"});
   if(history.replaceState)history.replaceState(null,"","#"+id);
   const menu=document.getElementById("navLinks"),toggle=document.getElementById("menuToggle");
   if(menu&&toggle){menu.classList.remove("active");toggle.setAttribute("aria-expanded","false");}
 }));
})();


// LIVE GLITCH BACKGROUND — animated canvas behind the content:
// faint grid, falling glyph rain, drifting particles, a travelling scan
// band, and short RGB-split glitch bursts. Pauses when the tab is hidden
// and renders a single static frame when reduced motion is preferred.
(function(){
  const canvas=document.getElementById("glitchBg");
  if(!canvas) return;
  const ctx=canvas.getContext("2d");
  if(!ctx) return;
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
  const GLYPHS="01<>[]{}#$%&*+=;:/\\|ﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓｱｲｳｴｵ";
  let w=0,h=0,cols=[],drops=[],parts=[],raf=0,last=0;
  let nextBurst=performance.now()+2200,burstUntil=0,scanY=-140;
  function isLight(){return document.documentElement.getAttribute("data-theme")==="light";}
  function resize(){
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    w=window.innerWidth;h=window.innerHeight;
    canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);
    canvas.style.width=w+"px";canvas.style.height=h+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.max(8,Math.floor(w/22));
    cols=[];drops=[];
    for(let i=0;i<n;i++){cols.push(i*22+Math.random()*10);drops.push(Math.random()*h);}
    parts=[];
    const count=Math.min(46,Math.floor(w*h/45000));
    for(let i=0;i<count;i++)parts.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.8+.6,s:Math.random()*.32+.08,o:Math.random()*.5+.15});
  }
  function drawGrid(light){
    ctx.strokeStyle=light?"rgba(124,58,237,.07)":"rgba(168,85,247,.06)";
    ctx.lineWidth=1;ctx.beginPath();
    for(let x=0.5;x<w;x+=88){ctx.moveTo(x,0);ctx.lineTo(x,h);}
    for(let y=0.5;y<h;y+=88){ctx.moveTo(0,y);ctx.lineTo(w,y);}
    ctx.stroke();
  }
  function drawRain(light,step){
    ctx.font="13px ui-monospace,Consolas,monospace";
    for(let i=0;i<cols.length;i++){
      const ch=GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
      const cyan=Math.random()<.55;
      ctx.fillStyle=cyan?(light?"rgba(8,145,178,.28)":"rgba(34,211,238,.20)"):(light?"rgba(124,58,237,.26)":"rgba(192,132,252,.17)");
      ctx.fillText(ch,cols[i],drops[i]);
      drops[i]+=step*(0.5+Math.random()*0.9);
      if(drops[i]>h+20&&Math.random()<.06)drops[i]=-20;
    }
  }
  function drawParts(light){
    for(const p of parts){
      p.y-=p.s;if(p.y<-4){p.y=h+4;p.x=Math.random()*w;}
      ctx.fillStyle=light?"rgba(124,58,237,"+(p.o*.8)+")":"rgba(168,85,247,"+p.o+")";
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
    }
  }
  function drawScan(light){
    scanY+=1.1;if(scanY>h+160)scanY=-160;
    const g=ctx.createLinearGradient(0,scanY-70,0,scanY+70);
    const c=light?"124,58,237":"34,211,238";
    g.addColorStop(0,"rgba("+c+",0)");g.addColorStop(.5,"rgba("+c+",.055)");g.addColorStop(1,"rgba("+c+",0)");
    ctx.fillStyle=g;ctx.fillRect(0,scanY-70,w,140);
  }
  function drawBurst(now,light){
    if(now>=nextBurst){burstUntil=now+140+Math.random()*120;nextBurst=now+2400+Math.random()*3800;}
    if(now>burstUntil)return;
    const slices=4+Math.floor(Math.random()*4);
    for(let i=0;i<slices;i++){
      const y=Math.random()*h,hh=5+Math.random()*22,off=(Math.random()-.5)*36;
      ctx.fillStyle=Math.random()<.5?(light?"rgba(8,145,178,.16)":"rgba(34,211,238,.13)"):(light?"rgba(192,38,211,.14)":"rgba(217,70,239,.12)");
      ctx.fillRect(off,y,w,hh);
      ctx.fillStyle=light?"rgba(23,20,43,.25)":"rgba(255,255,255,.06)";
      for(let s=0;s<6;s++)ctx.fillRect(Math.random()*w,y+Math.random()*hh,2+Math.random()*14,1.5);
    }
  }
  function frame(now){
    raf=0;
    if(now-last<33){raf=requestAnimationFrame(frame);return;}
    last=now;
    const light=isLight();
    ctx.clearRect(0,0,w,h);
    drawGrid(light);drawRain(light,1);drawParts(light);drawScan(light);drawBurst(now,light);
    raf=requestAnimationFrame(frame);
  }
  function drawStatic(){
    const light=isLight();
    ctx.clearRect(0,0,w,h);
    drawGrid(light);
    ctx.font="13px ui-monospace,Consolas,monospace";
    for(let i=0;i<cols.length;i+=2){
      ctx.fillStyle=light?"rgba(124,58,237,.20)":"rgba(192,132,252,.13)";
      ctx.fillText(GLYPHS[i%GLYPHS.length],cols[i],drops[i]);
    }
    drawParts(light);
  }
  function start(){if(reduceMotion.matches){drawStatic();return;}cancelAnimationFrame(raf);last=0;raf=requestAnimationFrame(frame);}
  function stop(){cancelAnimationFrame(raf);raf=0;}
  let resizeTimer;
  window.addEventListener("resize",function(){clearTimeout(resizeTimer);resizeTimer=setTimeout(function(){resize();if(reduceMotion.matches)drawStatic();},180);});
  document.addEventListener("visibilitychange",function(){if(document.hidden)stop();else start();});
  if(reduceMotion.addEventListener)reduceMotion.addEventListener("change",function(){if(reduceMotion.matches){stop();drawStatic();}else start();});
  resize();start();
})();
