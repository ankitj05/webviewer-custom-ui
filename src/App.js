import React, { useRef, useEffect, useState } from 'react';
import ZoomIn from './assets/icons/ic_zoom_in_black_24px.svg'
import ZoomOut from './assets/icons/ic_zoom_out_black_24px.svg'
import AnnotationRectangle from './assets/icons/ic_annotation_rectangular_area_black_24px.svg'
import AnnotationRedact from './assets/icons/ic_annotation_add_redact_black_24px.svg'
import AnnotationApplyRedact from './assets/icons/ic_annotation_apply_redact_black_24px.svg'
import Select from './assets/icons/ic_select_black_24px.svg'
import './App.css';

const App = () => {
  const viewer = useRef(null);
  const scrollView = useRef(null);
  const searchTerm = useRef(null);

  const [docViewer, setDocViewer] = useState(null);

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    const CoreControls = window.CoreControls;
    CoreControls.setWorkerPath('/webviewer');
    CoreControls.enableFullPDF(true);

    const docViewer = new CoreControls.DocumentViewer();
    docViewer.setScrollViewElement(scrollView.current);
    docViewer.setViewerElement(viewer.current);
    docViewer.setOptions({ enableAnnotations: true });
    docViewer.loadDocument('/files/pdftron_about.pdf');

    setDocViewer(docViewer);
  
    docViewer.on('documentLoaded', () => {
      console.log('document loaded');
      docViewer.setToolMode(docViewer.getTool('AnnotationEdit'));
    });
  }, []);

  const zoomOut = () => {
    docViewer.zoomTo(docViewer.getZoom() - 0.25);
  };

  const zoomIn = () => {
    docViewer.zoomTo(docViewer.getZoom() + 0.25);
  };

  const createRectangle = () => {
    docViewer.setToolMode(docViewer.getTool('AnnotationCreateRectangle'));
  };

  const selectTool = () => {
    docViewer.setToolMode(docViewer.getTool('AnnotationEdit'));
  };

  const createRedaction = () => {
    docViewer.setToolMode(docViewer.getTool('AnnotationCreateRedaction'));
  };

  const applyRedactions = async () => {
    const annotManager = docViewer.getAnnotationManager();
    annotManager.enableRedaction(true);
    await annotManager.applyRedactions();
  };

  const performSearch = () => {

  };

  return (
    <div className="App">
      <div>
        <button onClick={zoomOut}><img src={ZoomOut} alt="Zoom Out"/></button>
        <button onClick={zoomIn}><img src={ZoomIn} alt="Zoom In"/></button>
        <button onClick={createRectangle}>
          <img src={AnnotationRectangle} alt="Create Rectangle"/>
        </button>
        <button onClick={createRedaction}>
          <img src={AnnotationRedact} alt="Create Redaction"/>
        </button>
        <button onClick={applyRedactions}>
          <img src={AnnotationApplyRedact} alt="Apply Redaction"/>
        </button>
        <button onClick={selectTool}>
          <img src={Select} alt="Select"/>
        </button>
        {/* <input ref={searchTerm} type={'text'} placeholder={'Search'}></input>
        <button onClick={performSearch}>Search</button> */}
      </div>
      <div id="scroll-view" ref={scrollView}>
        <div id="viewer" ref={viewer}></div>
      </div>
    </div>
  );
};

export default App;