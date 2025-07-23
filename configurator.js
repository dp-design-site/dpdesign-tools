// Конфигурационен скрипт – Етап 2: зареждане на изображения и PDF с Lightbox и скрол

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

  const img = document.createElement('img');
  img.style.maxWidth = '90vw';
  img.style.maxHeight = '80vh';
  img.style.borderRadius = '8px';
  modal.appendChild(img);

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
  let currentIndex = 0;

  const showImage = (index) => {
    if (index >= 0 && index < imageList.length) {
      currentIndex = index;
      img.src = imageList[index];
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
    imageList.push(src);
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
