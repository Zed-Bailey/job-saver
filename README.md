# Job saver

This is a browser extension i created to automate saving jobs from a job board to a google spreadsheet

When opening the extension on a job listing, the extension will try to scrape the page for the role, company and job url to prefill form inputs

Currently the extension connects to a google sheet via a service account that has to be created.
In the future this would ideally be done through oauth so the user doesn't have to create a google cloud project and generate the keys for the service account


The project has been built using React, TailwindCSS and the [Plasmo framework](https://docs.plasmo.com/) 

## Configuration
To configure the key for the service account and the google sheets url, follow the instructions on the extensions options page

## Development

First, run the development server:

```bash
npm run dev
```
To load the extension into the browser for development see [Loading the extension into chrome](https://docs.plasmo.com/framework#loading-the-extension-in-chrome)


## Making production build

Run the following:

```bash
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.
