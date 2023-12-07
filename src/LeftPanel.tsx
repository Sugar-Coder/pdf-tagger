import React, {useEffect, useState, useRef} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open, confirm, message} from '@tauri-apps/api/dialog';
import { exists } from '@tauri-apps/api/fs';
import "./LeftPanel.css";

interface LeftPanelProps {
    setOpenedPdf: React.Dispatch<React.SetStateAction<string | null>>;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ setOpenedPdf }) => {
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

    function delete_file_by_id(id: number) {
        invoke("file_delete", {id: id}).then((size) => {
            if (typeof size === 'number' && size > 0) {
                getPdfList();
            } else {
                console.log("no record deleted");
            }
        });
    }

    const handlePdfClick = (id: number, pdfFileName: string) => {
        if (selectedPdf === pdfFileName) {
            setSelectedPdf(null);
            setOpenedPdf(null);
            return;
        }
        // todo check if the file exists
        exists(pdfFileName).then((exists) => {
            if (exists) {
                setSelectedPdf(pdfFileName);
                setOpenedPdf(pdfFileName);
            } else {
                console.log("File not exists:", pdfFileName);
                // todo remove from database
                message("File not exists, removing from database");
                delete_file_by_id(id);
            }
        }).catch((error) => {
            console.error('Error checking file exists:', error);
            delete_file_by_id(id);
        });
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
            if (Array.isArray(selectedPath)) {
                // user selected multiple files
                console.log("multiple files selected");
            } else if (selectedPath === null) {
                // user cancelled the selection
                console.log("No file selected");
            } else {
                // user selected a single file
                invoke("file_add", {path: selectedPath}).then((size) => {
                    if (typeof size === 'number' && size > 0) {
                        getPdfList();
                        setOpenedPdf(selectedPath);
                        setSelectedPdf(selectedPath);
                    } else {
                        console.log("no new record added");
                    }
                });
            }
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
                        onClick={() => handlePdfClick(item.id, item.path)}
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