
import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import "../style.css";
import { Storage } from "@plasmohq/storage";
import toast, { Toaster } from "react-hot-toast";
import {TrashIcon} from "~icons/TrashIcon";
import { ApiUrl } from "~config";

const storage = new Storage();

type OptionsFormState =  {
    sheetUrl: string,
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
    const [validationMessage, setValidationMessage] = useState({error: "", success: ""});
    const [formState, setFormState] = useState<OptionsFormState>({
        sheetUrl: ""
    });

    function parseUrl(urlString: string) {
        
        if(urlString == "" || urlString == null) {
            return
        }
        // validate url
        try {
            let url = new URL(urlString);
            // validate that the host is google docs
            if(url.hostname !== "docs.google.com") {
                throw new Error("Only google sheets are supported");
            }
            // get the document id from the pathname
            let sections = url.pathname.split('/');
            if(sections.length >= 4) {
                setDocId(sections[3]);
            } else {
                throw new Error("Could not parse document id from url");
            }
            
        } catch(e) {
            setError(e.message);
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
            sheetUrl: ""
        });
        toast.success("Cleared Config");
    }

    useEffect(() => {
        // load existing data from storage
        async function loadFromStorage() {
            const sheet = await storage.get('sheet');
            const url = `https://docs.google.com/spreadsheets/d/${sheet}/`;
            parseUrl(sheet);
            setFormState({
                sheetUrl: sheet
            });   
        }

        loadFromStorage();
    }, []);
    

    const saveChanges = async (e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const body = {
            url: formState.sheetUrl
        };

        const res = await fetch(`${ApiUrl}/validate`, {
            method: 'POST',
            body: JSON.stringify(body)
        });

        const json = await res.json();

        if(res.ok) {
            setValidationMessage({success: json.message, error: null});
            await storage.set('sheet', json.sheetId)
                .then(() => toast.success(json.message))
                .catch((e) => {
                    toast.error("Failed to save config");
                    console.error("failed to save config: ", e);
                });
        } else {
            toast.error("Failed to validate google sheet");
            setValidationMessage({error: json.error, success: null});
        }
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
                                type="text" required placeholder="document url" id="sheetUrl" onChange={onDocUrlChange} value={formState.sheetUrl}
                            />

                            <>
                                {
                                    error != null ? <p className="text-red-500">{error}</p> : <></>
                                }
                                {
                                    docId !== "" ? <p className="text-xs italic">sheet id: {docId}</p> : <></>
                                }
                            </>
                        </div>
                        
                    
                        <button type="submit" className="bg-indigo-400 py-2 font-medium rounded-lg mt-3 hover:bg-indigo-600 hover:text-white">
                            Connect To Sheet
                        </button>
                        <div>
                            {validationMessage.error != null ? <p className="text-red-600">{validationMessage.error}</p> : null}
                            {validationMessage.success != null ? <p>{validationMessage.success}</p> : null}
                        </div>
                        
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
            <hr/>
            <h2 className="text-xl mt-3 mb-1">Connecting To The Sheet</h2>
            <ol className="list-decimal ml-5">
                <li>Share your Google sheet with the <code>jobsaverbot@jobsaver.iam.gserviceaccount.com</code> email</li>
                <li>Copy the url of the sheet shared with the service account to the "Google Sheets Url" field above</li>
                <li>Press the "Connect To Sheet" button</li>
                <li>If the document is shared with the account above then a new 'Application Tracker' sheet will be created</li>
            </ol>
            <hr />
            Once the sheet has been created <b>it's position and column headers should not be changed</b> otherwise adding jobs to the sheet will fail.
        </div>
    );
}

export default OptionsIndex;