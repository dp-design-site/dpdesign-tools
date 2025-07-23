// Конфигурационен скрипт – Етап 2: зареждане на изображения и PDF с Lightbox и скрол + 3D визуализация

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

  document.getElementById('preview').innerHTML = previewHTML;
  document.getElementById('output').style.display = 'none';

  enableLightbox();
}

function load3DModel(modelUrl) {
  const container = document.getElementById("modelContainer");
  container.innerHTML = `<p style="color: #ccc;">Зареждане на 3D модел...</p>`;

  const script = document.createElement('script');
  script.type = 'module';
  script.innerHTML = `
    import '@google/model-viewer';
    const modelViewer = document.createElement('model-viewer');
    modelViewer.src = '${modelUrl}';
    modelViewer.alt = '3D визуализация';
    modelViewer.style.width = '100%';
    modelViewer.style.height = '500px';
    modelViewer.setAttribute('camera-controls', '');
    modelViewer.setAttribute('auto-rotate', '');
    modelViewer.setAttribute('background-color', '#1e1e2f');
    document.getElementById("modelContainer").innerHTML = '';
    document.getElementById("modelContainer").appendChild(modelViewer);
  `;

  document.body.appendChild(script);
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
