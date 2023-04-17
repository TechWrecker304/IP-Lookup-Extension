async function saveContentAsFile(content, fileName, contentType) {
  const blob = new Blob([content], {type: contentType});
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  
  downloadLink.href = url;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

function makeImageURLsAbsolute(content, baseUrl) {
  const base = new URL(baseUrl);
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  const images = doc.getElementsByTagName('img');
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    img.src = new URL(img.src, base).href;
  }

  return new XMLSerializer().serializeToString(doc);
}

function displayResultsInNewTab(content) {
  chrome.tabs.create({url: 'results.html'}, (tab) => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, {action: 'displayResults', content: content});
    }, 1000);
  });
}

async function sendToMultipleSites(info, tab) {
  const ipAddress = info.selectionText;
  
  const centralOpsUrl = `https://centralops.net/co/DomainDossier.aspx?addr=${encodeURIComponent(ipAddress)}&dom_whois=true&dom_dns=true&net_whois=true`;
  const ipLocationUrl = `https://iplocation.com/?ip=${encodeURIComponent(ipAddress)}`;

  try {
    const [centralOpsResponse, ipLocationResponse] = await Promise.all([
      fetch(centralOpsUrl),
      fetch(ipLocationUrl)
    ]);

    const [centralOpsContent, ipLocationContent] = await Promise.all([
      centralOpsResponse.text(),
      ipLocationResponse.text()
    ]);

    const centralOpsAbsoluteContent = makeImageURLsAbsolute(centralOpsContent, centralOpsUrl);
    const ipLocationAbsoluteContent = makeImageURLsAbsolute(ipLocationContent, ipLocationUrl);

    const combinedContent = `<h1>CentralOps</h1>\n${centralOpsAbsoluteContent}\n<h1>IP Location</h1>\n${ipLocationAbsoluteContent}`;

    displayResultsInNewTab(combinedContent);

  } catch (error) {
    console.error('Error fetching content:', error);
  }
}

chrome.contextMenus.create({
  id: 'ipLookup',
  title: 'Lookup IP on centralops.net and iplocation.com',
  contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ipLookup') {
    sendToMultipleSites(info, tab);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadResults') {
    saveContentAsFile(request.content, 'ip-lookup-result.html', 'text/html');
  }
});
