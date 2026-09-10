import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowUp, Sun, Moon, Pause, Play, X } from 'lucide-react';
const CityScene = lazy(() => import('./CityScene.jsx'));

const chapters = [
  { id:'discover', number:'01', title:'First impressions', japanese:'ようこそ', eyebrow:'A CITY OF BEAUTIFUL CONTRASTS', lines:<>A little chaos.<br/>A lot of <em>Tokyo.</em></>, description:'Ancient soul. Electric energy. A thousand little worlds, moving as one. Meet a city that never stops becoming.', fact:'35°40′35″ N  139°45′41″ E', tag:'JAPAN / 東京' },
  { id:'skyline', number:'02', title:'Above it all', japanese:'空へ', eyebrow:'AN ICON ABOVE THE EVERYDAY', lines:<>Look up.<br/>Feel <em>small.</em></>, description:'Between a sea of rooftops, a familiar red silhouette. Tokyo Tower is a love letter to a city always reaching a little higher.', fact:'TOKYO TOWER / MINATO', tag:'THE SKYLINE' },
  { id:'neighborhoods', number:'03', title:'The quieter side', japanese:'ひと息', eyebrow:'TAKE THE LONG WAY HOME', lines:<>Find your<br/><em>quiet</em> corner.</>, description:'Beyond the big-city rhythm: a shrine tucked between buildings, a canopy of cherry blossoms, and a street worth getting lost in.', fact:'SHRINES, SIDE STREETS & SLOW MOMENTS', tag:'AT STREET LEVEL' },
  { id:'after-hours', number:'04', title:'A different light', japanese:'また明日', eyebrow:'SAME CITY. ANOTHER FEELING.', lines:<>Stay for<br/>the <em>afterglow.</em></>, description:'The day softens. Windows turn to constellations. Switch the lights, take another look, and discover a different side of Tokyo.', fact:'ONE CITY / ENDLESS PERSPECTIVES', tag:'AFTER HOURS' },
];

function useReducedMotion() {
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const change=e=>setReduced(e.matches);query.addEventListener('change',change);return()=>query.removeEventListener('change',change);},[]);
  return reduced;
}

