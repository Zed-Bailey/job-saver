# Job saver

This is a browser extension i created to speed up saving jobs from multiple job boards

Currently the extension connects to a google sheet via a service account that has to be created.
In the future this would ideally be done through oauth so the user doesn't have to create a google cloud project and generate the keys for the service account


The project has been built using React, TailwindCSS and the [Plasmo](https://docs.plasmo.com/) framework

## Configuration


## Development

First, run the development server:

```bash
npm run dev
```
To load the extension into the browser fro development see [Loading the extension into chrome](https://docs.plasmo.com/framework#loading-the-extension-in-chrome)


## Making production build

Run the following:

```bash
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.
