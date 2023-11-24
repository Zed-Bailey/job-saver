import type { PlasmoCSConfig } from "plasmo"

import { useMessage } from "@plasmohq/messaging/hook"
import type { PageData } from "~PageData";
import { MessageConstants } from "~message-constants";


export const config: PlasmoCSConfig = {
  matches: ["https://www.linkedin.com/*"],
  all_frames: true,  
}

const scrapeUrl = () => {
  let location = window.location.href
  
  return location;
}


const scrapeJobTitle = () => {
  let ele = document.querySelector("[class*='top-card__job-title']");
  let text = ele.textContent;

  return text.trim();
}


const scrapeCompany = () => {
  let ele = document.querySelector("div[class*='top-card__primary-description'] a");
  let text = ele.textContent;

  return text.trim();
}


const ScrapeLinkedinPage = () => {
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


export default ScrapeLinkedinPage;