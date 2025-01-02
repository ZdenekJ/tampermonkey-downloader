// ==UserScript==
// @name         OF Downloader
// @namespace    http://tampermonkey.net/
// @version      2024-12-29
// @description  Downloader
// @author       You
// @match        https://onlyfans.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=onlyfans.com
// @grant        none
// ==/UserScript==
(function () {
  "use strict";

  // Ensures the browser window gains focus when the script runs.
  window.focus();

  // Adds custom styles for the download buttons if they haven't been added yet.
  if (!document.querySelector("style[data-download-image-button-styles]")) {
    let styles = document.createElement("style");
    styles.setAttribute("data-download-image-button-styles", "");
    styles.innerHTML = `
      [data-download-image-button] {
        padding: 5px;
        margin: 5px;
        cursor: pointer;
        border-radius: 10px;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
      }
      [data-download-image-button]:hover {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
      }
    `;
    document.head.appendChild(styles);
  }

  // Function to create and append a download button to a specified container.
  const appendButton = (container, url, fileName) => {
    let button = document.createElement("button");
    button.innerHTML = "Download";
    button.setAttribute("data-download-image-button", "");
    button.addEventListener("click", (e) => {
      // Prevents default action and stops propagation of the click event.
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      // Initiates the file download.
      downloadFile(fileName, url);
    });
    container.appendChild(button); // Adds the button to the specified container.
  };

  // Main function for adding download links and buttons to images.
  function addDownloadLinks() {
    // Selector for unprocessed images in the targeted structure.
    const images = document.querySelectorAll(
      ".b-feed__wrapper .post_img_block img:not([data-download-added])"
    );

    images.forEach((img) => {
      // Marks the image as processed to avoid duplicate buttons.
      img.setAttribute("data-download-added", "true");

      const url = img.src,
        fileName = getFileName(img.src); // Extracts the file name from the image URL.

      // Finds the closest parent container for the image.
      const parentElement = img.closest(".post_img_block");
      if (parentElement) {
        const grandParentElement = parentElement.parentElement; // Gets the parent of parentElement.

        // Checks if a .download_buttons element exists immediately after grandParentElement.
        let downloadContainer = grandParentElement.nextElementSibling;
        if (
          !downloadContainer ||
          !downloadContainer.classList.contains("download_buttons")
        ) {
          // Creates the .download_buttons container if it doesn't exist.
          downloadContainer = document.createElement("div");
          downloadContainer.classList.add("download_buttons");
          grandParentElement.after(downloadContainer); // Inserts it immediately after grandParentElement.
        }
        // Appends the download button to the container.
        appendButton(downloadContainer, url, fileName);
      }
    });
  }

  // Converts a URL into a data URL for downloading as a blob object.
  const toDataURL = (url) => {
    return fetch(url)
      .then((response) => {
        return response.blob(); // Converts the response to a blob object.
      })
      .then((blob) => {
        return URL.createObjectURL(blob); // Generates a local URL for the blob.
      });
  };

  // Downloads a file by creating an anchor tag and simulating a click.
  async function downloadFile(fileName, src) {
    const a = document.createElement("a");
    a.href = await toDataURL(src); // Converts the source URL to a downloadable data URL.
    a.download = fileName; // Sets the file name for the downloaded file.
    document.body.appendChild(a); // Temporarily adds the anchor to the document.
    a.click(); // Simulates a click to initiate the download.
    a.remove(); // Removes the anchor after the download starts.
  }

  // Extracts a file name from a URL or generates a default name for data URLs.
  const getFileName = (url) => {
    if (/^data:image\/([a-zA-Z0-9]+)/.test(url)) {
      // For data URLs, extracts the file extension and constructs a name.
      let extension = url.match(/^data:image\/([a-zA-Z0-9]+)/);
      return "image." + extension[1];
    } else {
      // For regular URLs, extracts the file name from the path.
      let match = url.match(/^.*\/(.+?)(\?.+?)?$/);
      if (match && match[1]) {
        return match[1];
      } else {
        return "image.jpg"; // Default file name if extraction fails.
      }
    }
  };

  // Observes the DOM for dynamically added images and applies download links/buttons.
  const observer = new MutationObserver(() => {
    addDownloadLinks();
  });

  observer.observe(document.body, { childList: true, subtree: true }); // Monitors changes in the entire document subtree.

  // Runs the function initially for images already present on the page.
  addDownloadLinks();
})();
