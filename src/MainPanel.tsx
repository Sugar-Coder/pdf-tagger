import React, {useEffect, useState} from 'react';
// import { open } from '@tauri-apps/api/dialog';
import { readBinaryFile } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api';
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

    const handleOpenPdf = (pdfFileName: string) => {
        invoke("open_file_native", {path: pdfFileName});
    }

    const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
    const [tagInput, setTagInput] = useState<string>("");

    const handleAddTag = () => {
        setIsAddingTag(true);
    }

    const handleTagInputKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            // console.log("adding tag", openedPdf, tagInput);
            invoke("add_tag", {path: openedPdf, tag: tagInput}).then((exists) => {
                if (typeof exists === 'boolean' && exists === true) {
                    console.log("tag already exists");
                    setTagInput('');
                } else if (typeof exists === 'boolean' && exists === false) {
                    console.log("file tagged!");
                    setTagInput('');
                    setIsAddingTag(false);
                }
            }).catch((error) => {
                console.error(error);
            });
        }
    }

    return (
        <div className='MainPanel'>
            <h1>Select your PDF!</h1>
            <p>Click on the button to select pdf file.</p>
            <div>
                {openedPdf && (
                    <div>
                        <button onClick={() => handleAddTag()}>Add Tag</button>
                        {isAddingTag && (
                            <div>
                                <input
                                    type='text'
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyUp={handleTagInputKeyPress}
                                    onBlur={()=> setIsAddingTag(false)}
                                    autoFocus
                                />
                            </div>
                        )}
                        <button onClick={() => handleOpenPdf(openedPdf) }>Native Open</button>
                    </div>
                )}
                {pdfUrl && <PdfViewerComponent pdfUrl={pdfUrl} /> }
            </div>
        </div>
    )
}

export default MainPanel;