import { browser } from 'webextension-polyfill-ts'

browser.webNavigation.onCompleted.addListener(details => {
    browser.tabs.sendMessage(details.tabId, { url: details.url })
})

browser.webNavigation.onHistoryStateUpdated.addListener(details => {
    browser.tabs.sendMessage(details.tabId, { url: details.url })
})