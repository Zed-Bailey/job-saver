import { useEffect, useState, type FormEvent, type ChangeEvent } from "react"

import { sendToContentScript } from "@plasmohq/messaging";
import type { PageData } from "~PageData";

import "./style.css"
import { Storage } from "@plasmohq/storage";
import { SettingsIcon } from "~icons/SettingsIcon";
import { SheetIcon } from "~icons/SheetIcon";
import toast, { Toaster } from "react-hot-toast";
import { ApiUrl } from "~config";
import { MessageConstants } from "~message-constants";


const storage = new Storage();

function IndexPopup() {
  const [docId, setDocId] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);


  const [formState, setFormState] = useState<PageData>({
    url: "",
    company: "",
    role: ""
  });

  async function addNewJob(data: PageData) {
    setIsSaving(true);
    
    const body = {
      ...data,
      sheetId: docId
    };

    const res = await fetch(`${ApiUrl}/job`, {
        body: JSON.stringify(body),
        method: "POST"
    });

    const json = await res.json();
    if(res.ok) {
      toast.success(json.message);
    } else {
      toast.error("Failed to save the job");
    }
    
    
    
    setIsSaving(false);
    
    
  }

  async function parsePageForDetails() {
    try {
      const res: PageData = await sendToContentScript({ name: MessageConstants.SCRAPE_PAGE });
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

    const sheet = await storage.get('sheet');

    if(sheet == null || sheet == "") {
      setErrors([...errors, "Google Sheet not configured"]);
    } else {
      setDocId(sheet);
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
  
  
  return (
    <div className="w-fit m-3">
      <Toaster/>
      <h2 className="text-center text-lg">Job Save-in-ator</h2>
      
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <FormField id={"role"} placeholder={"Role"} value={formState.role} onFieldChange={onFieldChange} label={"Job Role"}/>
        <FormField id={"company"} placeholder={"Company"} value={formState.company} onFieldChange={onFieldChange} label={"Company"}/>
        <FormField id={"url"} placeholder={"Job Url"} value={formState.url} onFieldChange={onFieldChange} label={"Job Url"}/>
        
        <button type="submit"
         disabled={errors.length != 0}
         className="rounded-lg hover:bg-indigo-500 bg-indigo-400 text-white font-bold p-2 flex justify-center items-center"
        >
          { isSaving ? 
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            : null
          }
          {isSaving ? "Saving..." : "Save Job"}
          
        </button>
      </form>
      

      <ul className="text-red-500 w-72 mt-2">
         { errors.map((value, index) => <li key={index} className="">{value}</li> ) }
      </ul>

    <div className="w-full flex flex-row items-center justify-evenly mt-2 px-1">
      <a
        onClick={(e) => {
          if(docId == "") {
            e.preventDefault();
            toast.error("Sheet not configured")
          }
        }}
        href={`https://docs.google.com/spreadsheets/d/${docId}/edit#gid=0`}
        target="_blank"
        rel="noreferrer"
        className="flex justify-center items-center gap-2 p-2 rounded-lg hover:bg-gray-100 font-medium min-w-fit text-slate-500 hover:text-slate-800"
        
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
      className="flex justify-center items-center gap-2 p-2 rounded-lg hover:bg-gray-100 font-medium min-w-fit text-slate-500 hover:text-slate-800"
      >
         <SettingsIcon className="w-5 h-5"/>
         Options Panel
      </button>
    </div>
    <div className="w-full flex justify-center mt-2">
      <a 
        target="_blank"
        rel="noreferrer"
        href="https://github.com/Zed-Bailey/job-saver" className="hover:underline text-sm"
      >
        Project Github
      </a>
    </div>
      
    </div>
  )
}

function FormField({placeholder, value, id, required=true, onFieldChange, label}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-xs">{label}</label>
      <input
        className="p-2 border rounded-lg w-72"
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
