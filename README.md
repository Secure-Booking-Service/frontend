<div align="center">
    <img src="https://raw.githubusercontent.com/Secure-Booking-Service/frontend/master/logo.svg" alt="Code Icon by Bootstrap" width="100">
    <br>
    <h2>Secure Booking Service - Frontend</h2>
    <br>
</div>

[![Badge](https://img.shields.io/badge/project-Secure%20Booking%20Service-blue)](https://github.com/Secure-Booking)
[![SAST](https://github.com/Secure-Booking-Service/frontend/actions/workflows/SAST.yml/badge.svg)](https://github.com/Secure-Booking-Service/frontend/actions/workflows/SAST.yml)
[![Azure - CD](https://github.com/Secure-Booking-Service/frontend/actions/workflows/CD.yml/badge.svg)](https://github.com/Secure-Booking-Service/frontend/actions/workflows/CD.yml)

## 📁 Folder /src
This section explains the content of the important folder `/src`.

* `/overmind/*`: Contains multiple run-time "storage" classes build of overmind. These stores various information at run-time between each code execution.
* `/TerminalManager/index.ts`: The heart of the web application. Contains the source code the handles all user in- and output.
* `/TerminalManager/commands/*`: Each file represents a executable command.
* `/utils/ApiUtil.ts`: Class and instance to communicate with the backend application.

## 🧑‍💻 Development Setup
This section describes the development setup to run the web application locally.
Make sure that you have commit signing active for this repository `git config commit.gpgsign true`.

### Prerequisites ⚗️
> We have also setup a `.devcontainer`.  [Learn more](https://code.visualstudio.com/docs/remote/containers#_quick-start-open-an-existing-folder-in-a-container)

- Node with NPM installed (https://nodejs.org/en/download/)

### 📁 Installing modules
Run `npm ci` to install required node modules.

### 🛫 Start development
Run `npm start` at the root of the directory. Other available commands are
* `npm run preview`: Spawns a small http-server to serve the `dist` folder on port 8080
* `npm run build`: Compiles the current source code to a production ready version at `dist`

---
<div align="left">
    Icon by <a href="https://github.com/twbs/icons">Bootstrap</a> published under <a href="https://github.com/twbs/icons/blob/main/LICENSE.md">MIT licence</a>.
</div>