// JS логика за карусела
const list = document.querySelector('.list');
const thumbnails = document.querySelectorAll('.thumbnail .item');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
let index = 0;

function showSlide(i) {
  index = i;
  list.style.transform = `translateX(-${index * 100}vw)`;
  thumbnails.forEach((thumb, idx) => {
    thumb.classList.toggle('active', idx === i);
  });
}

prevBtn.addEventListener('click', () => {
  index = (index - 1 + thumbnails.length) % thumbnails.length;
  showSlide(index);
});

nextBtn.addEventListener('click', () => {
  index = (index + 1) % thumbnails.length;
  showSlide(index);
});

document.querySelectorAll('.thumbnail .item').forEach((item, i) => {
  item.addEventListener('click', () => showSlide(i));
});

showSlide(index);
