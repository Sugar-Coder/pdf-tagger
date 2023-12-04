# Project Development Log
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

选取sqlite作为数据库存储，用``cargo add rusqlite``.
sqlite数据库文件（开发用）放在根目录下``data/dev.db``

创建Files表，包含已经被映射的文件路径
id: 主键，自增
path: 文件绝对路径

在LeftPanel中展示数据库中已有的文件（路径）
后端command返回的类型要实现Serialize trait
```rust
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Files {
    pub id: i32,
    pub path: String,
}
```
前端调用revoke的时候，需要定义接收的类型，类型成员与后端定义一致
```tsx
interface PdfItem {
    id: number;
    path: string;
}
const [pdfList, setPdfList] = useState<PdfItem[]>([]);

async function getPdfList() {
    const pdfList = await (invoke("file_list") as Promise<PdfItem[]>);
    console.log("pdfList:", pdfList);
    setPdfList(pdfList);
}
```

**2023.11.29**
实现右键pdf列表，显示删除菜单，删除已经加载到数据库的条目
根据file的id删除记录
右键单击侧边栏项目的时候，出现菜单，显示可选删除项目
LeftPanel.tsx中增加一个ContextMenu的react状态，保存被右键点击的菜单出现位置和被选中的文件项

当打开右键菜单后，点击页面的其他地方，关闭右键菜单，实现``handleClickOutside``
如果你想在handleClickOutside函数中检查点击事件是否发生在右键菜单之外，你需要一个引用来访问右键菜单的DOM元素，这就是contextMenuRef的作用。你不能直接使用contextMenu来代替contextMenuRef，因为contextMenu并不是一个DOM元素的引用。

点击右键菜单删除后，提升弹窗确认，在tauri.conf.json中增加allow