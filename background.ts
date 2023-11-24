import { sendToContentScript } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import type { PageData } from "~PageData";
import { MessageConstants } from "~message-constants";


export {}

chrome.commands.onCommand.addListener(async (command) => {
    // listen for the save job command triggered by the keybord shortcut    
    if(command == 'save-job') {
        let sheetId: string;
        let data: PageData | null = null;

        try {
            const storage = new Storage();
            sheetId = await storage.getItem("sheet");
            // scrape the page
            data = await sendToContentScript({name: MessageConstants.SCRAPE_PAGE});
        } catch(e) {
            console.error("JobSaver :: Error ",e);
        }

        await sendToContentScript({ name: MessageConstants.SAVE_JOB_SHORTCUT, body: JSON.stringify({sheetId: sheetId, data: data}) });
    }
});

