import "./App.css";
import {useState} from 'react';
import LeftPanel from "./LeftPanel";
import MainPanel from "./MainPanel";
import TagPanel from "./TagPanel";

function App() {
  const [openedPdf, setOpenedPdf] = useState<string | null>(null);
  return (
    <div className="container">
      <TagPanel />
      <LeftPanel setOpenedPdf={setOpenedPdf}/>
      <MainPanel openedPdf={openedPdf}/>
    </div>
  );
}

export default App;
