import {useState} from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// import type { PDFDocumentProxy } from 'pdfjs-dist';

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
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
          {numPages &&
            Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
        </Document>
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