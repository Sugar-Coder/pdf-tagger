import React, {useEffect, useState, useRef} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open, confirm } from '@tauri-apps/api/dialog';
import "./LeftPanel.css";

const LeftPanel: React.FC = () => {
    // define the pdfList type
    interface PdfItem {
        id: number;
        path: string;
    }
    const [pdfList, setPdfList] = useState<PdfItem[]>([]);

    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
    // 右键菜单显示删除按钮
    interface ContextMenu {
        x: number;
        y: number;
        item: PdfItem;
    }
    const [contextMenu, setContextMenu] = useState<ContextMenu|null>(null);
    const contextMenuRef = useRef(null);

    const handleContextMenu = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, item: PdfItem) => {
        event.preventDefault();
        setContextMenu({x: event.clientX, y: event.clientY, item});
    }

    const handleClickOutSide = (event: MouseEvent) => {
        if (contextMenuRef && contextMenuRef.current) {
            setContextMenu(null);
        }
    };

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
        document.addEventListener('click', handleClickOutSide);

        // 在组件卸载时移除事件监听器
        return () => {
            document.removeEventListener('mousedown', handleClickOutSide);
        };
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
    };

    // 右键菜单的删除点击事件
    const handleDeleteClick = async () => {
        if (contextMenu !== null) {
            console.log("Deleting " + contextMenu.item.path);
            // make alert to confirm
            confirm("Are you sure to delete " + contextMenu.item.path).then((confirm) => {
                if (confirm) {
                    invoke("file_delete", {id: contextMenu.item.id}).then((size) => {
                        if (typeof size === 'number' && size > 0) {
                            getPdfList();
                        } else {
                            console.log("no record deleted");
                        }
                    });
                    setContextMenu(null); // 关闭右键菜单
                }
            });
        }
    };

    return (
        <div className="LeftPanel">
            <h2>PDF File List</h2>
            <button onClick={AddPdf}>+</button>
            <ul>
                {pdfList.map((item) => (
                    <li
                        key={item.id}
                        onClick={() => handlePdfClick(item.path)}
                        onContextMenu={(event) => handleContextMenu(event, item)}
                        className={selectedPdf === item.path ? 'selected' : ''}
                    >
                        {item.path.split("/").pop()}
                    </li>
                ))}
            </ul>
            {contextMenu && (
                <div 
                    ref={contextMenuRef}
                    className="context-menu"
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        border: '1px solid #ccc',
                        background: '#323030',
                        padding: '8px',
                        boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
                    }}
                    onClick={handleDeleteClick}>
                    <div>Delete</div>
                </div>
            )}
        </div>
    )
}

export default LeftPanel;