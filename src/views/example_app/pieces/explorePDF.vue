<template>
  <div class="inner-card">
    <div class='card-fixed'>
      <div>
        
        <span v-for='termItem,termIx in termsToDisplay' v-bind:key="termIx">
          <span  v-bind:class="termItem.class">{{termItem.term}}</span>
            <span v-for='pdfLocation,locIx in termItem.pdfLocations' v-bind:key="locIx" 
                  v-bind:class="{'location-button':true, 'location-button-on':checkLocation(pdfLocation.key,pdfLocation.page)}"
                  v-on:click="showLocation(pdfLocation.key,pdfLocation.page)">
              <b>pdf {{pdfLocation.key}}</b><i>/p{{pdfLocation.page}}</i>
            </span>
        </span>
        
      </div>
      <span class='header-container'>
        <span>
          <span v-for="pdfInfo,ix in pdfLookups" v-bind:key='ix' 
                v-bind:class="{'tab':true,'tab-selected':pdfInfo['frame']==selectedTab}"
                v-bind:title="'Source:'+pdfInfo['basename']"
                v-on:click="selectPdf(ix)">
            PDF {{ix}}
          </span>
          <span v-on:click="test()"><i class="fas fa-redo-alt"></i></span>
        </span>

        <span>
          Page &nbsp;
          <i class="fas fa-step-backward" v-on:click='changePage("start")'></i>
          &nbsp;
          <i class="fas fa-backward"  v-on:click='changePage("minus")'></i>
          &nbsp;
          {{currentPageNumber}}/{{currentNumberOfPages}} 
          &nbsp;
          <i class="fas fa-forward"  v-on:click='changePage("plus")'></i>
          &nbsp;
          <i class="fas fa-step-forward" v-on:click='changePage("end")'></i>
        </span>
      </span>
    </div>
    <div class='card__scroll'>
      <div v-for="pdfInfo,ix in pdfLookups" v-bind:key='ix' v-show="pdfInfo['frame']==selectedTab">
        <canvas v-bind:id="'canvas_'+ix" v-bind:ref="'canvas_'+ix" class="page-container">
        </canvas>
        <!-- <span v-bind:id="'div_canvas_'+ix" class="pdf-text"></span> -->
      </div>
    </div>
  </div>
</template>

<script>

//import {createApp} from 'vue';
//import App from "@/App.vue";
//let app = createApp(App);
import { getCurrentInstance, nextTick } from 'vue'
const app = getCurrentInstance();
// pinia stores
import { globalVariables } from '@/stores/global.js'
import { localVariables } from '../stores/local.js'


//import {pdfjsLib} from 'pdfjs-dist/lib/pdf.js';
import {pdfjsLib} from 'pdfjs-dist';
//var pdfjsLib = import('pdfjs-dist');


import * as jquery from 'jquery';
//var jquery      = require("jquery");
//var pdfjsLib    = require('pdfjs-dist/build/pdf');
  //var pdfjsLib    = require('pdfjs-dist/webpack')
//var pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
import * as path from 'path';

//import '@../../../node_modules/pdfjs-dist/web/pdf_viewer.js';

import simpleButton from '@/views/pieces/buttonSimple.vue';

