'use strict';
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const groups=['.hero>div','.strip>.wrap','.section>.eyebrow','.section>h2','.features article','.learn-grid>img','.learn-grid>div','.steps li','.install-note','.release-grid>div','.release-card','.faq>div','.bottom-cta>div'];
 const elements=[...new Set(groups.flatMap(selector=>[...document.querySelectorAll(selector)]))];let observer;
 const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
 let frame=0;const update=()=>{frame=0;const max=document.documentElement.scrollHeight-innerHeight;progress.style.setProperty('--progress',max>0?Math.min(1,Math.max(0,scrollY/max)):0);};
 const queue=()=>{if(!frame)frame=requestAnimationFrame(update);};addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);queue();
 function reveal(){observer?.disconnect();elements.forEach(el=>el.classList.remove('reveal','is-visible'));document.documentElement.classList.remove('motion-ready');
  if(preference.matches||!('IntersectionObserver' in window))return;
  try{observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}},{threshold:.08});
   elements.forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--delay',(el.matches('.features article,.steps li')?i%3*65:0)+'ms');if(el.getBoundingClientRect().top<innerHeight&&el.getBoundingClientRect().bottom>0)el.classList.add('is-visible');else observer.observe(el);});document.documentElement.classList.add('motion-ready');
  }catch{elements.forEach(el=>el.classList.add('is-visible'));}
 }
 preference.addEventListener('change',reveal);reveal();
 const visual=document.querySelector('.hero-visual'),card=visual?.querySelector('.app-frame');
 if(visual&&card){visual.addEventListener('pointermove',event=>{if(preference.matches||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;const r=visual.getBoundingClientRect();card.style.setProperty('--rx',((.5-(event.clientY-r.top)/r.height)*3).toFixed(2)+'deg');card.style.setProperty('--ry',(((event.clientX-r.left)/r.width-.5)*4).toFixed(2)+'deg');},{passive:true});visual.addEventListener('pointerleave',()=>{card.style.removeProperty('--rx');card.style.removeProperty('--ry');});}
})();
