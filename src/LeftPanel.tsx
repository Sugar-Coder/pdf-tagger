import React, {useEffect, useState} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./LeftPanel.css";

const LeftPanel: React.FC = () => {
    // define the pdfList type
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

    useEffect(() => {
        getPdfList();
    }, []); // 第二个参数为[], 表示只在组件挂载时调用一次

    const AddPdf = async () => {
        console.log("AddPdf");
    }

    return (
        <div className="LeftPanel">
            <h2>PDF File List</h2>
            <button onClick={AddPdf}>+</button>
            <ul>
                {pdfList.map((pdfFileName) => (
                    <li key={pdfFileName.id}>{pdfFileName.path.split("/").pop()}</li>
                ))}
            </ul>
        </div>
    )
}

export default LeftPanel;