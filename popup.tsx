import { useEffect, useState, type FormEvent, type ChangeEvent } from "react"
import { JWT } from 'google-auth-library'

import creds from './jobsaver.json'; // the file saved above
import { GoogleSpreadsheet } from "google-spreadsheet";

import { sendToContentScript } from "@plasmohq/messaging";
import type { PageData } from "~PageData";

import "./style.css"

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const jwt = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: SCOPES,
});

const DOC_ID = "11SyNP-qPT9OWWhhHoz9jucgJeoMhp9mdPb9jTkvSGyc";

const doc = new GoogleSpreadsheet(DOC_ID, jwt);

async function addNewJob(data: PageData) {
  await doc.loadInfo();
  console.log(doc.title);
  await doc.sheetsByIndex[0].addRow({
    company: data.company,
    role: data.role,
    url: data.url
  });

}



function IndexPopup() {
  
  const [formState, setFormState] = useState<PageData>({
    url: "",
    company: "",
    role: ""
  });

  async function parsePageForDetails() {
    const res: PageData = await sendToContentScript({ name: "scrape-page" });
    setFormState({
      company: res.company,
      role: res.role,
      url: res.url
    });
  }


  useEffect(() => {
    parsePageForDetails();
  }, []);
  
  const onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value; 
    setFormState({ ...formState, [event.target.id]: value });
  };
  

  const onSubmit = (form: FormEvent<HTMLFormElement>) => {
    form.preventDefault();
    console.log(formState);
    addNewJob(formState);
  }
  

  return (
    <div style={{
      width: 250
    }}>
      <h2>Job Save-i-nator</h2>
      
      <form onSubmit={onSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: 5
      }}>
        <input required type="text" placeholder="role" id="role" onChange={onFieldChange} autoComplete="off" value={formState.role}/>
        <input required type="text" placeholder="company" id="company" onChange={onFieldChange} autoComplete="off" value={formState.company}/>
        <input required type="text" placeholder="url" id="url" onChange={onFieldChange} value={formState.url} autoComplete="off"/>
        <button type="submit">add</button>
      </form>
    </div>
  )
}

export default IndexPopup
