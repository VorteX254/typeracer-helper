console.log("popup opened")

function captcha_script(){
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['captcha_script.js']
        });
    });
}

function typer_script(){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['type_script.js']
        }, () => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startTyping" });
      });
    });
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('typer_button').addEventListener('click', typer_script)

  document.getElementById('captcha_button').addEventListener('click', captcha_script)
});