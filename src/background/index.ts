console.log('Context Bridge Background Script Loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Context Bridge installed');

  // Create context menu
  chrome.contextMenus.create({
    id: 'save-page-content',
    title: 'Save Page Content',
    contexts: ['page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-page-content' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'PARSE_PAGE' }).catch((err) => {
        console.warn('Could not send message to content script (maybe not loaded yet):', err);
    });
  }
});
