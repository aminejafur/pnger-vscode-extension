# PNGER for Visual Studio Code

<div align="center">
  <br />
  <img width="40%" src="https://raw.githubusercontent.com/aminejafur/pnger-vscode-extension/main/assets/logo.png" alt="PNGER Logo" />

  PNGER is an extension to make images integration and background removal easier than ever !
  <br />
  <br />
</div>

## Table of Contents

* [What is PNER](#what-is-pnger)
* [How It Works](#how-it-works)
* [Demo](#demo)
* [Settings](#settings)
* [Important Notes](#important)
* [Version](#version-001)
* [Quick Start](#quick-start)
* [More Info](#know-more-)
* [Licensing](#license)

## What is PNGER

PNGER started as a Weekend Project to write my first VScode extension and understand the concepts for building extensions.<br>
It's idea is to make it easier for designers to integrate images directly from their cameras to their projects with a background removal feature using two options :
1. Using `remove.bg` API.
2. Native background removal using a `green screen`.   

## How it works

To achieve this, the extension will provide a local server that can be reached from phones, tablets, or computers with a camera, this server will contain an easy to use web app which will help in :

1. Taking a picture of the Object, Product, or Person in the desired dimension.
2. Automatically remove the picture background.
3. Define a name and location for the new image.
4. Once the name and the location are set, VScode will save the image and will automatically update the HTML img tag source property.`(you have to move your text cursor indicator to the src property)`

```html
..
...
    <img src="#this_will_get_updated"...>
...
..
```

## Demo

<img width="100%" src="https://raw.githubusercontent.com/aminejafur/pnger-vscode-extension/main/assets/full_demo.gif">

more [demos.](https://github.com/aminejafur/pnger-vscode-extension/tree/main/assets)

## SETTINGS

PNGER settings are :

Name         | Description | Type | Default
------------ | -------------| -------------| -------------
`Folders`         | PNGER will look for mentioned names in root folder and subfolders to provide them as options to save your image on, provide more seperated by  | Comma separated string | `img,images,assets`
`Remove.bg Api `        | The `remove.bg` API key that will be used, you can get one from [Remove.bg](https://remove.bg) | String | `null`
`Process Location` | (`#TODO`) Where to run the background removal process | Select of vscode or phone | `phone`

## IMPORTANT

After starting PNGER you will face the following issues : 

Issue        | Solution
------------ | -------------
`You may not be able to access the served host in LAN` | If you are facing this issue you will have to allow NodeJS hosts over LAN using these steps (windows) :<br>1. Go to windows button. <br>2. Search "Firewall". <br>3. Choose "Allow programs to communicate through Firewall". <br>4. Click Change Setup. <br>5. Tick all of "Evented I/O for V8 Javascript" OR "Node.js: Server-side Javascript". <br> [Know more.](https://docs.profoundlogic.com/display/PUI/Allowing+Connections+in+Windows+Firewall)
`PNGER won't be able to access your camera` | This is because camera is only allowed via HTTPS, therefore you will need to add the host as a trusted host, to do this follow the instructions in the home page, or [follow this](https://medium.com/@Carmichaelize/enabling-the-microphone-camera-in-chrome-for-local-unsecure-origins-9c90c3149339).

## Version 0.0.1

* Release date: 07-02-2021

Please refer to the `CHANGELOG` for more informations.


## Quick start

Start with :

`git clone https://github.com/aminejafur/pnger-vscode-extension.git`

...more info...

# Know more :

<!-- ## Code source -->

Github : [https://github.com/aminejafur/pnger-vscode-extension](https://github.com/aminejafur/pnger-vscode-extension)

<!-- ## My email :  -->

Email : [amine.jafur@gmail.com](mailto:amine.jafur@gmail.com?subject=[GitHub]%20PNGER)

## API

[https://www.remove.bg/](https://www.remove.bg/)

## License
This extension is licensed under the MIT License.

### Star the repo to support the project :star:
### Feel free to fork, open pull requests and play around. Thanks! :heart:
