import React, {useEffect, useState} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';
import "./LeftPanel.css";

const LeftPanel: React.FC = () => {
    // define the pdfList type
    interface PdfItem {
        id: number;
        path: string;
    }
    const [pdfList, setPdfList] = useState<PdfItem[]>([]);

    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

    const handlePdfClick = (pdfFileName: string) => {
        if (selectedPdf === pdfFileName) {
            setSelectedPdf(null);
            return;
        }
        setSelectedPdf(pdfFileName);
    };

    async function getPdfList() {
        const pdfList = await (invoke("file_list") as Promise<PdfItem[]>);
        console.log("pdfList:", pdfList);
        setPdfList(pdfList);
    }

    useEffect(() => {
        getPdfList();
    }, []); // 第二个参数为[], 表示只在组件挂载时调用一次

    const AddPdf = async () => {
        try {
            const selectedPath = await open({
                multiple: false,
                filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
            });
            console.log(selectedPath);
            if (!selectedPath) {
                console.log("No file selected");
                return;
            }
            invoke("file_add", {path: selectedPath}).then((size) => {
                if (typeof size === 'number' && size > 0) {
                    getPdfList();
                } else {
                    console.log("no new record added");
                }
            });
            // revokeUrl(); // close previous pdf file
            // // const selectedPath = selectedPaths[0];
            // console.log("Selected file path:", selectedPath);
            // const content = await readBinaryFile(selectedPath as string);
            // const blob = new Blob([content], { type: 'application/pdf' });
            // const dataUrl = URL.createObjectURL(blob);
            // setPdfUrl(dataUrl);
            // setPdfContent(content);
        } catch (error) {
            console.error('Error selecting or reading the file:', error);
        }
    }

    return (
        <div className="LeftPanel">
            <h2>PDF File List</h2>
            <button onClick={AddPdf}>+</button>
            <ul>
                {pdfList.map((item) => (
                    <li
                        key={item.id}
                        onClick={() => handlePdfClick(item.path)}
                        className={selectedPdf === item.path ? 'selected' : ''}
                    >
                        {item.path.split("/").pop()}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default LeftPanel;