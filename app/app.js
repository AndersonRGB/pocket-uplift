(function initApp() {
  console.log("Pocket Uplift: app initialising");

  const root = document.getElementById("recommend-root");
  if (root) {
    root.textContent = "App shell loaded. Recommender will appear here.";
  }
})();