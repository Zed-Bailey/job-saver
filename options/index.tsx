
import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import "../style.css";
import { Storage } from "@plasmohq/storage";
import toast, { Toaster } from "react-hot-toast";

const storage = new Storage();

type OptionsFormState =  {
    sheetUrl: string,
    jsonKey: string
};

const jsonKeyPlaceholder = `{
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

    const onDocUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setFormState({ ...formState, sheetUrl: e.target.value });

        try {
            let url = new URL(e.target.value);
            if(url.hostname !== "docs.google.com") {
                setError("Only google sheets are supported");
                return;
            }
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

    const clearFields = async () => {
        await storage.removeAll();
        setFormState({
            jsonKey: "",
            sheetUrl: ""
        });
        toast.success("Cleared Config");
    }

    useEffect(() => {
        async function loadFromStorage() {
            const key = await storage.get('jsonKey');
            const sheet = await storage.get('sheet');

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
            <div className="flex justify-center">
                <div className="max-w-xs w-full items-center">
                    <h1 className="text-lg">Configure job saver</h1>
                    <form className="flex flex-col w-full" onSubmit={saveChanges}>
                        
                        <div className="w-full mb-3">
                            <label htmlFor="sheetUrl">Url of sheet</label>
                            <input 
                            className="w-full p-2 rounded-md border"
                            type="text" required placeholder="document url" id="sheetUrl" onChange={onDocUrlChange} value={formState.sheetUrl}/>
                            <>
                                {
                                    error != null ? <p className="text-red-500">{error}</p> : <></>
                                }
                                {
                                    docId !== "" ? <p>sheet id: {docId}</p> : <></>
                                }
                            </>
                        </div>
                        
                        <div className="w-full">
                            <label htmlFor="jsonKey">JSON Key</label>
                            <textarea placeholder={jsonKeyPlaceholder} required 
                                id="jsonKey"
                                className="h-52 w-full p-2"
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

                    <button className="hover:bg-red-500 p-2 rounded-lg mt-3 hover:text-white font-medium" onClick={clearFields}>
                            clear config
                        </button>
                </div>
            </div>
        </div>
    );
}



export default OptionsIndex;