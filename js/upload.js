const msg = document.getElementById("msg");

let msgTimeout;

function showMsg(text, err) {
  msg.innerText = text;
  if (err) msg.classList.add("err");
  else msg.classList.remove("err");
  msg.classList.remove("hide");

  msgTimeout = setTimeout(() => {
    msg.classList.add("hide");
  }, 1500);
}

// const loginUrl = "/.netlify/functions/login";
// const fetchUrl = "/.netlify/functions/fetchImages";
// const deleteUrl = "/.netlify/functions/deleteImages";

const loginUrl = "http://localhost:3000/login";
const fetchUrl = "http://localhost:3000/img";
const deleteUrl = "http://localhost:3000/delete";

const limit = 12; // number of results per page
const cloudName = "xander-ecommerce";
let page = 0; // cursor for pagination, empty string for the first page
let next_cursor = "";

// verify cookie if exists
async function verify() {
  try {
    let cookie = document.cookie;
    if (cookie) {
      let token = cookie.split("; ").find((row) => row.startsWith("token"));
      if (token) {
        token = token.split("=")[1];
        const response = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        if (data.uploadPreset) {
          showMsg("Login Success!");
          populate(data.uploadPreset);
          document.body.classList.add("logged");
        }
      }
    }

    document.body.classList.remove("loading");
  } catch (err) {
    document.body.classList.remove("loading");
    console.log(err);
  }
}
verify();

//submit form
const button = document.querySelector(".login form button");
const form = document.querySelector(".login form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const password = document.getElementById("password").value;
    button.disabled = true;
    if (password) {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (data.token) {
        document.cookie = `token=${
          data.token
        }; SameSite=None; Secure; max-age=${60 * 60 * 24}`;
        populate(data.uploadPreset);

        showMsg("Login Success!");
        document.body.classList.add("logged");
      }
    }
    button.disabled = false;
  } catch (err) {
    button.disabled = false;
    console.log(err, "jh");
    showMsg(err.message, true);
  }
});

//upload and delete images page
function populate(uploadPreset) {
  //upload widget
  const widget = cloudinary.createUploadWidget(
    {
      cloudName: "xander-ecommerce",
      uploadPreset: uploadPreset,
      sources: ["local", "url", "camera"],
      showAdvancedOptions: false,
      cropping: false,
      multiple: true,
      defaultSource: "local",
      styles: {
        palette: {
          window: "#FFFFFF",
          windowBorder: "#90A0B3",
          tabIcon: "#0078FF",
          menuIcons: "#5A616A",
          textDark: "#000000",
          textLight: "#FFFFFF",
          link: "#0078FF",
          action: "#FF620C",
          inactiveTabIcon: "#0E2F5A",
          error: "#F44235",
          inProgress: "#0078FF",
          complete: "#20B832",
          sourceBg: "#E4EBF1",
        },
        fonts: {
          default: null,
          "'Fira Sans', sans-serif": {
            url: "https://fonts.googleapis.com/css?family=Fira+Sans",
            active: true,
          },
        },
      },
    },
    (err, result) => {
      if (!err && result && result.event === "success") {
        showMsg("Upload Success");
        resetImages();
      }

      if (err) {
        showMsg("Something Went Wrong!");
        console.log(err);
      }
    }
  );

  //toggle widget open
  document.getElementById("upload_widget").addEventListener(
    "click",
    () => {
      widget.open();
    },
    false
  );

  //fetch images
  fetchImages();
}

const imgs = document.querySelector(".gallery .imgs");
const moreBtn = document.querySelector(".gallery .more-btn");
const popup = document.querySelector(".upload .popup");
const popupImg = document.querySelector(".upload .popup img");
const popupBtn = document.querySelector(".upload .popup #yes");
const popupClose = document.querySelectorAll(".upload .popup .close");

let imgUrl = "";
let imgName = "";

function openPopup() {
  popupImg.src = imgUrl;
  popup.classList.add("show");
}

function closePopup() {
  popup.classList.remove("show");
  popupImg.src = "";

  imgUrl = "";
  imgName = "";
}

popupBtn.addEventListener("click", async () => {
  try {
    const response = await fetch(deleteUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imgName }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    resetImages();
    closePopup();
    showMsg("Image Deleted SuccessFully!");
  } catch (error) {
    showMsg(error.message, true);
    console.log(error);
  }
});

popupClose.forEach((el) => {
  el.addEventListener("click", () => {
    closePopup();
  });
});

async function fetchImages() {
  try {
    const response = await fetch(fetchUrl, {
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

      const img = document.createElement("img");
      img.src = `https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_300,h_300/${el.public_id}.${el.format}`;
      img.alt = "";
      div.append(img);
      imgs.append(div);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = "Remove";
      btn.onclick = () => {
        imgUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_300,h_300/${el.public_id}.${el.format}`;
        imgName = el.public_id;
        openPopup();
      };
      div.append(btn);
    });

    page++;
    next_cursor = data.next_cursor;
  } catch (err) {
    console.log(err);
  }
}

moreBtn.addEventListener("click", () => {
  if (!imgs.classList.contains("more-rows")) imgs.classList.add("more-rows");
  fetchImages();
});

function resetImages() {
  imgs.innerHTML = "";
  page = 0;
  next_cursor = "";
  fetchImages();
}
