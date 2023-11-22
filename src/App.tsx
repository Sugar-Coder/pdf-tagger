import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';
import { readBinaryFile } from '@tauri-apps/api/fs';
import "./App.css";
import PdfViewerComponent from "./PdfViewerComponent"

function App() {
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");
  // const [pdfContent, setPdfContent] = useState<Uint8Array | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  //   setGreetMsg(await invoke("greet", { name }));
  // }
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
      // const selectedPath = selectedPaths[0];
      console.log("Selected file path:", selectedPath);
      const content = await readBinaryFile(selectedPath as string);
      const blob = new Blob([content], {type: 'application/pdf'});
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
    <div className="container">
      <h1>Welcome to Tauri!</h1>
      <p>Click on the button to select pdf file.</p>
      <button onClick={selectFile}>Select PDF File</button>
      {pdfUrl && <PdfViewerComponent pdfUrl={pdfUrl} />}
      <button onClick={() => revokeUrl()}>Close PDF</button>

      {/* <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          // greet();
          loadPdf();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setPdfPath(e.currentTarget.value)}
          placeholder="Enter a PDF file absolute path"
        />
        <button type="submit">View</button>
      </form> */}

      {/* <p>{greetMsg}</p> */}
    </div>
  );
}

export default App;
