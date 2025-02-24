/* index.js - Handles page navigation and dynamic loading */

// Dynamically loads partial HTML files based on the chosen page & language
function navigateTo(pageName) {
  // If you stored the language in a cookie, retrieve it; default to English
  const lang = getCookie("lang") || "en";
  let fileToLoad = "";

  switch (pageName) {
    case "landing":
      fileToLoad = `html/landing_${lang}.html`;
      break;
    case "projects":
      fileToLoad = `html/projects_${lang}.html`;
      break;
    case "about":
      fileToLoad = `html/about_${lang}.html`;
      break;
    case "imprint":
      fileToLoad = `html/imprint_${lang}.html`;
      break;
    default:
      fileToLoad = `html/landing_${lang}.html`;
  }

  fetch(fileToLoad)
    .then((response) => response.text())
    .then((htmlData) => {
      const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = htmlData;
      // optional fade-in
      contentDiv.classList.add("fade-in");
      setTimeout(() => {
        contentDiv.classList.remove("fade-in");
      }, 300);
    })
    .catch((err) => {
      console.error("Error loading page:", err);
    });
}

