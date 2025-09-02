// Конфигурационен скрипт – Етап 2: зареждане на изображения и PDF с Lightbox и скрол + 3D визуализация

// Добавяме CSS спинър в <head> през JS ако още не е наличен
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

// Задаваме фон на model-viewer при fullscreen, ако е активен
document.addEventListener('fullscreenchange', () => {
    const el = document.fullscreenElement;
    if (el && el.tagName === 'MODEL-VIEWER') {
        el.style.backgroundColor = 'rgba(30,30,47,0.85)';
    }

    const modelEl = document.getElementById('interactiveModel');
    if (!document.fullscreenElement && modelEl) {
        modelEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

function generateConfig() {
    const length = document.getElementById('length').value;
    const color = document.getElementById('color').value;
    const configID = `${length}_${color}`;

    const config = {
        length: length,
        color: color,
        configID: configID,
        timestamp: new Date().toISOString()
    };
    const basePath = `img/${configID}`;

    const previewContainer = document.getElementById('preview');
    previewContainer.innerHTML = `
        <div class="spinner"></div>
        <p id="loading-text" style="color: #ccc; text-align: center;">Въвеждане на входните параметри…</p>`;

    setTimeout(() => {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.textContent = 'Изчисляване на чертежа…';
    }, 2000);

    setTimeout(() => {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.textContent = 'Зареждане…';
    }, 4000);

    setTimeout(() => {
        const previewHTML = `
        <h3>Преглед на чертеж:</h3>
        <div class="gallery">
          <div class="drawing-preview-container">
            <img src="${basePath}/preview_drawing.png" class="drawing-preview responsive-preview lightbox-trigger" data-type="pdf" data-src="${basePath}/drawing.pdf" style="background-color: transparent;">
          </div>
          <div class="thumbnail-row">
            <img src="${basePath}/view1.png" class="thumbnail lightbox-trigger" data-type="image" data-src="${basePath}/view1.png">
            <img src="${basePath}/view2.png" class="thumbnail lightbox-trigger" data-type="image" data-src="${basePath}/view2.png">
          </div>
        </div>

        <div style="margin-top: 40px;">
          <button onclick="load3DModel('${basePath}/model.glb')">Зареди 3D визуализация</button>
          <div id="modelContainer" style="margin-top: 20px;"></div>
        </div>
        `;

        previewContainer.innerHTML = previewHTML;
        document.getElementById('output').style.display = 'none';

        enableLightbox();
    }, 6000);
}

function markAsGenerated() {
    const generateBtn = document.getElementById("generateBtn");
    const orderBtn = document.getElementById("orderBtn");
    generateBtn.classList.remove("active-generate");
    generateBtn.classList.add("generated");
    orderBtn.style.display = "inline-block";
}

function trackChanges() {
    const inputs = document.querySelectorAll("#length, #color");
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const generateBtn = document.getElementById("generateBtn");
            generateBtn.classList.add("active-generate");
            generateBtn.classList.remove("generated");
            document.getElementById('preview').innerHTML = '';
            document.getElementById("orderBtn").style.display = "none";
        });
    });
}

document.addEventListener('DOMContentLoaded', trackChanges);

function load3DModel(modelUrl) {
    const container = document.getElementById("modelContainer");
    container.innerHTML = `
        <div class="spinner"></div>
        <p id="loading-3d" style="color: #ccc; text-align: center;">Генериране на 3D модел…</p>`;

    setTimeout(() => {
        const loading3d = document.getElementById('loading-3d');
        if (loading3d) loading3d.textContent = 'Зареждане…';
    }, 1000);

    setTimeout(() => {
        const modelViewer = document.createElement('model-viewer');
        modelViewer.src = modelUrl;
        modelViewer.alt = '3D визуализация';
        modelViewer.style.width = '100%';
        modelViewer.style.height = '500px';
        modelViewer.setAttribute('camera-controls', '');
        modelViewer.setAttribute('auto-rotate', '');
        modelViewer.setAttribute('background-color', 'rgba(30,30,47,0.85)');
        modelViewer.setAttribute('ar', '');
        modelViewer.id = 'interactiveModel';

        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.textContent = '⛶ На цял екран';
        fullscreenBtn.style.marginTop = '10px';
        fullscreenBtn.style.padding = '6px 12px';
        fullscreenBtn.style.fontSize = '14px';
        fullscreenBtn.style.cursor = 'pointer';
        fullscreenBtn.onclick = () => {
            const modelEl = document.getElementById('interactiveModel');
            if (modelEl.requestFullscreen) {
                modelEl.requestFullscreen();
            } else if (modelEl.webkitRequestFullscreen) {
                modelEl.webkitRequestFullscreen();
            } else if (modelEl.msRequestFullscreen) {
                modelEl.msRequestFullscreen();
            }
        };

        const exitBtn = document.createElement('button');
        exitBtn.textContent = '⤺ Изход от цял екран';
        exitBtn.style.position = 'absolute';
        exitBtn.style.top = '12px';
        exitBtn.style.right = '12px';
        exitBtn.style.zIndex = '9999';
        exitBtn.style.padding = '6px 10px';
        exitBtn.style.fontSize = '13px';
        exitBtn.style.display = 'none';
        exitBtn.style.backgroundColor = '#007acc';
        exitBtn.style.color = 'white';
        exitBtn.style.border = 'none';
        exitBtn.style.borderRadius = '4px';
        exitBtn.style.cursor = 'pointer';

        exitBtn.onclick = () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        };

        modelViewer.addEventListener('fullscreenchange', () => {
            exitBtn.style.display = document.fullscreenElement ? 'block' : 'none';
        });

        container.innerHTML = '';
        container.appendChild(modelViewer);
        container.appendChild(fullscreenBtn);
        modelViewer.appendChild(exitBtn);

        if (!window.customElements.get('model-viewer')) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
            document.head.appendChild(script);
        }
    }, 2000);
}


