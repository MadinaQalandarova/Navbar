const list = document.querySelectorAll(".navigation ul li");
const indicator = document.querySelector(".indicator");

let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
const itemWidth = 70;

// Boshlang'ich holatni o'rnatish
setIndicatorPosition(0);

function setIndicatorPosition(index) {
  currentTranslate = index * itemWidth;
  prevTranslate = currentTranslate;
  indicator.style.transition = "transform 0.3s ease";
  indicator.style.transform = `translateX(${currentTranslate}px)`;

  list.forEach((item, i) => {
    if (i === index) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

indicator.addEventListener("mousedown", dragStart);
indicator.addEventListener("touchstart", dragStart);

window.addEventListener("mousemove", drag);
window.addEventListener("touchmove", drag);

window.addEventListener("mouseup", dragEnd);
window.addEventListener("touchend", dragEnd);

function dragStart(e) {
  isDragging = true;
  startX = getPositionX(e) - prevTranslate;
  indicator.style.transition = "none";
}

function drag(e) {
  if (!isDragging) return;

  const currentX = getPositionX(e);
  let newTranslate = currentX - startX;

  const maxTranslate = (list.length - 1) * itemWidth;
  if (newTranslate < 0) newTranslate = 0;
  if (newTranslate > maxTranslate) newTranslate = maxTranslate;

  currentTranslate = newTranslate;
  indicator.style.transform = `translateX(${currentTranslate}px)`;

  const closestIndex = Math.round(currentTranslate / itemWidth);
  list.forEach((item, index) => {
    if (index === closestIndex) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

function dragEnd() {
  if (!isDragging) return;
  isDragging = false;

  const closestIndex = Math.round(currentTranslate / itemWidth);
  setIndicatorPosition(closestIndex);
}

function getPositionX(e) {
  return e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
}

list.forEach((item, index) => {
  item.style.cursor = "pointer";
  item.addEventListener("click", () => {
    setIndicatorPosition(index);
  });
});
