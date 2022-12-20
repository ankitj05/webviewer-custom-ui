import React, { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import Modal from "simple-react-modal";
import SearchContainer from "./components/SearchContainer";
import { ReactComponent as ZoomIn } from "./assets/icons/ic_zoom_in_black_24px.svg";
import { ReactComponent as ZoomOut } from "./assets/icons/ic_zoom_out_black_24px.svg";
import { ReactComponent as AnnotationRectangle } from "./assets/icons/ic_annotation_square_black_24px.svg";
import { ReactComponent as AnnotationRedact } from "./assets/icons/ic_annotation_add_redact_black_24px.svg";
import { ReactComponent as AnnotationApplyRedact } from "./assets/icons/ic_annotation_apply_redact_black_24px.svg";
import { ReactComponent as Search } from "./assets/icons/ic_search_black_24px.svg";
import { ReactComponent as Select } from "./assets/icons/ic_select_black_24px.svg";
import { ReactComponent as EditContent } from "./assets/icons/ic_edit_page_24px.svg";
import { ReactComponent as UpArrow } from "./assets/icons/up-arrow.svg";
import { ReactComponent as DownArrow } from "./assets/icons/down-arrow.svg";
import { ReactComponent as RotateClockwise } from "./assets/icons/rotate-right.svg";
import { ReactComponent as Measure } from "./assets/icons/measure.svg";
import { ReactComponent as Comment } from "./assets/icons/comment.svg";
import { ReactComponent as Pan } from "./assets/icons/pan.svg";

import "./App.css";
import "react-quill/dist/quill.snow.css";

const App = () => {
  const viewer = useRef(null);
  const scrollView = useRef(null);
  const searchTerm = useRef(null);
  const searchContainerRef = useRef(null);

  const [documentViewer, setDocumentViewer] = useState(null);
  const [annotationManager, setAnnotationManager] = useState(null);
  const [searchContainerOpen, setSearchContainerOpen] = useState(false);
  const [zoomlevel, setZoomLevel] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);

  const [editBoxAnnotation, setEditBoxAnnotation] = useState(null);
  const [editBoxCurrentValue, setEditBoxCurrentValue] = useState(null);

  const Annotations = window.Core.Annotations;

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    const Core = window.Core;
    Core.setWorkerPath("/webviewer");
    Core.enableFullPDF();

    const documentViewer = new Core.DocumentViewer();
    documentViewer.setScrollViewElement(scrollView.current);
    documentViewer.setViewerElement(viewer.current);
    documentViewer.setOptions({ enableAnnotations: true });
    // documentViewer.loadDocument("/files/pdftron_about.pdf");
    // documentViewer.loadDocument("/files/sampleDocx.docx");
    // documentViewer.loadDocument("/files/sampleExcel.xlsx");
    // documentViewer.loadDocument("/files/image.png");
    // documentViewer.loadDocument("/files/jpegImage.jpeg");
    // documentViewer.loadDocument("/files/jpegImage.webp");
    // documentViewer.loadDocument("/files/samplepptx.pptx");

    setDocumentViewer(documentViewer);

    documentViewer.addEventListener("documentLoaded", () => {
      documentViewer.setToolMode(
        documentViewer.getTool(Core.Tools.ToolNames.EDIT)
      );
      setAnnotationManager(documentViewer.getAnnotationManager());
      setZoomLevel(documentViewer.getZoomLevel());
      setCurrentPage(documentViewer.getCurrentPage());
    });

    documentViewer
      .getAnnotationManager()
      .addEventListener(
        "annotationChanged",
        async (annotations, action, info) => {
          if (!info.imported) {
            let annotationsVal = await documentViewer
              .getAnnotationManager()
              .exportAnnotationCommand();
            console.log(annotationsVal);
          }
        }
      );
  }, []);

  const goPreviousPage = () => {
    if (currentPage > 1) {
      documentViewer.setCurrentPage(currentPage - 1);
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goNextPage = () => {
    if (currentPage < documentViewer.getPageCount()) {
      documentViewer.setCurrentPage(currentPage + 1);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const gotoPage = (e) => {
    if (e.target.value >= documentViewer.getPageCount()) {
      documentViewer.setCurrentPage(e.target.value);
      setCurrentPage(e.target.value);
    }
  };

  const zoomOut = () => {
    documentViewer.zoomTo(documentViewer.getZoom() - 0.25);
    setZoomLevel((prev) => prev - 0.25);
  };

  const zoomIn = () => {
    documentViewer.zoomTo(documentViewer.getZoom() + 0.25);
    setZoomLevel((prev) => prev + 0.25);
  };

  const rotate = () => {
    documentViewer.rotateClockwise();
  };

  const measure = () => {
    documentViewer.setToolMode(
      documentViewer.getTool("AnnotationCreateDistanceMeasurement")
    );
  };

  const freeHandText = () => {
    documentViewer.setToolMode(
      documentViewer.getTool(window.Core.Tools.ToolNames.FREETEXT)
    );
    documentViewer
      .getTool(window.Core.Tools.ToolNames.FREETEXT)
      .setStyles((currentStyle) => ({
        // TextColor: "#000",
        FontSize: "20pt",
      }));
  };

  const pan = () => {
    documentViewer.setToolMode(
      documentViewer.getTool(window.Core.Tools.ToolNames.PAN)
    );
  };

  const startEditingContent = () => {
    const contentEditTool = documentViewer.getTool(
      window.Core.Tools.ToolNames.CONTENT_EDIT
    );
    documentViewer.setToolMode(contentEditTool);
  };

  const createRectangle = () => {
    documentViewer.setToolMode(
      documentViewer.getTool(window.Core.Tools.ToolNames.RECTANGLE)
    );
  };

  const selectTool = () => {
    documentViewer.setToolMode(
      documentViewer.getTool(window.Core.Tools.ToolNames.EDIT)
    );
  };

  const createRedaction = () => {
    documentViewer.setToolMode(
      documentViewer.getTool(window.Core.Tools.ToolNames.REDACTION)
    );
  };

  const applyRedactions = async () => {
    const annotationManager = documentViewer.getAnnotationManager();
    annotationManager.enableRedaction();
    await annotationManager.applyRedactions();
  };

  const richTextEditorChangeHandler = (value) => {
    setEditBoxCurrentValue(value);
  };

  const applyEditModal = () => {
    window.Core.ContentEdit.updateDocumentContent(
      editBoxAnnotation,
      editBoxCurrentValue
    );

    setEditBoxAnnotation(null);
    setEditBoxCurrentValue(null);
  };

  const editSelectedBox = async () => {
    const selectedAnnotations = documentViewer
      .getAnnotationManager()
      .getSelectedAnnotations();
    const selectedAnnotation = selectedAnnotations[0];

    if (
      selectedAnnotation &&
      selectedAnnotation.isContentEditPlaceholder() &&
      selectedAnnotation.getContentEditType() ===
        window.Core.ContentEdit.Types.TEXT
    ) {
      const content = await window.Core.ContentEdit.getDocumentContent(
        selectedAnnotation
      );
      setEditBoxAnnotation(selectedAnnotation);
      setEditBoxCurrentValue(content);
    } else {
      alert("Text edit box is not selected");
    }
  };

  const toolbarOptions = [["bold", "italic", "underline"]];

  return (
    <div className="App">
      <div id="main-column">
        <div className="center" id="tools">
          <button onClick={goNextPage}>
            <DownArrow />
          </button>
          <input type="text" value={currentPage} onChange={gotoPage} disabled />
          <button onClick={goPreviousPage}>
            <UpArrow />
          </button>
          <button onClick={zoomOut}>
            <ZoomOut />
          </button>
          <input
            type="text"
            value={`${zoomlevel * 100} %`}
            defaultValue={100}
            disabled
          />
          <button onClick={zoomIn}>
            <ZoomIn />
          </button>
          <button onClick={rotate}>
            <RotateClockwise />
          </button>
          <button onClick={measure}>
            <Measure />
          </button>
          <button onClick={freeHandText}>
            <Comment />
          </button>
          <button onClick={pan}>
            <Pan />
          </button>
        </div>
        <Modal
          show={!!editBoxCurrentValue}
          style={{ background: "rgba(0, 0, 0, 0.2)" }}
        >
          <ReactQuill
            value={editBoxCurrentValue}
            onChange={richTextEditorChangeHandler}
            modules={{ toolbar: toolbarOptions }}
          />
          <button onClick={applyEditModal}>Apply</button>
        </Modal>
        <div className="flexbox-container" id="scroll-view" ref={scrollView}>
          <div id="viewer" ref={viewer}></div>
        </div>
      </div>
      <div className="flexbox-container">
        <SearchContainer
          Annotations={Annotations}
          annotationManager={annotationManager}
          documentViewer={documentViewer}
          searchTermRef={searchTerm}
          searchContainerRef={searchContainerRef}
          open={searchContainerOpen}
        />
      </div>
    </div>
  );
};

export default App;
