import { sendToContentScript } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import type { PageData } from "~PageData";
import { MessageConstants } from "~constants";

// background service worker

export {}

// register a command listener
chrome.commands.onCommand.addListener(async (command) => {
    // listen for the save job command triggered by the keybord shortcut    
    if(command == 'save-job') {
        let sheetId: string;
        let data: PageData | null = null;

        try {
            // fetch the sheet id from the service worker as you cant use the storage api ina content script
            const storage = new Storage();
            sheetId = await storage.getItem("sheet");
            
            // get the job data from the page
            data = await sendToContentScript({name: MessageConstants.SCRAPE_PAGE});
        } catch(e) {
            console.error(e);
        }

        await sendToContentScript({ name: MessageConstants.SAVE_JOB_SHORTCUT, body: JSON.stringify({sheetId: sheetId, data: data}) });
    }
});

