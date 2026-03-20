import { Helpers } from "../textflow.js";

async function stripHyperlinks(working, command) {
  
  const doc = await Helpers.parseHtml(working.text);
  
  doc.querySelectorAll("a").forEach((a) => {
    a.outerHTML = a.innerHTML;
  });

  return doc.body.innerHTML;
}

stripHyperlinks.title = "Strip Hyperlinks";
stripHyperlinks.description = "Remove all hyperlinks from the working text, leaving the link text intact.";
stripHyperlinks.allowedContentTypes = ["html"];

export default stripHyperlinks;