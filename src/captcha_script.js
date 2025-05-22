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

  worker = Tesseract.createWorker({});
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  // View the captcha
  document.querySelector('.gwt-Button').click();

  await new Promise(res => {
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.className === 'DialogBox trPopupDialog typingChallengeDialog') {
          const img = node.querySelector('.challengeImg');
          if (img) {
            img.onload = () => {
              observer.disconnect(); // stop observing
              res();
            };
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  });


  // Use tesseract to perform OCR on the image
  let { data: { text } } = await worker.recognize(getImageDataURL());

  // Post-processing of text
  text = processText(text);

  // Inject the text into the typeracer textarea
  document.querySelector('.challengeTextArea').value = text;
  console.log(text);

  await worker.terminate();
}

// Wait for popup to send the message
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "solveCaptcha") {
    solveCaptcha().then(() => sendResponse({ status: "done" }));
    return true;
  }
});
