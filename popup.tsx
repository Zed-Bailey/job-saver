import { useEffect, useState, type FormEvent, type ChangeEvent } from "react"
import { JWT } from 'google-auth-library'

import { GoogleSpreadsheet } from "google-spreadsheet";

import { sendToContentScript } from "@plasmohq/messaging";
import type { PageData } from "~PageData";

import "./style.css"
import { Storage } from "@plasmohq/storage";
import { SettingsIcon } from "~icons/SettingsIcon";
import { SheetIcon } from "~icons/SheetIcon";

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];





const storage = new Storage();

function IndexPopup() {
  const [docId, setDocId] = useState("");
  const [googleDoc, setGoogleDoc] = useState<null | GoogleSpreadsheet>(null);
  const [jwtToken, setJwtToken] = useState<null | JWT>(null);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [formState, setFormState] = useState<PageData>({
    url: "",
    company: "",
    role: ""
  });

  async function addNewJob(data: PageData) {
    await googleDoc.loadInfo();
    console.log(googleDoc.title);
    await googleDoc.sheetsByIndex[0].addRow({
      company: data.company,
      role: data.role,
      url: data.url
    });
  
  }

  async function parsePageForDetails() {
    try {
      const res: PageData = await sendToContentScript({ name: "scrape-page" });
      console.log(res);
      setFormState({
        company: res.company,
        role: res.role,
        url: res.url
      });
    } catch(e) {
      console.log("Page not supported");
    }
    
  }

  async function loadConfigFromStorage() {
    const key = await storage.get('jsonKey');
    const sheet = await storage.get('sheet');
    let jsonKey: any;
    
    try {
      jsonKey = JSON.parse(key);
    } catch(e) {
      setErrors([...errors, 'Failed to parse JSON key. Update config in extension options page']);
      return;
    }

    let token = new JWT({
      email: jsonKey.client_email,
      key: jsonKey.private_key,
      scopes: SCOPES,
    });

    setJwtToken(token);
    
    try {
      let url = new URL(sheet);
      if(url.hostname !== "docs.google.com") {
        setErrors([...errors, "Only google sheets are supported"]);
        return;
      }
      let sections = url.pathname.split('/');
      if(sections.length >= 4) {
        setGoogleDoc(new GoogleSpreadsheet(sections[3], token));
        setDocId(sections[3]);
        
      } else {
        setErrors([...errors, "Could not parse document id from url"]);
      }
      
    } catch(e) {
      setErrors([...errors, "Invalid url"]);
    }
  }


  useEffect(() => {
    
    loadConfigFromStorage();

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
  
  console.log(errors);
  return (
    <div className="w-64 py-3">
      <h2 className="text-center text-lg">Job Save-I-nator</h2>
      
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <FormField id={"role"} placeholder={"Role"} value={formState.role} onFieldChange={onFieldChange} label={"Job Role"}/>
        <FormField id={"company"} placeholder={"Company"} value={formState.company} onFieldChange={onFieldChange} label={"Company"}/>
        <FormField id={"url"} placeholder={"Job Url"} value={formState.url} onFieldChange={onFieldChange} label={"Job Url"}/>
        
        <button type="submit"
         disabled={errors.length != 0}
         className="rounded-lg hover:bg-blue-500 hover:text-white font-bold p-2 mx-2"
        >
          Save Job
        </button>
      </form>
      

      <ul className="text-red-500">
         { errors.map((value, index) => <li key={index}>{value}</li>) }
      </ul>

    <div className="w-full flex flex-row items-center justify-evenly mt-2">
      <a
        href={`https://docs.google.com/spreadsheets/d/${docId}/edit#gid=0`}
        target="_blank"
        rel="noreferrer"
        className="flex justify-center items-center gap-2 p-2 rounded-lg hover:bg-gray-100 font-medium"
      >
        <SheetIcon className={"w-5 h-5"}/>
        View Sheet
      </a>

      <button onClick={() => {
        if(process.env.PLASMO_BROWSER == 'firefox') {
          browser.runtime.openOptionsPage();
        } else {
          chrome.runtime.openOptionsPage();
        }
      }}
      className="flex justify-center items-center gap-2 p-2 rounded-lg hover:bg-gray-100 font-medium"
      >
         <SettingsIcon className="w-5 h-5"/>
         options panel
      </button>
    </div>
      
    </div>
  )
}

function FormField({placeholder, value, id, required=true, onFieldChange, label}) {
  return (
    <div className="flex flex-col m-1">
      <label htmlFor={id}>{label}</label>
      <input
        className="p-2 border rounded-lg"
        required={required} 
        type="text" 
        placeholder={placeholder}
        id={id}
        onChange={onFieldChange}
        value={value}
        autoComplete="off"
      />
    </div>
    
  );
}

export default IndexPopup