export default function App() {
  const [night,setNight]=useState(true);
  const [active,setActive]=useState(0);
  const [progress,setProgress]=useState(0);
  const [status,setStatus]=useState('loading');
  const [paused,setPaused]=useState(false);
  const [about,setAbout]=useState(false);
  const reduced=useReducedMotion();
  const landmark=useRef(null);
  const dialog=useRef(null);
  const onReady=useCallback(value=>setStatus(value),[]);
  useEffect(()=>{
    let scheduled=false;
    const update=()=>{const chapterHeight=document.querySelector('.chapter')?.offsetHeight||window.innerHeight;const p=Math.min(window.scrollY/(chapterHeight*3),1);setProgress(p);setActive(Math.min(3,Math.max(0,Math.round(p*3))));scheduled=false;};
    const scroll=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}};
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);update();
    return()=>{window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);};
  },[]);
  useEffect(()=>{document.documentElement.dataset.theme=night?'night':'day';},[night]);
  useEffect(()=>{if(about)dialog.current?.showModal();else dialog.current?.close();},[about]);
  const goTo = index => window.scrollTo({top:document.getElementById(chapters[index].id).offsetTop,behavior:reduced?'instant':'smooth'});

  return <div className={`experience ${night?'night':''} ${status==='ready'?'scene-ready':''}`}>
    <a className="skip-link" href="#story">Skip to city story</a>
    <header className="header flex items-center justify-between">
      <a href="#discover" onClick={e=>{e.preventDefault();goTo(0);}} className="brand" aria-label="Tokyo, back to beginning"><span className="brand-symbol">t<span>ō</span></span><span>TOKYO<span className="brand-caption">A CITY IN MOTION</span></span></a>
      <nav className="top-nav flex items-center" aria-label="Main navigation">
        <button className={active===0?'selected':''} onClick={()=>goTo(0)}>The city</button>
        <button className={active>0?'selected':''} onClick={()=>goTo(1)}>The experience <ArrowUpRight size={13}/></button>
      </nav>
      <button className="about-button group flex items-center gap-3" onClick={()=>setAbout(true)}>A new perspective <span><ArrowUpRight size={16}/></span></button>
    </header>

    <div className="stage" aria-hidden="true">
      <div className="scene-sun" />
      <div className="city-word">TOKYO<span>東京</span></div>
      <div className="scene-wrap">
        <Suspense fallback={null}><CityScene night={night} reducedMotion={reduced||paused} onReady={onReady} landmarkRef={landmark}/></Suspense>
        {status==='ready' && <div ref={landmark} className={`landmark ${active===2?'hidden-label':''}`}><span className="landmark-dot"/><span className="landmark-line"/><div><span>TOKYO TOWER</span><small>MINATO, TOKYO</small></div></div>}
      </div>
      <div className="scene-caption"><span className="live-dot"/>{status==='loading'?'ASSEMBLING YOUR LITTLE TOKYO':status==='unavailable'?'THE CITY, IN WORDS':night?'TOKYO, AFTER DARK':'TOKYO, IN A DIFFERENT LIGHT'}</div>
    </div>

    {status==='unavailable' && <div role="status" className="webgl-fallback">The 3D city needs a browser with WebGL enabled. You can still explore every chapter below.</div>}

    <main id="story">
      {chapters.map((chapter,index)=><section key={chapter.id} id={chapter.id} className={`chapter ${active===index?'is-active':''}`} aria-labelledby={`${chapter.id}-title`}>
        <div className="chapter-content">
          <div className="chapter-eyebrow"><span className="red-line"/>{chapter.eyebrow}</div>
          {index===0?<h1 id={`${chapter.id}-title`} className="chapter-heading">{chapter.lines}</h1>:<h2 id={`${chapter.id}-title`} className="chapter-heading">{chapter.lines}</h2>}
          <p className="chapter-description">{chapter.description}</p>
          {index<3?<button onClick={()=>goTo(index+1)} className="primary-button flex items-center justify-between">{index===0?'Explore the city':index===1?'Take a slower turn':'See another side'}<ArrowUpRight size={19}/></button>:<button onClick={()=>setNight(v=>!v)} className="primary-button flex items-center justify-between">{night?'Bring back the sunshine':'Turn on the city lights'}{night?<Sun size={18}/>:<Moon size={18}/>}</button>}
          <div className="chapter-meta"><span>{chapter.tag}</span><span>{chapter.fact}</span></div>
        </div>
        <span className="chapter-japanese" aria-hidden="true">{chapter.japanese}</span>
      </section>)}
    </main>

    <aside className="chapter-rail" aria-label="Jump to chapter">
      <span className="rail-title">THE JOURNEY</span>
      {chapters.map((chapter,index)=><button key={chapter.id} onClick={()=>goTo(index)} className={active===index?'active':''} aria-label={`Chapter ${chapter.number}: ${chapter.title}`} aria-current={active===index?'step':undefined}><span className="rail-number">{chapter.number}</span><span className="rail-dash"/><span className="rail-tooltip">{chapter.title}</span></button>)}
    </aside>

    <div className="scene-controls flex items-center">
      <button onClick={()=>setNight(v=>!v)} className="theme-control flex items-center" aria-label={night?'Switch to day mode':'Switch to night mode'} aria-pressed={night}><Sun size={15}/><span className={`toggle ${night?'on':''}`}><span/></span><Moon size={14}/></button>
      <span className="control-divider"/>
      <button className="motion-control" onClick={()=>setPaused(v=>!v)} aria-label={paused?'Resume ambient animation':'Pause ambient animation'} aria-pressed={paused}>{paused?<Play size={14}/>:<Pause size={14}/>}</button>
    </div>

    <footer className="footer">
      <button className="scroll-prompt flex items-center" onClick={()=>goTo(active<3?active+1:0)}><span className="scroll-icon">{active<3?<ArrowDown size={16}/>:<ArrowUp size={16}/>}</span><span>{active<3?'SCROLL TO DISCOVER':'BACK TO THE BEGINNING'}</span></button>
      <div className="chapter-progress"><span className="current-chapter">{chapters[active].number}</span><span className="progress-track"><span style={{width:`${Math.max(4,progress*100)}%`}}/></span><span>04</span><span className="footer-chapter-name">{chapters[active].title}</span></div>
      <span className="footer-note">A little Tokyo. A different perspective. <span>© 2026</span></span>
    </footer>

    <dialog ref={dialog} className="about-dialog" onCancel={()=>setAbout(false)} onClick={e=>{if(e.target===dialog.current)setAbout(false);}}>
      <div className="dialog-inner"><button className="dialog-close" onClick={()=>setAbout(false)} aria-label="Close about"><X size={22}/></button><span className="chapter-eyebrow"><span className="red-line"/>A NEW PERSPECTIVE</span><h2>A big city.<br/>A little <em>wonder.</em></h2><p>A miniature love letter to Tokyo — its restless skyline, quiet corners, and the everyday moments in between.</p><p>Scroll to travel around the city. Move your pointer for a subtle change of perspective. Use the sun and moon switch to see Tokyo in a different light.</p><div className="dialog-foot"><span>AN ORIGINAL, STYLIZED CITY STUDY</span><span>東京</span></div><p className="fine-print">An artistic interpretation, rather than a geographically accurate map.</p><button className="primary-button flex items-center justify-between" onClick={()=>{setAbout(false);goTo(0);}}>Let's wander <ArrowUpRight size={18}/></button></div>
    </dialog>
  </div>;
}
