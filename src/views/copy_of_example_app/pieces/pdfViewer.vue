<template>
  <div>
    <div v-for="pdfInfo,ix in pdfLookups" v-bind:key='ix' v-show="pdfInfo['frame']==selectedTab">
      YAAAAAAAAAAAAAAAAAAY
    <canvas v-bind:id="'canvas_'+ix" v-bind:ref="'canvas_'+ix" class="page-container">
      HELLOOOOOOOOOOOOOOoooo
    </canvas>
    <!-- <span v-bind:id="'div_canvas_'+ix" class="pdf-text"></span> -->
     HELLOOOOOOOOOOOOOOOOOOOOOOo
    </div>
  </div>
</template>

<script>

export default {
    props:
    {
      pdfInfo:Object,
    },
    data() {
    {
        let a =
        {
            loading: false,
            timer: null
        };
        return a;
    },
    created ()
    {
        document.addEventListener('pagerendered', this.pageRendered);
    },
    mounted ()
    {
        this.loadFile();
    },
    watch: {
      src: 'loadFile'
    },
    methods: {
      loadFile ()
      {
        this.loading = true;
        this.timer = setInterval(this.pollPDF, 100);
        window.PDFJS.workerSrc = '/pdf.worker.js';
        if (window.PDFView.pdfDocument) window.PDFView.pdfDocument.destroy();
        window.PDFJS.webViewerLoad(this.src);
        window.PDFView.setScale('page-width', true);
      },
      pageRendered (evt)
      {
        this.loading = false;
        clearInterval(this.timer);
        this.timer = null;
      },
      pollPDF ()
      {
        if (!window.PDFView.loading) this.pageRendered();
      }
    }
}
</script>

<style>
  .pdfjs
  {
    width: 100%;
    height: 100%;
  }

  .pdfjs #scaleSelectContainer
  {
    min-width: auto !important;
    max-width: none !important;
  }

  #scaleSelect
  {
    min-width: initial !important;
  }

  .pdfjs .dropdownToolbarButton
  {
    background-image: none !important;
  }

  #toolbarViewerLeft
  {
    position: static !important;
  }

  #toolbarViewerRight
  {
    display: none !important;
  }

  #sidebarToggle
  {
    display: none;
  }

  .pdfjs #thumbnailView
  {
    width: 100% !important;
  }

  .pdfjs #errorWrapper
  {
    margin-top: 3px;
  }

  .pdfjs #errorWrapper button
  {
    color: #000;
    padding-left: 6px;
    padding-right: 6px;
  }
</style>