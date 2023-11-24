import type { PlasmoCSConfig } from "plasmo";
import { useMessage } from "@plasmohq/messaging/hook";
import type { PageData } from "~PageData";
import { MessageConstants, PrefillSupportedPagesUrlArray } from "~constants";
import toast, { Toaster, type Toast } from "react-hot-toast";

import styleText from "data-text:../style.css"
import type { PlasmoGetStyle } from "plasmo"
import { ApiUrl } from "~config";
 


export const config: PlasmoCSConfig = {
  matches: PrefillSupportedPagesUrlArray,
}

// exports the tailwind css styles
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

// todo: export to separate components
const successIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 17l-5-5.299 1.399-1.43 3.574 3.736 6.572-7.007 1.455 1.403-8 8.597z"/></svg>
const errorIcon = () => <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" width="24" height="24" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 8.933-2.721-2.722c-.146-.146-.339-.219-.531-.219-.404 0-.75.324-.75.749 0 .193.073.384.219.531l2.722 2.722-2.728 2.728c-.147.147-.22.34-.22.531 0 .427.35.75.751.75.192 0 .384-.073.53-.219l2.728-2.728 2.729 2.728c.146.146.338.219.53.219.401 0 .75-.323.75-.75 0-.191-.073-.384-.22-.531l-2.727-2.728 2.717-2.717c.146-.147.219-.338.219-.531 0-.425-.346-.75-.75-.75-.192 0-.385.073-.531.22z" fillRule="nonzero"/></svg>

const toastSuccess = (t?: Toast) => {
  return (
    <div className={`flex flex-row justify-center items-center gap-2 font-sans rounded-md w-40 p-3 z-40 shadow-lg ${t?.visible ? 'animate-enter' : 'animate-leave'}`} style={{background: "#EDFBD8"}}>
            
      <div className="w-5 h-5 mr-2 text-green-500 fill-green-500">
        {successIcon()}
      </div>

      <div className="text-sm text-green-800 font-medium">Saved Job</div>
    </div>
  );
}

const toastError = (error: string, t?: Toast) => {
  return (
    <div className={`flex flex-row justify-center items-center gap-2 font-sans rounded-md w-fit p-3 z-40 shadow-lg ${t?.visible ? 'animate-enter' : 'animate-leave'}`} style={{background: "#fbd8d8"}}>
            
      <div className="w-5 h-5 mr-2 text-red-500 fill-red-500">
        {errorIcon()}
      </div>

      <div className="text-sm text-red-800 font-medium">{error}</div>
    </div>
  );
}


const SaveJobShortcut = () => {
  
  useMessage<string, PageData>(async (req, res) => {
      if(req.name != MessageConstants.SAVE_JOB_SHORTCUT) {
        return;
      } 
      
      let msgJson = JSON.parse(req.body);
      
      
      try {
        
        const data = msgJson.data;
        const sheetId = msgJson.sheetId;

        if(data == null) {
          throw new Error();
        }

        if(sheetId == null || sheetId == "") {
          toast.custom((t) => toastError("Google Sheet not configured", t)); 
          return;
        }
        
        
        const body = JSON.stringify({
          ...data,
          sheetId
        });

        // encode the JSON body as a base64 string an use it as a query parameter on the api request
        // this is required as the content script doesn't seem to like making POST requests to the API
        const base64Body = btoa(body);
        const res = await fetch(`${ApiUrl}/job?d=${base64Body}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, *.*',
            'Content-Type': 'application/json; charset=utf-8'
          },
        });
        
        
        const json = await res.json();
        
        if(res.ok) {
          toast.custom((t) => toastSuccess(t)); 
        } else {
          toast.custom((t) => toastError(json.error ,t));
        }
        
      } catch(e) {
        toast.custom((t) => toastError("Page is not supported for auto job saving" ,t));
      }
      
  });
  
    return (
      <div >
        <Toaster />
        
        {/* uncomment to embed the toasts on the page, used to debug the design */}
        {/* <div className="absolute top-5 left-5">
          <div className="fixed top-0 left-0">
            {toastSuccess()}
            {toastError("Page is not supported for auto job saving")}
          </div>
          
        </div> */}
        
      </div>
    )
}


export default SaveJobShortcut