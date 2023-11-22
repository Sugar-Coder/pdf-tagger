# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Project Development
Install build tools:
```shell
npm install -g corepack
corepack enable
cd /path/to/dir/
yarn create tauri-app
# selecting react as UI framework(typescript), yarn as package manager
yarn tauri dev # build and start project
```

Using react-pdf as viewer

注意，react-pdf的[Document](https://www.npmjs.com/package/react-pdf)的file参数，可以选择data(Uint8Array类型)，并使用tauri的dialog/open api，要使用[dialog](https://tauri.app/v1/api/js/dialog)的功能，需要在tauri.conf.json中增加allows