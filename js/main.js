/* Murfin Brothers — nav, smooth scroll, bubbles, form handling */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();

  // Mobile nav
  var toggle=document.querySelector('.nav__toggle'), menu=document.getElementById('menu');
  function setMenu(open){ menu.classList.toggle('open',open); toggle.setAttribute('aria-expanded',open); toggle.setAttribute('aria-label',open?'Close menu':'Open menu'); }
  toggle.addEventListener('click',function(){ setMenu(!menu.classList.contains('open')); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') setMenu(false); });

  // Smooth scroll for in-page links (CSS handles most; JS closes menu + updates focus)
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href'); var t=id.length>1&&document.querySelector(id); if(!t) return;
      e.preventDefault(); setMenu(false);
      t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
      history.replaceState(null,'',id);
    });
  });

  // Active section highlight + reveal
  var links=[].slice.call(menu.querySelectorAll('a[href^="#"]'));
  if('IntersectionObserver' in window){
    var so=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ links.forEach(function(l){ l.classList.toggle('active',l.getAttribute('href')==='#'+en.target.id); }); } }); },{rootMargin:'-45% 0px -50% 0px'});
    document.querySelectorAll('main section[id]').forEach(function(s){ so.observe(s); });
    if(!reduce){
      var ro=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); ro.unobserve(en.target);} }); },{threshold:.12});
      document.querySelectorAll('.card,.tier,details,.photo,.form,.split>div:first-child').forEach(function(el){ el.classList.add('reveal'); ro.observe(el); });
    }
  }

  // Bubbles (lightweight canvas, paused when tab hidden, disabled for reduced motion)
  var c=document.getElementById('bubbles');
  if(c && !reduce){
    var ctx=c.getContext('2d'), W, H, dpr=Math.min(window.devicePixelRatio||1,2), bs=[];
    function size(){ W=c.clientWidth; H=c.clientHeight; c.width=W*dpr; c.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
    function mk(init){ var r=Math.random()*4+1.2; return {x:Math.random()*W, y:init?Math.random()*H:H+r*4, r:r, s:Math.random()*.6+.25+r*.08, w:Math.random()*Math.PI*2, a:Math.random()*.35+.2}; }
    size(); var n=Math.round(Math.min(70,W/18)); for(var i=0;i<n;i++) bs.push(mk(true));
    window.addEventListener('resize',size);
    var run=true; document.addEventListener('visibilitychange',function(){ run=!document.hidden; if(run) requestAnimationFrame(tick); });
    function tick(){
      if(!run) return;
      ctx.clearRect(0,0,W,H);
      bs.forEach(function(b,i){
        b.y-=b.s; b.w+=.02; var x=b.x+Math.sin(b.w)*6;
        if(b.y<-10) bs[i]=mk(false);
        var g=ctx.createRadialGradient(x-b.r*.35,b.y-b.r*.35,b.r*.1,x,b.y,b.r);
        g.addColorStop(0,'rgba(255,255,255,'+b.a+')'); g.addColorStop(.6,'rgba(160,240,255,'+b.a*.25+')'); g.addColorStop(1,'rgba(160,240,255,'+b.a*.8+')');
        ctx.beginPath(); ctx.arc(x,b.y,b.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Contact form: validate, POST via fetch to the form's action (e.g. Formspree).
  // If the action still has the placeholder, fall back to a pre-filled email (mailto).
  var f=document.getElementById('contact-form');
  if(f){
    var status=f.querySelector('.form__status');
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=true;
      f.querySelectorAll('[required]').forEach(function(el){ var v=el.checkValidity(); el.classList.toggle('err',!v); if(!v&&ok){ el.focus(); ok=false; } });
      if(!ok){ status.textContent='Please fill in all required fields (a valid phone number is needed).'; return; }
      if(f.querySelector('[name=_gotcha]').value) return;
      var d=new FormData(f);
      if(f.action.indexOf('YOUR_FORM_ID')>-1){
        var body='Name: '+d.get('name')+'\nPhone: '+d.get('phone')+'\nBest time to call: '+d.get('best_time_to_call')+'\n\n'+d.get('comments');
        window.location.href='mailto:'+f.dataset.mailto+'?subject='+encodeURIComponent('Website enquiry – '+d.get('name'))+'&body='+encodeURIComponent(body);
        status.textContent='Opening your email app…';
        return;
      }
      status.textContent='Sending…';
      fetch(f.action,{method:'POST',body:d,headers:{'Accept':'application/json'}})
        .then(function(r){ if(!r.ok) throw 0; f.reset(); status.textContent='Thanks for submitting! We\u2019ll be in touch soon.'; })
        .catch(function(){ status.textContent='Sorry, something went wrong. Please call 905-659-7577.'; });
    });
  }
})();
