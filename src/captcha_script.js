function replaceColour(i, width) {
  const percent = ((i / 4) % width) / width;
  return {
    r: 192 + (205 - 192) * percent,
    g: 193 + (233 - 193) * percent,
    b: 195 + (247 - 195) * percent
  };
}

function processText(text) {
  return text
    .replaceAll('\n', ' ')
    .replaceAll('1', 'l')
    .replaceAll('(', 'l')
    .replaceAll(')', 'l')
    .replaceAll('[', 'I')
    .replaceAll('@', 'a')
    .replaceAll('¥', 'y')
    .replaceAll('\\', 'i')
    .replaceAll('|', 'I')
    .replaceAll('.', '\u1000 ').replaceAll('\u1000', '.')
    .replaceAll(',', '\u1000 ').replaceAll('\u1000', ',')
    .replaceAll('  ', ' ');
}

function getImageDataURL() {
  const img = document.querySelector('.challengeImg');
  const canv = document.createElement('canvas');
  img.parentElement.parentElement.parentElement.parentElement.appendChild(canv);

  canv.style.display = 'block';
  canv.style.marginTop = '5px';
  canv.style.backgroundColor = 'black';
  canv.width = img.width;
  canv.height = img.height;

  const ctx = canv.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, img.width, img.height);

  const changedPixels = [];
  for (let i = 0; i < imgData.data.length; i += 4) {
    if (imgData.data[i] <= 50 && imgData.data[i + 1] <= 50 && imgData.data[i + 2] <= 50) {
      const c = replaceColour(i, img.width);
      imgData.data[i] = c.r;
      imgData.data[i + 1] = c.b;
      imgData.data[i + 2] = c.g;
      changedPixels.push(i);
    }
  }

  changedPixels.forEach(i => {
    const c = replaceColour(i, img.width);
    try { imgData.data[i + img.width * 4] = c.r; } catch {}
    try { imgData.data[i + 1 + img.width * 4] = c.g; } catch {}
    try { imgData.data[i + 2 + img.width * 4] = c.b; } catch {}
    try { imgData.data[i - img.width * 4] = c.r; } catch {}
    try { imgData.data[i + 1 - img.width * 4] = c.g; } catch {}
    try { imgData.data[i + 2 - img.width * 4] = c.b; } catch {}
    try { imgData.data[i + 4] = c.r; } catch {}
    try { imgData.data[i + 1 + 4] = c.g; } catch {}
    try { imgData.data[i + 2 + 4] = c.b; } catch {}
    try { imgData.data[i - 4] = c.r; } catch {}
    try { imgData.data[i + 1 - 4] = c.g; } catch {}
    try { imgData.data[i + 2 - 4] = c.b; } catch {}
  });

  ctx.putImageData(imgData, 0, 0);
  return canv.toDataURL();
}

async function solveCaptcha() {
  console.log("[CAPTCHA Solver] Starting");

  // Trigger CAPTCHA modal
  document.querySelector('.gwt-Button')?.click();

  // Wait for the CAPTCHA image to load
  const popupLoaded = await new Promise(resolve => {
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (
            node.nodeType === 1 &&
            node.classList.contains('DialogBox') &&
            node.querySelector('.challengeImg')
          ) {
            node.querySelector('.challengeImg').onload = () => {
              observer.disconnect();
              resolve(true);
            };
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  // Load Tesseract locally from extension
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("lib/tesseract.min.js");
  const worker = Tesseract.createWorker({
    workerPath: chrome.runtime.getURL("lib/tesseract.worker.min.js"),
    corePath: chrome.runtime.getURL("lib/tesseract-core.wasm"),
  });
}

// Wait for popup to send the message
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "solveCaptcha") {
    solveCaptcha().then(() => sendResponse({ status: "done" }));
    return true;
  }
});