export default {
  data() {
    return {
      global: globalVariables(),
      local: localVariables(),
      pdfLookups: {},
      pdfNames: [],
      url: 'https://cdn.filestackcontent.com/5qOCEpKzQldoRsVatUPS', // a PDF
      scale: 1,
      pdf: undefined,
      promises: [],
      currentPageNumber: 1,
      currentNumberOfPages:1,
      selectedTab: undefined,
      selectedKey: undefined,
      serverpath: '',
      pages: [],
      termsToDisplay:[],
      SVG_NS: "http://www.w3.org/2000/svg",
    };
  },
  props: {
    parentDocs: Object,
    topicToTermsDictionary: Object,
    showPassages: Array,
    flatDoc: Array,
  },
  components:{
    simpleButton,
  },
  mounted() {
    var vm = this;
    this.serverpath   = this.global.$commonvariables.serverpath;
    this.updatePdfInfo();
    this.calculateTermsToDisplay();
    // we need to wait for the elements dependent 
    
    nextTick(function () {
        vm.initializePDFs();
    });
  },
  watch: {
    topicToTermsDictionary: { handler: 'calculateTermsToDisplay', deep: true },
    parentDocs(){
      this.updatePdfInfo();
    },
    pdfLookups(){
      //this.initializePDFs();
    },
  },
  computed:{
    passageIxToPdfPage(){
      var _pixToPDF = {};
      for(var key in this.flatDoc){
        // put a check on whether a keyword exists in a pdf
        _pixToPDF[key] = {'key':this.flatDoc[key]['cId'],'page': this.flatDoc[key]['pdfPage']};
      }
      return _pixToPDF
    },
    filename(){
      var _fname = false;
      if(this.availablePdfLocations.length > 0){
        _fname = this.availablePdfLocations[0]
      }
      return _fname
    },
    availablePdfLocations(){
      var _filenames = [];
      for(const key in this.parentDocs){
        const docObject = this.parentDocs[key];
        if((docObject.selected)&(docObject.dType === 'pdf')){
          _filenames.push(this.serverpath+'/pdf/'+docObject.inputFn);
        }
      }
      return _filenames 
    },
  },
  created() {
    //
  },
  methods: {
    calculateTermsToDisplay(){
      this.termsToDisplay = [];
      for(const topic in this.topicToTermsDictionary){
        for(const term in this.topicToTermsDictionary[topic]){
          if(this.topicToTermsDictionary[topic][term]['selected']){
            var _tmp_entry = {};
            _tmp_entry['term'] = term;
            _tmp_entry['topic'] = topic;
            _tmp_entry['class'] = {'termButton':true};
            this.topicToTermsDictionary[topic][term]['selectedClass'].split(' ').forEach(className=>{
              _tmp_entry['class'][className] = true;
            });
            _tmp_entry['sources'] = [];
            this.topicToTermsDictionary[topic][term].sources.forEach(pid=>{
              if(_tmp_entry['sources'].indexOf(pid) < 0){
                // we only want to see a passage show up once
                _tmp_entry['sources'].push(pid);
              }
            });
            _tmp_entry['pdfLocations'] = [];
            _tmp_entry['sources'].forEach(pid=>{
              _tmp_entry['pdfLocations'].push(this.passageIxToPdfPage[pid]);
            });
            this.termsToDisplay.push(_tmp_entry);
          }
        }
      }
      /* console.log('CALCULATED termsToDisplay')
      console.log(this.termsToDisplay); */
    },
    selectPdf(selectedKey){
      this.selectedTab=this.pdfLookups[selectedKey]['frame'];
      this.selectedKey=selectedKey;
      this.currentPageNumber = this.pdfLookups[selectedKey]['pageNumber'];
      this.currentNumberOfPages = this.pdfLookups[selectedKey]['pages'];
    },
    checkLocation(pdfKey,pageNumber){
      return (this.selectedKey === pdfKey) & (this.currentPageNumber === pageNumber)
    },
    showLocation(pdfKey,pageNumber){
      this.selectPdf(pdfKey);
      this.currentPageNumber = pageNumber;
      this.currentNumberOfPages = this.pdfLookups[pdfKey]['pages'];
      // setting the page number
      this.pdfLookups[pdfKey]['pageNumber'] = pageNumber;
      // rerendering
      this.queueRenderPage(pdfKey);
    },
    changePage(plusOrMinus){
      var key = this.selectedKey;
      var new_pageNumber = this.pdfLookups[key]['pageNumber'];
      // adding or subtracting
      if(plusOrMinus == 'minus'){
        new_pageNumber = new_pageNumber - 1;
      } else if (plusOrMinus == 'plus') {
        new_pageNumber = new_pageNumber + 1;
      } else if (plusOrMinus == 'end') {
        new_pageNumber = this.pdfLookups[key]['pages'];
      } else if (plusOrMinus == 'start') {
        new_pageNumber = 1;
      }
      // respecting page boundaries
      if(new_pageNumber < 1){
        new_pageNumber = 1
      } else if (new_pageNumber > this.pdfLookups[key]['pages']) {
        new_pageNumber > this.pdfLookups[key]['pages'];
      }

      this.currentPageNumber = new_pageNumber;
      this.currentNumberOfPages = this.pdfLookups[key]['pages'];

      // setting the page number
      this.pdfLookups[key]['pageNumber'] = new_pageNumber;
      // rerendering
      this.queueRenderPage(key);
    },
    initializePDFs(){
      var vm = this;
      const numberOfPDFs = Object.keys(this.pdfLookups).length;
      if(numberOfPDFs>0){
        var url = this.pdfLookups[1]['uri'];
        //
        console.log(this.pdfLookups);
        for(const key in this.pdfLookups){
          this.pdfLookups[key]['canvas'] = document.getElementById(this.pdfLookups[key]['frame']);
          console.log(this.pdfLookups[key]['canvas'],document.getElementById(this.pdfLookups[key]['frame']));
          this.pdfLookups[key]['ctx'] = this.pdfLookups[key]['canvas'].getContext('2d', { alpha: false });
        }
        //
        vm.promises = [];
        for(const key in this.pdfLookups){
          var url = this.pdfLookups[key]['uri'];
          //
          var currentPromise = pdfjsLib.getDocument( {url:url} ).promise;
          currentPromise.then(function(pdfDoc_) {
            vm.pdfLookups[key]['pdfDoc'] = pdfDoc_;
            vm.pdfLookups[key]['pages'] = vm.pdfLookups[key]['pdfDoc'].numPages
            // Initial/first page rendering
            vm.queueRenderPage(key);
          });
          vm.promises.push(currentPromise);
        }
        Promise.all(vm.promises).then(function(){
          vm.currentNumberOfPages = vm.pdfLookups[vm.selectedKey]['pages'];
        });
      }
    },
    updatePdfInfo(){
      // populating information about each PDF
      this.pdfLookups = {};
      for(const key in this.parentDocs){
        const docObject = this.parentDocs[key];
        if((docObject.selected) & (docObject.dType === 'pdf')){
          this.pdfLookups[key] = {};
          this.pdfLookups[key]['pageNumber'] = 1;
          this.pdfLookups[key]['pages']    = 1;
          this.pdfLookups[key]['selected'] = docObject.selected;
          this.pdfLookups[key]['basename'] = path.basename(docObject.inputFn);
          this.pdfLookups[key]['uri']      = this.serverpath+'/pdf/'+docObject.inputFn;
          this.pdfLookups[key]['frame']    = 'canvas_'+key;
          // pdfjs specific
          this.pdfLookups[key]['pagerendering'] = false;
          this.pdfLookups[key]['pageNumPending'] = false;
          this.pdfLookups[key]['scale']  = 2;
          this.pdfLookups[key]['canvas'] = false; 
          this.pdfLookups[key]['ctx']    = false; 
          this.pdfLookups[key]['pdfDoc'] = false;
        }
      }
      // Arbitrarily setting the first PDF as the one that is on as default
      
      if(Object.keys(this.pdfLookups).length){
        // fist pdf key
        const _key = Object.keys(this.pdfLookups)[0]
        // setting the selected tab
        this.selectedTab = this.pdfLookups[_key]['frame'];
        this.selectedKey = _key;
      }
    },
    queueRenderPage(key){
      if (this.pdfLookups[key]['pagerendering']) {
        this.pdfLookups[key]['pageNumPending'] = this.pdfLookups[key]['pageNumber'];
      } else {
        this.renderPage(key);
      }
    },
    buildSVG(viewport, textContent) {
      var vm = this;
      // Building SVG with size of the viewport (for simplicity)
      var svg = document.createElementNS(vm.SVG_NS, "svg:svg");
      svg.classList.add('pdf-text');
      svg.setAttribute("width", viewport.width);
      svg.setAttribute("height", viewport.height);
      // items are transformed to have 1px font size
      svg.setAttribute("font-size", 1);

      // processing all items
      textContent.items.forEach(function (textItem) {
        
        // we have to take in account viewport transform, which includes scale,
        // rotation and Y-axis flip, and not forgetting to flip text.
        var tx = pdfjsLib.Util.transform(
          pdfjsLib.Util.transform(viewport.transform, textItem.transform),
          [1, 0, 0, -1, 0, 0]
        );
        var style = textContent.styles[textItem.fontName];
        // adding text element
        var text = document.createElementNS(vm.SVG_NS, "svg:text");
        text.setAttribute("transform", "matrix(" + tx.join(" ") + ")");
        text.setAttribute("font-family", style.fontFamily);
        text.setAttribute("z-index", 10000000);
        text.textContent = textItem.str;
        //
        svg.appendChild(text);
      });
      return svg;
    },
    renderPage(key) {
      var vm = this;
      var pdfDoc = this.pdfLookups[key]['pdfDoc']; 
      var num    = this.pdfLookups[key]['pageNumber'];
      var canvas = this.pdfLookups[key]['canvas'];
      var scale  = this.pdfLookups[key]['scale'];
      this.pdfLookups[key]['pagerendering'] = true;
      //
      // Using promise to fetch the page
      pdfDoc.getPage(num).then(function(page) {
        //var viewport = page.getViewport({scale: scale});
        var viewport = page.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: vm.pdfLookups[key]['ctx'],
          viewport: viewport
        };
        var renderTask = page.render(renderContext);
        
        var canvasId = 'canvas_'+key;
        var textId = 'div_canvas_'+key;

        var pageContainer = jquery('#'+canvasId);
        var ctx = vm.pdfLookups[key]['ctx'];
        //renderTask.then(x=>{
            // Returns a promise, on resolving it will return text contents of the page
            //return page.getTextContent();
        //})
        
        // Wait for rendering to finish
        renderTask.promise.then(function() {
          vm.pdfLookups[key]['pagerendering'] = false;
          if (vm.pdfLookups[key]['pageNumPending'] !== null) {
            // New page rendering is pending
            vm.renderPage(key);
            vm.pdfLookups[key]['pageNumPending'] = null;
          }
        });

        //.setScale('page-width', true);
        page.getTextContent().then(function (textContent) {
          // building SVG and adding that to the DOM
          var svg = vm.buildSVG(viewport, textContent);
          document.getElementById(canvasId).appendChild(svg);
        });

        /* var textContent = page.getTextContent();
        textContent.then((tc)=>{
          // PDF canvas
          //var pdf_canvas = canvas;//$("#pdf-canvas"); 
          var pdf_canvas = jquery('#'+canvasId);

          // Canvas offset
          var canvas_offset = pdf_canvas.offset();
          
          // Canvas height
          var canvas_height = pdf_canvas.height();

          // Canvas width
          var canvas_width = pdf_canvas.width();
          
          // Assign CSS to the text-layer element
          var textCss = { left: canvas_offset.left + 'px', top: canvas_offset.top + 'px', height: canvas_height + 'px', width: canvas_width + 'px' };
          //var textCss = { left: canvas_offset.left, top: canvas_offset.top, height: canvas_height, width: canvas_width};
          jquery("#"+textId).css(textCss);

          
          // Pass the data to the method for rendering of text over the pdf canvas.
          pdfjsLib.renderTextLayer({
              textContent: tc,
              container: jquery("#"+textId).get(0),
              viewport: viewport,
              textDivs: []
          });
        }); */
      });

      // Update page counters
      //document.getElementById('page_num').textContent = num;
    },
    test(){
      var vm = this;
      this.calculateTermsToDisplay();
      //console.log('passageIxToPdfPage',this.passageIxToPdfPage);
      //
      // we need to wait for the elements dependent 
      nextTick(function () {
          vm.initializePDFs();
      });
      
      /* this.currentNumberOfPages = this.pdfLookups[this.selectedKey]['pages']; */
      //console.log(this.selectedTab);
      //console.log('this.canvas',this.canvas);
    }
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss'>
//@import '../../assets/css/template_crunch.scss';
@import '@/assets/css/vue-transition.css';
@import '/node_modules/pdfjs-dist/web/pdf_viewer.css';

.doc-passage-start-and-end {font-size: 10px; width:100%; height:2px; text-align: center; }
.doc-passage-start-and-end span{background: #ffffff; padding:0px; padding-left: 10px; padding-right: 10px;}

.doc-passage-start {margin-top:10px; margin-bottom: 10px; }
.doc-passage-start span {position:relative; top:-8px;}

.doc-passage-end {margin-top:15px; margin-bottom: 0px; }
.doc-passage-end span {position:relative; top:-8px;}


.doc-passage-top {
  width:100%; font-size: 8px; text-align: center; color: $color-fiord; cursor: pointer; padding:0
}

.top-left-corner{
  color: $color-fiord;
  //position:absolute;
  float:left;
  padding-right: 5px;
  font-size:12px;
  cursor: pointer;
  top:0;
  left:0;
  background-color: rgba(255,255,255,0.8);
}

.top-right-corner{
  //position:absolute;
  float:right;
  padding-left: 5px;
  padding-right: 2.5px;
  margin-right: 2px;
  font-size:12px;
  cursor: pointer;
  top:0;
  right:0;
  background-color: rgba(255,255,255,0.8);
}

.tab{
  border: 1px solid $color-fiord;
  font-size: small;
  margin-right:2px;
  padding-left: 4px;
  padding-right: 4px;
  border-top-left-radius: 7px;
  border-top-right-radius: 10px;
  cursor:pointer;
}
.tab-selected{
  border: 2px solid $color-fiord;
  background-color: $color-fiord;
  color: white;
}

.header-container{
  display:flex;
  justify-content: space-between;
  color: $color-fiord;
  cursor: pointer;
  font-size: small;
}

.location-button{
  cursor:pointer; 
  font-size: small;
  border: 1px solid rgb(200,200,200);
  background-color: rgb(220,220,220);
  border-radius: 5px;
  padding-left: 4px;
  padding-right: 4px;
  margin-right: 2px;
}

.location-button-on{
  border: 1px solid rgb(200,200,200);
  background-color: rgb(120,120,120);
  color: white;
}

.pdf-canvas{
  width:95%; 
  height:90%; 
  position:absolute;
  box-shadow: 0 1px 3px #444;
  font-size: 1px;
  line-height: 1;
}

.pdf-text {
  position: absolute;
  cursor: text;
  white-space: pre;
  transform-origin: left bottom;
  position:absolute; 
  width:95%; 
  height:90%;
  
}

.page-container {
  box-shadow: 0 1px 3px #444;
  position: relative;
  font-size: 1px;
  line-height: 1;
  width:95%; 
  height:90%;
}

</style>
