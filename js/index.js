//nav-links on mobile

const ham = document.querySelector("header .ham");
const navLinks = document.querySelectorAll("nav ul li");

//toggle options on ham click
ham.addEventListener("click", () => {
  document.body.classList.toggle("ham-open");
});

//close ham if user resizes
window.addEventListener("resize", () => {
  if (
    document.body.classList.contains("ham-open") &&
    window.innerWidth > 1000
  ) {
    document.body.classList.remove("ham-open");
  }
});

//close navlinks on links click
navLinks.forEach((el) => {
  el.addEventListener("click", () => {
    document
      .getElementById(el.getAttribute("data-target"))
      .scrollIntoView({ behavior: "smooth" });
    document.body.classList.remove("ham-open");
  });
});

//cta
document.getElementById("cta").addEventListener("click", () => {
  document.getElementById("about").scrollIntoView({ behavior: "smooth" });
});

//landing swiper
const lSwiper = new Swiper(".landing .swiper", {
  // Optional parameters
  effect: "fade",
  loop: true,
  autoplay: {
    delay: 3000,
  },

  // If we need pagination
  pagination: {
    clickable: true,
    el: ".swiper-pagination",
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

//footer year
document.getElementById("year").innerHTML = new Date().getFullYear();

//gallery
const imgs = document.querySelector(".gallery .imgs");
const moreBtn = document.querySelector(".gallery .more-btn");
const gPopup = document.querySelector(".gallery .popup");
const closeBtn = document.querySelector(".gallery .popup .close");
const gSwiperWrapper = document.querySelector(
  ".gallery .popup .swiper .swiper-wrapper"
);

//gallery swiper
let gSwiper;

const openGPopup = (i) => {
  gSwiper = new Swiper(".gallery .swiper", {
    centeredSlides: true,
    loop: true,
    initialSlide: i,
    // slidesPerView: 2,
    effect: "creative",
    creativeEffect: {
      prev: {
        scale: 0.7,
        translate: ["-125%", 0, -800],
        opacity: 0.0,
      },
      next: {
        translate: ["125%", 0, -800],
        scale: 1,
        opacity: 0.0,
      },
    },
    // Navigation arrows
    navigation: {
      nextEl: ".swiper-nav-next",
      prevEl: ".swiper-nav-prev",
    },
  });
  gPopup.classList.add("show");
};

closeBtn.addEventListener("click", () => {
  gPopup.classList.remove("show");
  if (gSwiper) gSwiper.destroy();
});

const url = "/.netlify/functions/fetchImages";
// const url = "http://localhost:3000/img";
const limit = 12; // number of results per page
const cloudName = "xander-ecommerce";
let page = 0; // cursor for pagination, empty string for the first page
let next_cursor = "";

async function fetchImages() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ next_cursor, limit }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    data.resources.forEach((el, i) => {
      //update gallery images
      const div = document.createElement("div");
      div.setAttribute("data-index", page * limit + i);
      div.style.setProperty("--index", i);
      div.onclick = (e) => {
        openGPopup(Number(e.currentTarget.getAttribute("data-index")));
      };
      const img = document.createElement("img");
      img.src = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_300,h_300/${el.public_id}.${el.format}`;
      img.alt = "";
      div.append(img);
      imgs.append(div);

      gSwiperWrapper.insertAdjacentHTML(
        "beforeend",
        `<div class="swiper-slide"><img
      src=${`https://res.cloudinary.com/xander-ecommerce/image/upload/c_fit,w_800,h_800/${el.public_id}.${el.format}`}
      alt=""
      srcset=""
      loading="lazy"
    /><div class="swiper-lazy-preloader"></div></div>`
      );
    });

    page++;
    next_cursor = data.next_cursor;
  } catch (err) {
    console.log(err);
  }
}

// fetch images on start and when the user clicks on a "Load More" button
fetchImages();
moreBtn.addEventListener("click", () => {
  if (!imgs.classList.contains("more-rows")) imgs.classList.add("more-rows");
  fetchImages();
});
