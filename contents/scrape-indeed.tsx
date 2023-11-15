import type { PlasmoCSConfig } from "plasmo"

import { useMessage } from "@plasmohq/messaging/hook"
import type { PageData } from "~PageData";


export const config: PlasmoCSConfig = {
  matches: ["https://au.indeed.com/*"],
  all_frames: true,  
}

const scrapeUrl = () => {
  let location = window.location.href
  let url = new URL(location);
  let sections = url.pathname.split('/');
  
  if(sections[1] !== "viewjob") {
    let key = url.search.replace("?vjk=", "");
    return `${url.origin}/viewjob?jk=${key}`;
  }

  return url.toString();
}
const scrapeJobTitle = () => {
  let ele = document.querySelector("[class*='-title-container']");
  let text = ele.textContent;
  return text;
}

const scrapeCompany = () => {
  let ele = document.querySelector("[data-company-name='true']")
  let text = ele.textContent;
  return text;
}

const ScrapePage = () => {
    useMessage<string, PageData>(async (req, res) => {
        res.send({
          company: scrapeCompany(),
          role: scrapeJobTitle(),
          url: scrapeUrl()
        });
    });
}


export default ScrapePage;