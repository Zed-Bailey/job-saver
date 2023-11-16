
import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import "../style.css";
import { Storage } from "@plasmohq/storage";
import toast, { Toaster } from "react-hot-toast";
import {TrashIcon} from "~icons/TrashIcon";

const storage = new Storage();

type OptionsFormState =  {
    sheetUrl: string,
    jsonKey: string
};

const jsonKeyPlaceholder = `JSON key should look similar to the following
{
    "type": "service_account",
    "project_id": "",
    "private_key_id": "",
    "private_key": "",
    "client_email": "",
    "client_id": "",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "",
    "universe_domain": "googleapis.com"
}`;

function OptionsIndex() {
    const [docId, setDocId] = useState("");
    const [error, setError] = useState<null | string>(null);
    const [jsonError, setJsonError] = useState<string>("");
    const [formState, setFormState] = useState<OptionsFormState>({
        jsonKey: "",
        sheetUrl: ""
    });

    function parseUrl(urlString) {
        // validate url
        try {
            let url = new URL(urlString);
            // validate that the host is google docs
            if(url.hostname !== "docs.google.com") {
                setError("Only google sheets are supported");
                return;
            }
            // get the document id from the pathname
            let sections = url.pathname.split('/');
            if(sections.length >= 4) {
                setDocId(sections[3]);
            } else {
                setError("Could not parse document id from url");
            }
            
        } catch(e) {
            setError("Invalid url");
        }
    }

    const onDocUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setFormState({ ...formState, sheetUrl: e.target.value });
        parseUrl(e.target.value);
        
    }

    const clearFields = async () => {
        await storage.removeAll();
        setFormState({
            jsonKey: "",
            sheetUrl: ""
        });
        toast.success("Cleared Config");
    }

    useEffect(() => {
        // load existing data from storage
        async function loadFromStorage() {
            const key = await storage.get('jsonKey');
            const sheet = await storage.get('sheet');
            parseUrl(sheet);
            setFormState({
                jsonKey: key,
                sheetUrl: sheet
            });
            
        }

        loadFromStorage();
    }, []);
    

    const saveChanges = async (e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setJsonError("");

        if(error != null) {
            return;
        }

        // parse the json to check if it's valid
        try {
            let json = JSON.parse(formState.jsonKey);
            if(json.client_email == null) {
                setJsonError("missing required field 'client_email'");
                return;
            }

            if(json.private_key == null) {
                setJsonError( "missing required field 'private_key'");
                return;
            }
            
        } catch(e) {
            setJsonError("Json key could not be parsed");
            return;
        }

        await storage.set('jsonKey', formState.jsonKey);
        await storage.set('sheet', formState.sheetUrl);
        toast.success("Saved Config");

    }

    return(
        <div>

            <Toaster />
            <div className="flex justify-center my-5">
                <div className="max-w-md w-full items-center">
                    <h1 className="text-2xl">Configure job saver</h1>
                    <hr className="mt-1 mb-3"/>
                    <form className="flex flex-col w-full" onSubmit={saveChanges}>
                        
                        <div className="w-full mb-3">
                            <label htmlFor="sheetUrl">Google Sheets Url</label>
                            <input 
                            className="w-full p-2 rounded-md border"
                            type="text" required placeholder="document url" id="sheetUrl" onChange={onDocUrlChange} value={formState.sheetUrl}/>
                            <>
                                {
                                    error != null ? <p className="text-red-500">{error}</p> : <></>
                                }
                                {
                                    docId !== "" ? <p className="text-xs italic">sheet id: {docId}</p> : <></>
                                }
                            </>
                        </div>
                        
                        <div className="w-full">
                            <label htmlFor="jsonKey">JSON Key</label>
                            <textarea placeholder={jsonKeyPlaceholder} required 
                                id="jsonKey"
                                className="h-52 w-full p-2 border rounded-lg"
                                onChange={(e) => {
                                    setFormState({ ...formState, jsonKey: e.target.value });
                                }}
                                value={formState.jsonKey}
                            >    
                            </textarea>
                            <>
                            {
                                jsonError != "" ? <p className="text-red-500">{jsonError}</p> : null
                            }
                            </>
                        </div>
                        

                        <button type="submit" className="bg-blue-200 py-2 font-medium rounded-lg mt-3 hover:bg-blue-600 hover:text-white">
                            Save
                        </button>
                        
                    </form>

                 
                    
                    <hr className="my-3"/>
                    <SetupInformation />

                    <hr className="mt-4 mb-2"/>
                    <div className="w-full border-2 border-red-500 rounded-lg p-2">
                        <h2 className="text-lg text-red-600 font-bold tracking-wider">DANGER!</h2>
                        <button className="flex justify-center items-center gap-2 w-full hover:bg-red-500 p-2 rounded-lg mt-3 text-red-500 hover:text-white font-medium" onClick={clearFields}>
                            <TrashIcon className="w-5 h-5 "/>
                            Clear Config
                        </button>
                    </div>
                    
                </div>
                
            </div>
        </div>
    );
}

function SetupInformation() {
    return(
        <div className="w-full">
            <h1 className="text-2xl">Setup</h1>
            
            <h2 className="text-xl mt-2">Creating A Google Cloud Project</h2>
            <ol className="list-decimal ml-5">
                <li>Go to the Google Developers Console</li>
                <li>Create a new project and select it</li>
                <li>select "Enabled APIs & Services"</li>
                <li>Search for "sheets"</li>
                <li>Click on "Google Sheets API"</li>
                <li>Click the blue "Enable" button</li>
            </ol>

    
            <h2 className="text-xl mt-3">Creating A Service Account</h2>
            <ol className="list-decimal ml-5">
                <li>In the sidebar on the left, select "APIs & Services" then "Credentials"</li>
                <li>Click blue "+ CREATE CREDENTIALS" and select "Service account" option</li>
                <li>Enter name, description, click "CREATE"</li>
                <li>skip permissions and click "CONTINUE"</li>
                <li>Click "+ CREATE KEY" button</li>
                <li>Select the "JSON" key type option</li>
                <li>Click the "Create" button</li>
                <li>The JSON key file is generated and downloaded</li>
                <li>click "DONE"</li>
                <li>note your service account's email address</li>

                <li>Share the sheet document to use with this extension with your service account using the email noted above</li>
            </ol>


            <h2 className="text-xl mt-3">Connecting To The Sheet</h2>
            <ol className="list-decimal ml-5">
                <li>Copy the url of the sheet shared with the service account to the "Google Sheets Url" field above</li>
                <li>Ensure the sheet has columns with the following headers: "company", "role", "url"</li>
                <li>Copy the contents of the JSON key file downloaded from "Creating A Service Account" into the "JSON Key" field above</li>
                <li>Press the "Save" button</li>
            </ol>
        </div>
    );
}

export default OptionsIndex;