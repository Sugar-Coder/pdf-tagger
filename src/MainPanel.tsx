import React, {useEffect, useState} from 'react';
// import { open } from '@tauri-apps/api/dialog';
import { readBinaryFile } from '@tauri-apps/api/fs';
import PdfViewerComponent from "./PdfViewerComponent"

import "./MainPanel.css";

interface MainPanelProps {
    openedPdf: string | null;
}

const MainPanel: React.FC<MainPanelProps> = ({ openedPdf }) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        if (openedPdf) {
            revokeUrl();
            console.log("Opened pdf:", openedPdf);
            readBinaryFile(openedPdf).then((content) => {
                const blob = new Blob([content], { type: 'application/pdf' });
                const dataUrl = URL.createObjectURL(blob);
                setPdfUrl(dataUrl);
            }).catch((error) => {
                console.error('Error reading the file:', error);
            });
        } else {
            revokeUrl();
        }
    }, [openedPdf]);

    const revokeUrl = () => {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        setPdfUrl(null);
    }
    return (
        <div className='MainPanel'>
            <h1>Select your PDF!</h1>
            <p>Click on the button to select pdf file.</p>
            <div>
                {pdfUrl && <PdfViewerComponent pdfUrl={pdfUrl} /> }
            </div>
        </div>
    )
}

export default MainPanel;