function enableLightbox() {
  const existing = document.getElementById('lightbox-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'lightbox-modal';
  modal.style.position = 'fixed';
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.9)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = 1000;
  modal.style.display = 'none';
  modal.style.flexDirection = 'column';

  const contentContainer = document.createElement('div');
  contentContainer.style.maxWidth = '90vw';
  contentContainer.style.maxHeight = '80vh';
  contentContainer.style.borderRadius = '8px';
  contentContainer.style.boxShadow = '0 0 10px #000';
  contentContainer.style.background = 'transparent';
  contentContainer.style.display = 'flex';
  contentContainer.style.alignItems = 'center';
  contentContainer.style.justifyContent = 'center';
  contentContainer.style.overflow = 'hidden';

  modal.appendChild(contentContainer);

  const nav = document.createElement('div');
  nav.style.marginTop = '10px';
  nav.style.display = 'flex';
  nav.style.justifyContent = 'space-between';
  nav.style.width = '100px';
  nav.style.gap = '10px';
  nav.style.alignItems = 'center';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '<';
  prevBtn.style.fontSize = '18px';
  prevBtn.style.padding = '4px 8px';
  prevBtn.style.cursor = 'pointer';

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '>';
  nextBtn.style.fontSize = '18px';
  nextBtn.style.padding = '4px 8px';
  nextBtn.style.cursor = 'pointer';

  nav.appendChild(prevBtn);
  nav.appendChild(nextBtn);
  modal.appendChild(nav);

  const imageList = [];
  const typeList = [];
  let currentIndex = 0;

  const showImage = (index) => {
    if (index >= 0 && index < imageList.length) {
      currentIndex = index;
      contentContainer.innerHTML = '';
      const src = imageList[index];
      const type = typeList[index];
      if (type === 'pdf') {
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.style.width = '90vw';
        iframe.style.height = '80vh';
        iframe.style.border = 'none';
        iframe.style.backgroundColor = 'transparent';
        contentContainer.appendChild(iframe);
      } else {
        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '90vw';
        img.style.maxHeight = '80vh';
        img.style.borderRadius = '8px';
        img.style.backgroundColor = 'transparent';
        contentContainer.appendChild(img);
      }
      modal.style.display = 'flex';
    }
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  document.body.appendChild(modal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      modal.style.display = 'none';
    } else if (e.key === 'ArrowRight') {
      showImage((currentIndex + 1) % imageList.length);
    } else if (e.key === 'ArrowLeft') {
      showImage((currentIndex - 1 + imageList.length) % imageList.length);
    }
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage((currentIndex - 1 + imageList.length) % imageList.length);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage((currentIndex + 1) % imageList.length);
  });

  const triggers = document.querySelectorAll('.lightbox-trigger');
  triggers.forEach((el, i) => {
    const src = el.getAttribute('data-src');
    const type = el.getAttribute('data-type') || 'image';
    imageList.push(src);
    typeList.push(type);
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showImage(i);
    });
  });

  // Touch swipe for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  modal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) {
      showImage((currentIndex + 1) % imageList.length);
    } else if (touchEndX > touchStartX + 50) {
      showImage((currentIndex - 1 + imageList.length) % imageList.length);
    }
  });
}

function showOrderModal() {
  document.getElementById("orderModal").style.display = "block";
}

function closeModal() {
  document.getElementById("orderModal").style.display = "none";
}

// Затваряне при клик извън модалния прозорец
window.onclick = function(event) {
  const modal = document.getElementById("orderModal");
  if (event.target === modal) {
    closeModal();
  }
}
