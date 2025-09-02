let nextButton = document.getElementById('next');
let prevButton = document.getElementById('prev');
let carousel = document.querySelector('.carousel');
let listHTML = document.querySelector('.carousel .list');
let seeMoreButtons = document.querySelectorAll('.seeMore');
let backButton = document.getElementById('back');

nextButton.onclick = function(){
    showSlider('next');
}
prevButton.onclick = function(){
    showSlider('prev');
}
let unAcceppClick;
const showSlider = (type) => {
    nextButton.style.pointerEvents = 'none';
    prevButton.style.pointerEvents = 'none';

    carousel.classList.remove('next', 'prev');
    let items = document.querySelectorAll('.carousel .list .item');
    if(type === 'next'){
        listHTML.appendChild(items[0]);
        carousel.classList.add('next');
    }else{
        listHTML.prepend(items[items.length - 1]);
        carousel.classList.add('prev');
    }
    clearTimeout(unAcceppClick);
    unAcceppClick = setTimeout(()=>{
        nextButton.style.pointerEvents = 'auto';
        prevButton.style.pointerEvents = 'auto';
    }, 2000)
}
seeMoreButtons.forEach((button) => {
    button.onclick = function(){
        carousel.classList.remove('next', 'prev');
        carousel.classList.add('showDetail');

        // намери активния елемент (втори в списъка)
        let activeItem = document.querySelector('.carousel .list .item:nth-child(2)');
        if(activeItem){
            let viewer = activeItem.querySelector('model-viewer');
            if(viewer){
                // лениво задаване на src при първо отваряне
                if(!viewer.hasAttribute('src')){
                    const dataSrc = viewer.getAttribute('data-src');
                    if(dataSrc){
                        viewer.setAttribute('src', dataSrc);
                    }
                }
                // при reveal="manual" трябва изрично да отменим постера
                const dismiss = () => viewer.dismissPoster && viewer.dismissPoster();
                // опитай веднага
                dismiss();
                // и при зареждане, ако още не е станало
                viewer.addEventListener('load', dismiss, { once: true });
            }
        }
    }
});
backButton.onclick = function(){
    carousel.classList.remove('showDetail');
}

// 🌙 Запомняне и прилагане на избрана тема
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
}

window.toggleTheme = function() {
    document.body.classList.toggle('dark');
    const newTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
} 
