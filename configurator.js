// Конфигурационен скрипт – Етап 4: фиксирани панели без подскачане + центриран overlay със staged съобщения

(function injectRuntimeStyles(){
  const id='runtime-styles';
  if(document.getElementById(id)) return;
  const s=document.createElement('style'); s.id=id;
  s.textContent=`
    .spinner{border:4px solid #444;border-top:4px solid #00aaff;border-radius:50%;width:44px;height:44px;animation:spin 1s linear infinite;margin:12px auto}
    @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
    .fade-out{opacity:.35;filter:grayscale(.15);transition:opacity .35s ease,filter .35s ease}
    .fade-in{opacity:1;filter:none;transition:opacity .35s ease,filter .35s ease}
    .viewer-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;background:rgba(0,0,0,.35);backdrop-filter:blur(1px);z-index:5}
    .viewer-overlay .stage{color:#ccc;margin-top:8px;font-size:14px}
  `; document.head.appendChild(s);
})();

document.addEventListener('DOMContentLoaded',()=>{
  normalizePreviewDOM();
  initTabs();
  initAutoReload();
  generateConfig(true);
});

// Подготвяме десния панел да има стабилна структура и ID-та без да пипаме HTML файла
function normalizePreviewDOM(){
  const preview=document.querySelector('.preview-panel');
  if(!preview) return;
  // Уверяваме се, че панелът е позициониран адекватно
  preview.style.position='relative';

  // Обгръщаме model-viewer в фиксиран контейнер (без промяна на височини от HTML)
  let mv=document.getElementById('interactiveModel');
  if(!mv) return;
  if(!mv.parentElement.classList.contains('viewer-wrap')){
    const wrap=document.createElement('div');
    wrap.className='viewer-wrap';
    wrap.id='viewerWrap';
    wrap.style.position='relative';
    wrap.style.minHeight=getComputedStyle(mv).height||'500px';
    mv.parentElement.insertBefore(wrap,mv);
    wrap.appendChild(mv);
  } else {
    const wrap=mv.parentElement; wrap.id='viewerWrap';
  }

  // Добавяме overlay контейнер ако липсва
  const wrap=document.getElementById('viewerWrap');
  if(wrap && !document.getElementById('viewerOverlay')){
    const overlay=document.createElement('div');
    overlay.className='viewer-overlay'; overlay.id='viewerOverlay'; overlay.style.display='none';
    overlay.innerHTML=`<div class="spinner"></div><div class="stage" id="viewerStage">Подготовка…</div>`;
    wrap.appendChild(overlay);
  }

  // Идентификатор за реда с тъмбнейли
  let thumbs=document.querySelector('.thumbnail-row');
  if(thumbs && !thumbs.id) thumbs.id='thumbRow';
}

function initTabs(){
  const tabButtons=document.querySelectorAll('.tab-labels button');
  const content=document.getElementById('tab-content');
  if(!content || !tabButtons.length) return;

  const tabData=[
    // Основни параметри
    `
      <label for="length">Дължина (A)</label>
      <select id="length">
        <option value="5500">5500 mm</option>
        <option value="6000">6000 mm</option>
        <option value="7000" selected>7000 mm</option>
      </select>
      <label for="color">Цвят (RAL)</label>
      <select id="color">
        <option value="RAL1026_Luminous_yellow">RAL1026 Жълт</option>
        <option value="RAL3000_Flame_red" selected>RAL3000 Червен</option>
        <option value="RAL5012_Light_blue">RAL5012 Син</option>
      </select>
    `,
    // Дъно
    `
      <label>Вид ламарина дъно</label><input type="text" class="readonly" value="Гладка S235" readonly>
      <label>Дебелина ламарина</label><input type="text" class="readonly" value="5 mm" readonly>
      <label>C-заключване</label><input type="text" class="readonly" value="Да" readonly>
      <label>Вид ролки</label><input type="text" class="readonly" value="Стоманени" readonly>
    `,
    // Челна стена
    `
      <label>Скосена челна стена</label><input type="text" class="readonly" value="Не" readonly>
      <label>Височина</label><input type="text" class="readonly" value="1500 mm" readonly>
      <label>Дебелина ламарина CS</label><input type="text" class="readonly" value="3 mm" readonly>
      <label>Укрепване към дъното</label><input type="text" class="readonly" value="Да" readonly>
    `,
    // Вид укрепване
    `
      <label>Вид укрепване (халки 7000 кг)</label><input type="text" class="readonly" value="Да" readonly>
      <label>Отстояние първа халка</label><input type="text" class="readonly" value="500 mm" readonly>
      <label>Брой халки на страна</label><input type="text" class="readonly" value="10" readonly>
    `
  ];

  tabButtons.forEach((btn,i)=>{
    btn.addEventListener('click',()=>{
      tabButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      content.innerHTML=tabData[i];
      if(i===0) initAutoReload();
    });
  });
  // По подразбиране: Основни параметри
  tabButtons[0].click();
}

