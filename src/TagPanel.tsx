import React, {useEffect, useState} from "react";
import { invoke } from "@tauri-apps/api";
import "./TagPanel.css";

const TagPanel: React.FC = () => {
    interface TagItem {
        id: number;
        name: string;
    }
    const [tagList, setTagList] = useState<TagItem[]>([]);
    const getTagList = () => {
        invoke("get_tag_list").then((tagList) => {
            if (Array.isArray(tagList)) {
                setTagList(tagList);
            }
        });
    }

    useEffect(() => {
        getTagList();
    }, []);

    return (
        <div className="tag-panel">
            <ul>
                <li className="selected">All PDFs</li>
                {tagList.map((tagItem) => {
                    return <li key={tagItem.id}>{tagItem.name}</li>
                })}
            </ul>
        </div>
    );
}

export default TagPanel;