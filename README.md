# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Project Development Log
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
```shell
yarn add react-pdf
```
注意，react-pdf的[Document](https://www.npmjs.com/package/react-pdf)的file参数，可以选择data(Uint8Array类型)，并使用tauri的dialog/open api，要使用[dialog](https://tauri.app/v1/api/js/dialog)的功能，需要在tauri.conf.json中增加allows，限制tauri app对本机的访问权限。
```json
  "tauri": {
    "dialog": {
        "open": true
      },
      "fs": {
        "readFile": true,
        "scope": ["$DESKTOP/*"]
      }
  }
```

**2023.11.23**

react useEffect
第二个参数为``[]``时，只在组件挂载时调用一次

flex布局，默认布局方式``flex-direction: row``


**2023.11.25**
选取sqlite作为数据库存储，用
Files表，包含已经被映射的文件路径
id: 主键，自增
path: 文件绝对路径
