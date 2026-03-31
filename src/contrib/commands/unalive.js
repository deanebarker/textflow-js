document.addEventListener("textflow:returning-data", (event) => {
  event.detail.working.text = event.detail.working.text
    .replaceAll("die", "unalive")
    .replaceAll("Die", "Unalive")
    .replaceAll("DIE", "UNALIVE");
});
