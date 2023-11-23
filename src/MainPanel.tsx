import React, {useState} from 'react';
import { open } from '@tauri-apps/api/dialog';
import { readBinaryFile } from '@tauri-apps/api/fs';
import PdfViewerComponent from "./PdfViewerComponent"

import "./MainPanel.css";

const MainPanel: React.FC = () => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const selectFile = async () => {
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
            revokeUrl(); // close previous pdf file
            // const selectedPath = selectedPaths[0];
            console.log("Selected file path:", selectedPath);
            const content = await readBinaryFile(selectedPath as string);
            const blob = new Blob([content], { type: 'application/pdf' });
            const dataUrl = URL.createObjectURL(blob);
            setPdfUrl(dataUrl);
            // setPdfContent(content);
        } catch (error) {
            console.error('Error selecting or reading the file:', error);
        }
    };

    const revokeUrl = () => {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        setPdfUrl(null);
    }
    return (
        <div className='MainPanel'>
            <h1>Welcome to Tauri!</h1>
            <p>Click on the button to select pdf file.</p>
            <div className="button-container">
            <button onClick={selectFile}>Select PDF File</button>
            <button onClick={() => revokeUrl()}>Close PDF</button>
            </div>
            <div>
                {pdfUrl && <PdfViewerComponent pdfUrl={pdfUrl} />}
            </div>
        </div>
    )
}

export default MainPanel;