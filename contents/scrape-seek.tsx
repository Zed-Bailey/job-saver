import type { PlasmoCSConfig } from "plasmo"

import { useMessage } from "@plasmohq/messaging/hook"
import type { PageData } from "~PageData";


export const config: PlasmoCSConfig = {
  matches: ["https://seek.com.au/*"],
  all_frames: true,  
}

const scrapeUrl = () => {
  let location = window.location.href
  
  return location;
}


const scrapeJobTitle = () => {
  let ele = document.querySelector("[data-automation='job-detail-title']");
  let text = ele.innerText;
  return text;
}


const scrapeCompany = () => {
  let ele =  document.querySelector("[data-automation='advertiser-name']");
  let text = ele.innerText;
  return text;
}


const ScrapeSeekPage = () => {
    useMessage<string, PageData>(async (req, res) => {
        res.send({
          company: scrapeCompany(),
          role: scrapeJobTitle(),
          url: scrapeUrl()
        });
    });
}


export default ScrapeSeekPage;