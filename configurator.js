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

  // Път до изображенията и PDF файла
  const basePath = `img/${configID}`;

  const previewHTML = `
    <h3>Преглед на чертеж:</h3>
    <div class="gallery">
      <a href="${basePath}/drawing.pdf" target="_blank">
        <img src="${basePath}/preview_drawing.png" class="drawing-preview">
      </a>
      <div class="thumbnail-row">
        <a href="${basePath}/view1.png" target="_blank">
          <img src="${basePath}/view1.png" class="thumbnail">
        </a>
        <a href="${basePath}/view2.png" target="_blank">
          <img src="${basePath}/view2.png" class="thumbnail">
        </a>
      </div>
    </div>
    <button id="orderButton" class="order-button">Поръчай</button>
    <div id="orderConfirmation" class="order-confirmation"></div>
    <footer class="footer">© dp-design.tools – всички права запазени</footer>
  `;

  document.getElementById('preview').innerHTML = previewHTML;
  document.getElementById('output').style.display = 'none';

  // Добавяме обработка за бутона Поръчай
  setTimeout(() => {
    const btn = document.getElementById('orderButton');
    if (btn) {
      btn.addEventListener('click', () => {
        document.getElementById('orderConfirmation').innerText =
          'Благодарим за направената поръчка. Наш колега ще се свърже с вас за потвърждение.';
      });
    }
  }, 50);
}

// Стиловете ще се добавят към основния HTML или CSS файл
