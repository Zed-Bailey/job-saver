
/**
 * Message name constants used when sending messages to the content scripts
 */
export const MessageConstants = {
    SCRAPE_PAGE: "scrape-page",
    SAVE_JOB_SHORTCUT: "save-job-shortcut",
};

/**
 * An object containing the name and url of the sites supported by prefill
 */
export const PrefillSupportedPages = {
    linkedin: "https://www.linkedin.com/*",
    seek: "https://www.seek.com.au/*",
    indeed: "https://au.indeed.com/*"
};


/**
 * An array of urls that are supported by the prefill, used by the quick save shortcut
 */
export const PrefillSupportedPagesUrlArray = Object.keys(PrefillSupportedPages).map(key => PrefillSupportedPages[key]);
