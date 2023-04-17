chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'displayResults') {
    document.getElementById('content').innerHTML = request.content;
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('downloadBtn').onclick = () => {
      chrome.runtime.sendMessage({action: 'downloadResults', content: request.content});
    };
  }
});
