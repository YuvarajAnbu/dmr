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
    document.body.classList.remove("ham-open");
  });
});

//footer year
document.getElementById("year").innerHTML = new Date().getFullYear();

//gallery

const url = "/.netlify/functions/cloudinary";
// const url = "/";
const perPage = 10; // number of results per page
let page = ""; // cursor for pagination, empty string for the first page

async function fetchImages() {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ page, perPage }),
  });
  const result = await response.json();
  console.log(result);
  // process the result and render the images in your gallery
  // ...
}

// call fetchImages() when the page is loaded, or when the user clicks on a "Load More" button
fetchImages();
