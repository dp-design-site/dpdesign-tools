// Конфигурационен скрипт – Етап 3: динамично зареждане на таб съдържание + автоматично презареждане на конфигурацията

(function injectSpinnerStyle() {
  const styleId = 'spinner-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .spinner {
        border: 4px solid #444;
        border-top: 4px solid #00aaff;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAutoReload();
  generateConfig();
});

function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-labels button');
  const content = document.getElementById('tab-content');

  const tabData = [
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
    `
      <label>Вид ламарина дъно</label><input type="text" class="readonly" value="Гладка S235" readonly>
      <label>Дебелина ламарина</label><input type="text" class="readonly" value="5 mm" readonly>
      <label>C-заключване</label><input type="text" class="readonly" value="Да" readonly>
      <label>Вид ролки</label><input type="text" class="readonly" value="Стоманени" readonly>
    `,
    `
      <label>Скосена челна стена</label><input type="text" class="readonly" value="Не" readonly>
      <label>Височина</label><input type="text" class="readonly" value="1500 mm" readonly>
      <label>Дебелина ламарина CS</label><input type="text" class="readonly" value="3 mm" readonly>
      <label>Укрепване към дъното</label><input type="text" class="readonly" value="Да" readonly>
    `,
    `
      <label>Халки 7000 кг</label><input type="text" class="readonly" value="Да" readonly>
      <label>Отстояние първа халка</label><input type="text" class="readonly" value="500 mm" readonly>
      <label>Брой халки на страна</label><input type="text" class="readonly" value="10" readonly>
    `
  ];

  tabButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      content.innerHTML = tabData[i];
      if (i === 0) initAutoReload();
    });
  });

  tabButtons[0].click();
}

function initAutoReload() {
  const lengthEl = document.getElementById('length');
  const colorEl = document.getElementById('color');
  if (!lengthEl || !colorEl) return;

  [lengthEl, colorEl].forEach(input => {
    input.addEventListener('change', () => {
      generateConfig();
    });
  });
}

function generateConfig() {
  const length = document.getElementById('length')?.value || '7000';
  const color = document.getElementById('color')?.value || 'RAL3000_Flame_red';
  const configID = `${length}_${color}`;
  const basePath = `img/${configID}`;

  const viewerContainer = document.querySelector('.preview-panel');
  viewerContainer.innerHTML = `
    <div class="spinner"></div>
    <p style="color: #ccc; text-align: center;">Зареждане на визуализация…</p>
  `;

  setTimeout(() => {
    const html = `
      <model-viewer id="interactiveModel" src="${basePath}/model.glb" alt="3D модел" camera-controls auto-rotate ar></model-viewer>
      <div class="thumbnail-row">
        <img src="${basePath}/view1.png" class="lightbox-trigger" data-type="image" data-src="${basePath}/view1.png">
        <img src="${basePath}/view2.png" class="lightbox-trigger" data-type="image" data-src="${basePath}/view2.png">
        <img src="${basePath}/preview_drawing.png" class="lightbox-trigger" data-type="pdf" data-src="${basePath}/drawing.pdf">
      </div>
    `;
    viewerContainer.innerHTML = html;
    enableLightbox();
  }, 2000);
}

function enableLightbox() {
  const existing = document.getElementById('lightbox-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'lightbox-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.9);display:none;z-index:10000;align-items:center;justify-content:center;flex-direction:column';

  const container = document.createElement('div');
  container.style.cssText = 'max-width:90vw;max-height:80vh;border-radius:8px;overflow:hidden;background:#000';
  modal.appendChild(container);

  const nav = document.createElement('div');
  nav.style.cssText = 'margin-top:10px;display:flex;gap:10px;justify-content:center';

  const prev = document.createElement('button');
  const next = document.createElement('button');
  prev.textContent = '<';
  next.textContent = '>';
  [prev, next].forEach(btn => btn.style.cssText = 'padding:6px 12px;cursor:pointer;font-size:18px;');
  nav.append(prev, next);
  modal.appendChild(nav);

  const images = [];
  const types = [];
  let index = 0;

  const show = (i) => {
    if (i < 0 || i >= images.length) return;
    index = i;
    container.innerHTML = '';
    const src = images[i];
    const type = types[i];
    if (type === 'pdf') {
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.style.cssText = 'width:90vw;height:80vh;border:none;background:transparent;';
      container.appendChild(iframe);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.style.cssText = 'max-width:90vw;max-height:80vh;border-radius:8px;background:transparent;';
      container.appendChild(img);
    }
    modal.style.display = 'flex';
  };

  document.body.appendChild(modal);
  prev.onclick = () => show((index - 1 + images.length) % images.length);
  next.onclick = () => show((index + 1) % images.length);

  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.style.display = 'none';
    if (e.key === 'ArrowRight') next.click();
    if (e.key === 'ArrowLeft') prev.click();
  });

  document.querySelectorAll('.lightbox-trigger').forEach((el, i) => {
    const src = el.getAttribute('data-src');
    const type = el.getAttribute('data-type');
    images.push(src);
    types.push(type);
    el.addEventListener('click', () => show(i));
  });
}

function showOrderModal() {
  document.getElementById("orderModal").style.display = "block";
}

function closeModal() {
  document.getElementById("orderModal").style.display = "none";
}

window.onclick = function (event) {
  const modal = document.getElementById("orderModal");
  if (event.target === modal) {
    closeModal();
  }
};
