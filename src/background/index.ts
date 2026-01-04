console.log('Context Bridge Background Script Loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Context Bridge installed');

  // Create context menu
  if (chrome.contextMenus) {
    chrome.contextMenus.create({
      id: 'save-page-content',
      title: 'Save Page Content',
      contexts: ['page']
    });
  }
});

if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'save-page-content' && tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'PARSE_PAGE' }).catch((err) => {
          console.warn('Could not send message to content script (maybe not loaded yet):', err);
      });
    }
  });
} else {
    console.warn('chrome.contextMenus API is not available.');
}

let isSidePanelOpen = false;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidepanel') {
    isSidePanelOpen = true;
    console.log('Side panel opened');
    port.onDisconnect.addListener(() => {
      isSidePanelOpen = false;
      console.log('Side panel closed');
    });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open_side_panel' || command === '_execute_side_panel') {
    if (isSidePanelOpen) {
      // Hack to close side panel: disable it momentarily
      // This forces the side panel to close
      // Note: This might close side panel for all tabs/windows
      await chrome.sidePanel.setOptions({ enabled: false });
      setTimeout(() => {
        chrome.sidePanel.setOptions({ enabled: true });
      }, 100);
    } else {
      chrome.windows.getCurrent((window) => {
        if (window && window.id) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          chrome.sidePanel.open({ windowId: window.id }).catch((error) => {
            console.error('Failed to open side panel:', error);
          });
        }
      });
    }
  }
});

