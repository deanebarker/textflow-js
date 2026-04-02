document.addEventListener("textflow:pipeline-created", (event) => {

  event.detail.pipeline.registerInstanceAlias("unhyperlink", "remove", {
    selector: "a",
    preserve: "text",
  });

});
