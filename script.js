
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
