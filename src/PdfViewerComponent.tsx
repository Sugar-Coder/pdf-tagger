import {useState} from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// import type { PDFDocumentProxy } from 'pdfjs-dist';
import "./PdfViewerComponent.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface PdfViewerComponentProps {
  pdfUrl: string;
}

const PdfViewerComponent: React.FC<PdfViewerComponentProps> = ({ pdfUrl }) => {
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);
    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
      setNumPages(numPages);
      console.log("total page:", numPages);
    }
    function nextPage() {
      if (numPages && pageNumber < numPages) {
        setPageNumber(pageNumber + 1);
      }
    }
    function prevPage() {
      if (pageNumber > 1) {
        setPageNumber(pageNumber - 1);
      }
    }
    return (
      <div>
        <div className="page-button-container">
          <button onClick={prevPage}>Prev</button>
          <button onClick={nextPage}>Next</button>
        </div>
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
            {numPages && <Page pageNumber={pageNumber} />}
          </Document>
        </div>
      </div>
    );
  };

// interface PdfViewerComponentProps {
//   pdfContent: Uint8Array;
// }

// const PdfViewerComponent: React.FC<PdfViewerComponentProps> = ({ pdfContent }) => {
//   // const [numPages, setNumPages] = useState<number>();
//   const [pageNumber, setPageNumber] = useState<number>(1);
//   // function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
//   //   setNumPages(numPages);
//   //   console.log("total page:", numPages);
//   // }
//   return (
//     <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//       <Document file={{data: pdfContent}}>
//         <Page pageNumber={pageNumber} />
//       </Document>
//     </div>
//   );
// };

export default PdfViewerComponent;