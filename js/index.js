//i18n
const selectContainer = document.querySelector(".locale");
const selectBtn = document.querySelector(".locale .btn");
const selectBtnSpan = document.querySelector(".locale .btn span");
const optionsContainer = document.querySelector(".locale .options");

const locales = ["en", "ta"]; //supported locales
let locale = "ta"; //current locale

// When the page content is ready...
document.addEventListener("DOMContentLoaded", async () => {
  // Translate the page to the default locale or locale saved in local-storage
  let sLocale = localStorage.getItem("locale");
  if (sLocale) locale = sLocale;

  //populate options on locale dropdown
  locales.forEach((el) => {
    if (el === locale) {
      selectBtnSpan.innerText = locale;
    } else {
      let option = document.createElement("li");
      option.innerText = el;
      optionsContainer.append(option);
    }
  });
  document.body.classList.add("hide");
  await translate();
  document.body.classList.remove("hide");
});

async function translate() {
  try {
    // loading json file
    const resp = await fetch(`/lang/${locale}.json`);
    const translations = await resp.json();

    //saving selected locale to cookie
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;

    //getting all element with attributes
    document.querySelectorAll("[data-i18n-key]").forEach((el) => {
      //getting its key
      const key = el.getAttribute("data-i18n-key");
      //getting translation text
      const translation = translations[key];
      //populating translation
      el.innerText = translation;
    });

    //getting all element with placeholder attributes
    document.querySelectorAll("[data-i18n-key-ph]").forEach((el) => {
      //getting its key
      const key = el.getAttribute("data-i18n-key-ph");
      //getting translation text
      const translation = translations[key];
      //populating translation
      el.placeholder = `${translation} ${el.required ? "*" : ""}`;
    });
  } catch (err) {
    console.log(err);
  }
}

selectBtn.addEventListener("click", () => {
  selectContainer.classList.toggle("open");
});

selectContainer.addEventListener("blur", (e) => {
  selectContainer.classList.remove("open");
});

optionsContainer.addEventListener("click", (e) => {
  //setting locale
  locale = e.target.innerHTML.trim();
  //changing span and clicked options innertext
  e.target.innerHTML = selectBtnSpan.innerHTML;
  selectBtnSpan.innerHTML = locale;
  selectContainer.classList.remove("open");

  //translating
  translate();
});

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
const cloudName = "dmr-contractors";
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

      //secset for different resolutions
      img.srcset = `
      https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_300,h_300/${el.public_id}.${el.format},
      https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_600,h_600/${el.public_id}.${el.format} 2x,
      https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_900,h_900/${el.public_id}.${el.format} 3x,
      `;
      img.alt = "";
      div.append(img);
      imgs.append(div);

      gSwiperWrapper.insertAdjacentHTML(
        "beforeend",
        `<div class="swiper-slide"><img
      src="https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_1400,h_800/${el.public_id}.${el.format}"
      alt=""
      srcset=
      "https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_600,h_800/${el.public_id}.${el.format} 600w, https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_1000,h_800/${el.public_id}.${el.format} 1000w, https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_1400,h_800/${el.public_id}.${el.format} 1400w"
      loading="lazy"
    /><div class="swiper-lazy-preloader"></div></div>`
      );
    });

    page++;
    if (data.next_cursor) {
      next_cursor = data.next_cursor;
    } else {
      moreBtn.disabled = true;
    }
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
