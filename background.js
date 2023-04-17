function sendToCentralOps(info, tab) {
  const ipAddress = info.selectionText;
  const url = `https://centralops.net/co/DomainDossier.aspx?addr=${encodeURIComponent(ipAddress)}&dom_whois=true&dom_dns=true&net_whois=true`;

  chrome.tabs.create({url: url});
}

chrome.contextMenus.create({
  id: 'ipLookup',
  title: 'Lookup IP on centralops.net',
  contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ipLookup') {
    sendToCentralOps(info, tab);
  }
});
