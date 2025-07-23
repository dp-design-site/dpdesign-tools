// Конфигурационен скрипт – Етап 2: зареждане на изображения и PDF

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
      <img src="${basePath}/preview_drawing.png" class="drawing-preview responsive-preview lightbox-trigger" data-src="${basePath}/preview_drawing.png">
      <div class="thumbnail-row">
        <img src="${basePath}/view1.png" class="thumbnail lightbox-trigger" data-src="${basePath}/view1.png">
        <img src="${basePath}/view2.png" class="thumbnail lightbox-trigger" data-src="${basePath}/view2.png">
      </div>
    </div>
  `;

  document.getElementById('preview').innerHTML = previewHTML;
  document.getElementById('output').style.display = 'none';

  enableLightbox();
}

function enableLightbox() {
  // Премахване на съществуващ модален прозорец ако има
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

  const img = document.createElement('img');
  img.style.maxWidth = '90vw';
  img.style.maxHeight = '90vh';
  img.style.borderRadius = '8px';
  modal.appendChild(img);

  modal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  document.body.appendChild(modal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      modal.style.display = 'none';
    }
  });

  document.querySelectorAll('.lightbox-trigger').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const src = el.getAttribute('data-src');
      img.src = src;
      modal.style.display = 'flex';
    });
  });
}