function initAutoReload(){
  const lengthEl=document.getElementById('length');
  const colorEl=document.getElementById('color');
  if(!lengthEl||!colorEl) return;
  const handler=debounce(()=>generateConfig(),180);
  [lengthEl,colorEl].forEach(el=>el.addEventListener('change',handler));
}

function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(null,a),ms); } }

function stageOverlay(text,delay){
  const stage=document.getElementById('viewerStage');
  return new Promise(res=>setTimeout(()=>{ if(stage) stage.textContent=text; res(); }, delay));
}

function toggleOverlay(show){
  const overlay=document.getElementById('viewerOverlay');
  if(!overlay) return;
  overlay.style.display=show?'flex':'none';
}

function generateConfig(initial){
  const length=document.getElementById('length')?.value||'7000';
  const color=document.getElementById('color')?.value||'RAL3000_Flame_red';
  const configID=`${length}_${color}`;
  const basePath=`img/${configID}`;

  // Елементи
  const mv=document.getElementById('interactiveModel');
  const wrap=document.getElementById('viewerWrap') || mv?.parentElement;
  const thumbRow=document.getElementById('thumbRow') || document.querySelector('.thumbnail-row');
  if(!mv||!wrap||!thumbRow) return;

  // Fade & overlay
  mv.classList.add('fade-out');
  toggleOverlay(true);
  const stage=document.getElementById('viewerStage'); if(stage) stage.textContent='Въвеждане на входните параметри…';

  Promise.resolve()
    .then(()=>stageOverlay('Изчисляване на чертежа…',1200))
    .then(()=>stageOverlay('Зареждане…',1200))
    .then(()=>{
      // Подмяна на източници
      mv.setAttribute('src',`${basePath}/model.glb`);
      thumbRow.innerHTML=`
        <img src="${basePath}/view1.png" class="lightbox-trigger" data-type="image" data-src="${basePath}/view1.png">
        <img src="${basePath}/view2.png" class="lightbox-trigger" data-type="image" data-src="${basePath}/view2.png">
        <img src="${basePath}/preview_drawing.png" class="lightbox-trigger" data-type="pdf" data-src="${basePath}/drawing.pdf">
      `;
      enableLightbox();
      return stageOverlay('Финализиране…',800);
    })
    .then(()=>{
      toggleOverlay(false);
      mv.classList.remove('fade-out');
      mv.classList.add('fade-in');
    });
}

function enableLightbox(){
  const existing=document.getElementById('lightbox-modal');
  if(existing) existing.remove();
  const modal=document.createElement('div');
  modal.id='lightbox-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.9);display:none;z-index:10000;align-items:center;justify-content:center;flex-direction:column';

  const container=document.createElement('div');
  container.style.cssText='max-width:90vw;max-height:80vh;border-radius:8px;overflow:hidden;background:#000';
  modal.appendChild(container);

  const nav=document.createElement('div');
  nav.style.cssText='margin-top:10px;display:flex;gap:10px;justify-content:center';
  const prev=document.createElement('button'); prev.textContent='<';
  const next=document.createElement('button'); next.textContent='>';
  [prev,next].forEach(b=>b.style.cssText='padding:6px 12px;cursor:pointer;font-size:18px;');
  nav.append(prev,next); modal.appendChild(nav);

  const images=[], types=[]; let index=0;
  const show=(i)=>{
    if(i<0||i>=images.length) return; index=i; container.innerHTML=''; const src=images[i],t=types[i];
    if(t==='pdf'){
      const f=document.createElement('iframe'); f.src=src; f.style.cssText='width:90vw;height:80vh;border:none;background:transparent;'; container.appendChild(f);
    } else {
      const img=document.createElement('img'); img.src=src; img.style.cssText='max-width:90vw;max-height:80vh;border-radius:8px;background:transparent;'; container.appendChild(img);
    }
    modal.style.display='flex';
  };

  document.body.appendChild(modal);
  prev.onclick=()=>show((index-1+images.length)%images.length);
  next.onclick=()=>show((index+1)%images.length);
  modal.onclick=(e)=>{ if(e.target===modal) modal.style.display='none'; };
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') modal.style.display='none'; if(e.key==='ArrowRight') next.click(); if(e.key==='ArrowLeft') prev.click(); });

  document.querySelectorAll('.lightbox-trigger').forEach((el,i)=>{
    const src=el.getAttribute('data-src'); const type=el.getAttribute('data-type')||'image';
    images.push(src); types.push(type); el.addEventListener('click',()=>show(i));
  });
}

function showOrderModal(){ const m=document.getElementById('orderModal'); if(m) m.style.display='block'; }
function closeModal(){ const m=document.getElementById('orderModal'); if(m) m.style.display='none'; }
window.onclick=function(e){ const m=document.getElementById('orderModal'); if(e.target===m) closeModal(); }
