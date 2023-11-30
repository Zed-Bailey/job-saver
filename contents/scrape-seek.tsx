import type { PlasmoCSConfig } from "plasmo"

import { useMessage } from "@plasmohq/messaging/hook"
import type { PageData } from "~PageData";
import { MessageConstants } from "~constants";


export const config: PlasmoCSConfig = {
  matches: ["https://www.seek.com.au/*"],
  all_frames: true,  
}

const scrapeUrl = () => {
  let location = window.location.href
  
  return location;
}


const scrapeJobTitle = () => {
  let ele = document.querySelector("[data-automation='job-detail-title']");
  let text = ele.textContent;
  return text;
}


const scrapeCompany = () => {
  let ele =  document.querySelector("[data-automation='advertiser-name']");
  let text = ele.textContent;
  return text;
}


const ScrapeSeekPage = () => {
  useMessage<string, PageData>(async (req, res) => {
    if(req.name == MessageConstants.SCRAPE_PAGE) {
      res.send({
        company: scrapeCompany(),
        role: scrapeJobTitle(),
        url: scrapeUrl()
      });
    }
  });
}


export default ScrapeSeekPage;