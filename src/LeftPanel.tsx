import React, {useEffect, useState} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./LeftPanel.css";

const LeftPanel: React.FC = () => {
    const [pdfList, setPdfList] = useState<string[]>([]);

    async function getPdfList() {
        const pdfList = await (invoke("file_list") as Promise<string[]>);
        console.log("pdfList:", pdfList);
        setPdfList(pdfList);
    }

    useEffect(() => {
        getPdfList();
    }, []); // 第二个参数为[], 表示只在组件挂载时调用一次

    return (
        <div className="LeftPanel">
            <h2>PDF File List</h2>
            <ul>
                {pdfList.map((pdfFileName) => (
                    <li key={pdfFileName}>{pdfFileName}</li>
                ))}
            </ul>
        </div>
    )
}

export default LeftPanel;