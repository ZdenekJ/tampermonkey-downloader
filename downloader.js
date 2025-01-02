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

  window.focus();

  const listenCombination = ({
    combination,
    callback,
    once,
    element = window,
  }) => {
    let combinationMemory = [];
    let emptyTimeout;
    let count = 0;

    const onKeyUp = (e) => {
      combinationMemory = combinationMemory.filter((item) => item !== e.code);
      emptyTimeout = setTimeout(() => {
        combinationMemory = [];
      }, 500);
    };
    const onKeyDown = (e) => {
      clearTimeout(emptyTimeout);
      if (!combinationMemory.includes(e.code)) {
        combinationMemory.push(e.code);
      }
      if (
        combination.every((item, index) => item === combinationMemory[index])
      ) {
        if (once) {
          element.removeEventListener("keydown", onKeyDown);
          element.removeEventListener("keyup", onKeyUp);
        }
        callback(++count);
      }
    };

    element.addEventListener("keyup", onKeyUp);
    element.addEventListener("keydown", onKeyDown);
  };

  const appendButton = ({
    width,
    height,
    top,
    left,
    element,
    url,
    fileName,
  }) => {
    let button = document.createElement("button");
    let size = 50;
    let styles;
    if (!document.querySelector("style[data-download-image-button-styles]")) {
      styles = document.createElement("style");
      styles.setAttribute("data-download-image-button-styles", "");
      styles.innerHTML = `
				[data-download-image-button] {
					z-index: 99999;
					position: absolute;
					border: none;
					outline: none;
					padding: 5px;
					margin: 0;
					cursor: pointer;
					background-color: white;
					opacity: 0.5;
					border-radius: 10px;
					box-shadow: 0 0 0 rgba(0, 0, 0, 0.3);
					transition: all .2s ease-out;
                    right: 20px;
                    bottom: 20px;
				}
				[data-download-image-button]:hover {
					transform: scale(1.2);
					opacity: 1;
					box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
				}
				[data-download-image-button]:active {
					transform: scale(1.1);
					opacity: 1;
					box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
				}
			`;
      document.head.appendChild(styles);
    }

    button.innerHTML = "Download";
    // button.style.top = top + (height / 2) - (size / 2) + "px";
    // button.style.left = left + (width / 2) - (size / 2) + "px";
    button.setAttribute("data-download-image-button", "");
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      downloadFile(fileName, url);
    });
    element.prepend(button);
  };

  const toDataURL = (url) => {
    return fetch(url)
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        return URL.createObjectURL(blob);
      });
  };

  async function downloadFile(fileName, src) {
    const a = document.createElement("a");
    a.href = await toDataURL(src);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const getFileName = (url) => {
    if (/^data:image\/([a-zA-Z0-9]+)/.test(url)) {
      let extension = url.match(/^data:image\/([a-zA-Z0-9]+)/);
      return "image." + extension[1];
    } else {
      let match = url.match(/^.*\/(.+?)(\?.+?)?$/);
      if (match && match[1]) {
        return match[1];
      } else {
        return "image.jpg";
      }
    }
  };

  listenCombination({
    combination: ["ControlLeft", "KeyQ"],
    callback: (count) => {
      if (count % 2 === 0) {
        Array.from(
          document.querySelectorAll("[data-download-image-button]")
        ).forEach((element) => element.remove());
        return;
      }

      Array.from(document.querySelectorAll("*:not(img)")).forEach((element) => {
        if (element.offsetParent) {
          let computedStyle = getComputedStyle(element);
          let match = computedStyle.backgroundImage.match(
            /^url\(['"](.+?)['"]\)/
          );

          if (match && match[1]) {
            appendButton({
              top: element.offsetTop,
              left: element.offsetLeft,
              width: element.offsetWidth,
              height: element.offsetHeight,
              element: element.offsetParent,
              url: match[1],
              fileName: getFileName(match[1]),
            });
          }
        }
      });

      Array.from(
        document.querySelectorAll(".b-feed__wrapper .post_img_block img")
      ).forEach((element) => {
        if (element.offsetParent) {
          appendButton({
            top: element.offsetTop,
            left: element.offsetLeft,
            width: element.offsetWidth,
            height: element.offsetHeight,
            element: element.offsetParent,
            url: element.src,
            fileName: getFileName(element.src),
          });
        }
      });
    },
    once: false,
  });
})();
