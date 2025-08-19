<template>
  <div class='entire-container'>
    <!-- <img src='../assets/logo.png' /> -->
    <div class='container-menu'>
      <div style='width:20%; padding-left:10px; text-align: left;'>
        <a v-on:click="rerouteTo('home')">
          <span class="company-logo">{{local.$projectName}}</span>
        </a>
      </div>
      <div>
        <transition name='loader-transition'>
          <span
            style='color:#f4511e; font-size: large;'
            v-if='helpUser && noOfPanels === 0 && blinkOn'>
            TRY THESE <i class='fas fa-hand-point-right'></i>
          </span>
        </transition>
        <div
          v-for='(panel, name) in panels'
          v-bind:key='panel.id'
          style='display:inline-block;'
        >
          <span
            v-bind:for='panel.id + "-button"'
            class='button'
            v-bind:class='{ button__on: panel.active }'
            v-bind:title='"Show" + panel.name'
            v-on:click='togglePanel(name)'
          >
            <span v-html='panel.buttonContent'></span>
            <transition name="fade">
              <span v-if="menuShowLongFormButtons" v-html='"&nbsp;"+name'></span>
            </transition>
          </span>
          
        </div>
        <!-- <div title="Back to the Dashboard" style='display:inline-block; margin-right:6px; cursor:pointer; color:grey; vertical-align:middle;'>
          <span v-on:click="rerouteTo('Dashboard')">
          <i class="fas fa-angle-left"></i>
          <i class="fas fa-caret-left"></i>
          Dashboard
          </span>
        </div> -->
        |
        <div title="Close all panels" style='display:inline-block; margin-left:6px; margin-right:0px; cursor:pointer;'
              v-on:click='closeAllPanels()' v-bind:class="{lightbutton:true, lightbutton__on:activePanels.length>0}">
          <span>
            <i class="fas fa-xmark"></i>
          </span>
          <transition name="fade">
            <span v-if="menuShowLongFormButtons">
              Close Windows
            </span>
          </transition>
        </div>
        
        <div title="Back home" style='display:inline-block; margin-left:6px; margin-right:0px; cursor:pointer;'
            a v-on:click="rerouteTo('home')" class='lightbutton lightbutton__on'>
          <span>
            <i class="fas fa-house"></i>
          </span>
          <transition name="fade">
            <span v-if="menuShowLongFormButtons">
              Doc Dashboard
            </span>
          </transition>
        </div>
        
        <div title="Toggle button text" style='display:inline-block; margin-left:3px; cursor:pointer;'
              class='lightbutton lightbutton__on'
              v-on:click="test()">
          <span  class='clickme'><i class="fi-shield"></i></span>
          <transition name="fade">
            <span v-if="menuShowLongFormButtons">
            Debug
            </span>
          </transition>
        </div>

        <div title="Toggle button text" style='display:inline-block; margin-left:3px; cursor:pointer;'
              class='lightbutton lightbutton__on'
              v-on:click="menuShowLongFormButtons=!menuShowLongFormButtons">
          <transition name="fade">
          <span v-if="menuShowLongFormButtons">
            <i class="fas fa-arrow-right-long"></i>
            Collapse Names
            <i class="fas fa-arrow-left-long"></i>
          </span>
          <span v-else>
            <!-- <i class="fas fa-long-arrow-alt-right"></i> -->
            <i class="fas fa-arrows-left-right"></i>
          </span>
          </transition>
        </div>
        <!-- <div v-on:click="test()" class="lightbutton" style="color:red;">test</div> -->
        
        

        <transition name='loader-transition'>
          <span
            style='color:#f4511e; font-size: large;'
            v-if='helpUser && noOfPanels === 0 && blinkOn'
          >
            <i class='fi-arrow-left'></i>
            TRY THESE
          </span>
        </transition>
      </div>

      <div style='width:20%; text-align: right;  padding-right:10px;'>
        <mainMenuButton v-bind:parentRouteName="$route.name" 
                        v-bind:parentLinkTuples="local.$linkTuples">
        </mainMenuButton>
      </div>
    </div>

    <div
      class='container-content'
      v-bind:style='gridStyles'
    >
      <div
        v-for='(panel, name) in panels'
        v-bind:key='panel.name'
        v-bind:id='panel.id'
        v-show='panel.active'
        class='card'
      >
        <div class='card__header pastel-background'>
          <div class='card__header-title' v-html="panel.title"></div>
          <div>
            <span v-if='noOfPanels > 1' title='Expand panel' v-on:click='expandPanel(name)'>
            <i class='fas fa-maximize card-menu-button__on'></i>
            </span>
            <span v-else-if='previousPanels.length > 1' title='Collapse panel' v-on:click='collapsePanel()'>
              <i class='fas fa-rotate-left card-menu-button__on'></i>
            </span>
            <span title='Close panel' v-on:click='closePanel(name)'> 
              <i class='fas fa-xmark card-menu-button__on'></i>
            </span>
          </div>
        </div>
        <!-- Rendering content based on panel.name -->
        <termsContent v-if="panel.name === 'Terms'"
                      v-bind:parentTopicToTermsDictionary="data.$topicToTermsDictionary"
                      v-bind:parentShowPassages="showPassages"
                      v-on:update-topic-to-terms-dictionary="data.$topicToTermsDictionary = $event"
                      v-on:update-show-passages="showPassages = $event"
                      v-bind:parentClearSelections="clearSelections"
                      v-on:update:clearSelections="clearSelections = $event"
        ></termsContent>
        
        <passagesContent  v-if="panel.name === 'Passage'" 
                          v-bind:parentDummyVariable="dummyVariable" 
                          v-bind:parentTopicToTermsDictionary="topicToTermsDictionary" 
                          v-bind:parentShowPassages="showPassages" 
                          v-bind:parentFlatDoc="flatDoc" 
                          v-on:update-show-passages="showPassages = $event"
                          v-bind:parentClearSelections="clearSelections"
                          v-on:update:clearSelections="clearSelections = $event" 
        ></passagesContent>
        
        <passagesAtlas  v-if="panel.name === 'Atlas'"
                          v-bind:parentResetNetwork="resetNetwork"
                          v-on:update-reset-network="resetNetwork = $event"
                          v-bind:parentFlatDoc="flatDoc"
        ></passagesAtlas>
        
        <notepadComponent v-if="panel.name === 'Notebook'"
                          v-bind:value="'It was a beautiful day in '"
        ></notepadComponent>
        
        <passagesPDF  v-if="panel.name === 'PDF Viewer'"
                          v-bind:parentDocs="docs"
                          v-bind:showPassages="showPassages"
                          v-bind:flatDoc="flatDoc"
                          v-bind:topicToTermsDictionary="topicToTermsDictionary"
        ></passagesPDF>
        
        <!--
        THE STRUCTURE OF THE IMPORTED CARD CONTENT SHOULD LOOK LIKE THIS:
        <div class="inner-card">
          <div style='background-color:red'>
          </div>
          <div style='background-color:green; overflow: auto;'>
          </div>
        </div>
        -->
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */

import { createApp } from 'vue'
const app = createApp({})
//import { getCurrentInstance } from 'vue'
//const app = getCurrentInstance();
// router tools
import { useRoute } from 'vue-router'
import { RouterLink, RouterView } from 'vue-router'
// pinia stores
import { globalVariables } from '@/stores/global.js'
import { localVariables } from './stores/local.js'
import { dataVariables } from './stores/data.js'

// an example of the 'doc' structure within the dataVariables pinia store
import {exampleData} from './stores/example_data.js'

//import '../assets/css/template_crunch.css';
//import '@/assets/foundation-icons/foundation-icons.css';
//import '../assets/css/main_theme.css';


import axios from 'axios';

//import update from 'immutability-helper';

import 'vue-css-grid'

import { CssGrid, CssGridItem, ViewportListener } from 'vue-css-grid'
// Your main grid component, it declares the layout
app.component('css-grid', CssGrid)
 
// A grid item to use inside the grid component
app.component('css-grid-item', CssGridItem)
 
// Optional component to listen to viewport width and height changes
app.component('viewport-listener', ViewportListener)

import VueVirtualScroller from 'vue-virtual-scroller'
app.use(VueVirtualScroller)
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

// These are our main buttons/pieces, loaded from a common resource (@=/src/)
//import mainMenuButton from '@/views/pieces/mainMenu.vue';
import mainMenuButton from '@/views/pieces/mainMenu.vue';

// These are our main panels... loaded LOCALLY
import termsContent from      './pieces/exploreTerms.vue'
import passagesContent from   './pieces/explorePassages.vue'
import passagesAtlas from     './pieces/exploreAtlas.vue'
import notepadComponent from  './pieces/exploreNotepad.vue'
import passagesPDF from './pieces/explorePDF.vue'
import testComponent from './pieces/test.vue'





export default {
  name: 'Explore',
  data() {
    return {
      $route:useRoute(),
      global: globalVariables(),
      local: localVariables(),
      data: dataVariables(),
      exampleData:exampleData,
      menuShowLongFormButtons: false,
      dummyVariable: [{'true':true},{'false':false}],
      highlightColors: ["#A1C9F4", "#FFB482", "#8DE5A1", "#FF9F9B", "#D0BBFF", "#DEBB9B", "#FAB0E4", "#CFCFCF", "#FFFEA3", "#B9F2F0"],
      highlightColorIx: -1,
      companyName: '',
      resetNetwork: false,
      showPassages: [], // How we show/unshow documents
      selectedDocs: [], // passed from Dashboard
      docs:{},          // passed from Dashboard
      testDocs:[],
      panels: {},
      gridDirectives: {},
      blinkOn: false,
      helpUser: false,
      clearSelections:0,
      initiateSelectionClearing:0,
      activePanelsHistory: [],
      serverpath: '',
      fullDocuments: {},
      flatDoc: [],
      testDoc: [], // delete eventually
      topicToTermsDictionary: {},
      
    };
  }, // end of data
  watch: {
    panels: { handler: 'updatePanels', deep: true },
    activePanels: 'tallyPanelHistory',
    fullDocuments: { handler: 'updateDocuments', deep: true },
  }, // end of watch
  mounted() {
    this.data.fillDocs(this.exampleData.docs);
    //this.data.fillTopicsToTermsDictionary();
    //this.data.$docs = this.exampleData.docs;
    //this.data.$docs = this.exampleData.docs;
    this.companyName  = this.global.$commonvariables.companyName;
    this.serverpath   = this.global.$commonvariables.serverpath;
    this.selectedDocs = this.$route.params.selectedDocs;
    if(this.selectedDocs == null){ this.selectedDocs = []; }
    this.docs = this.$route.params.docs;
    if(this.docs == null){ this.docs = {}; }
    this.populateDocs();
    this.panels = this.local.$localPanels;
    this.gridDirectives = this.local.$localGridDirectives;
    this.updatePanels();
    this.tallyPanelHistory();
    // loading a central document holder
  }, // end of mounted
  computed: {
    allPanels: function () {
      var a = [];
      // for (var key in this.panels) {
      Object.keys(this.panels).forEach(function(key){
        a.push(key);
      });
      return a;
    },
    previousPanels: function () {
      var a = [];
      if (this.activePanelsHistory.length > 2){
        // getting the second last state
        a = this.activePanelsHistory[this.activePanelsHistory.length - 2]
      } 
      return a;
    },
    activePanels: function () {
      var a = [];
      const currentPanels = this.panels;
      var vm = this;
      Object.keys(currentPanels).forEach(function(key){
        if (currentPanels[key].active === true) {
          if((key === 'Network') || (key==='Atlas')){
            vm.resetNetwork = true;
          }
          a.push(key);
        }
      });
      return a;
    },
    gridStyles: function () {
      let currentStyles = this.gridDirectives.other;
      const i = this.activePanels.length;
      if (i < 5) {
        currentStyles = this.gridDirectives[i];
      }
      return currentStyles;
    },
    noOfPanels: function () { 
      return this.activePanels.length;
    }
  },
  components: {
    mainMenuButton, //testComponent,
    termsContent,
    passagesContent, //passagesNetwork,
    passagesAtlas,
    notepadComponent,//customButton,
    passagesPDF,
  },
  methods: {
    rerouteTo(_name){
      // Sending the selected doc ids to the exploration component
      this.$router.push( { name: _name, params: {} } );
      // ... WARNING: don't use this.$outer.push({'path': ...}) ... it does not let you submit params
    },
    test(){
      /* console.log('activePanelsHistory',this.activePanelsHistory);
      console.log('previousPanels',this.previousPanels);
      console.log('activePanels',this.activePanels.length); */
      console.log("this.data.$docs",this.data.$docs);
      console.log("this.data.$topicToTermsDictionary",this.data.$topicToTermsDictionary);
    },
    onlyUnique(value, index, self) {
      // Just a filter.
      // Example: ['a','a','a','b','b'].filter(onlyUnique)
      // Should give you: ['a','b']
      return self.indexOf(value) === index;
    }, // end of onlyUnique()
    sortNumber(a, b) {
      // sorts items correctly (i.e., [10,1,1,2], becomes [1,1,2,10] and not [1,1,10,2])
      return a - b;
    },
    get_counts_and_count_ordered_list(_list){
      // Getting element counts
      var unique_list = _list.filter(this.onlyUnique).sort();
      var element_to_count = {};
      for (var i = 0; i < unique_list.length; i++) {
        var element = unique_list[i];
        var elementCount = 0;
        _list.forEach((value) => {
          if (value == element) {
            elementCount++;
          }

        });
        element_to_count[element] = elementCount;
      }
      // Reordering values by count
      var to_sort_by = Object.values(element_to_count)
        .filter(this.onlyUnique)
        .sort(this.sortNumber)
        .reverse();
      var ordered_list = []
      to_sort_by.forEach((tCount) => {
        unique_list.forEach((element) => {
          if (element_to_count[element] == tCount) {
            ordered_list.push(element);
          }
        });
      });
      return [element_to_count, ordered_list];
    },
    populateDocs() {
      var vm = this;
      /*TEMP
      const _postheader = {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}};
      const path = this.serverpath+'/explore'
      console.log('path',path);
      axios.post(path, {'docs':this.docs}, _postheader) // this.selectedDocs
        .then((response) => {
          this.fullDocuments = response.data.docs;
          console.log("this.fullDocuments",this.fullDocuments);
          //vm.$set('fullDocuments', response.data.docs);
          this.msg = 'Documents populated';
          ///this.updateTopics();
          //Vue.nextTick;
        })
        .catch(function(){
          vm.msg = 'Oops, could not retrieve any docs information!';
        });
      */
    }, // end of populateDocs()
    closePanel(name) {
      // this.panels[name].active = false;
      console.log(this.panels);
      this.panels[name].active = false;
      console.log(this.panels);
    }, // end of closePanel()
    closeAllPanels(){
      Object.keys(this.panels).forEach((name)=>{
        this.panels[name].active = false;
      })
    },
    expandPanel(name) {
      // Object.keys(this.allPanels).forEach(function(key){
      for (var key in this.allPanels) {
        const currentName = this.allPanels[key];
        if (currentName === name) {
          this.panels[currentName].active = true;
        } else {
          this.panels[currentName].active = false;
        }
      };
    }, // end of expandPanel()
    togglePanel(name) {
      if (this.panels[name].active === true) {
        this.panels[name].active = false;
      } else {
        this.panels[name].active = true;
      }
    }, // end of togglePanel()
    collapsePanel() {
      let currentActivePanels = [];
      // Getting the previous panel configuration, if available
      if (this.activePanelsHistory.length > 1) {
        currentActivePanels = this.activePanelsHistory[
          this.activePanelsHistory.length - 2
        ];
      }

      for (var key in this.allPanels) {
      //Object.keys(this.allPanels).forEach(function(key){
        const currentName = this.allPanels[key];
        if (currentActivePanels.includes(currentName)) {
          this.panels[currentName].active = true;
        } else {
          this.panels[currentName].active = false;
        }
      };
    }, // end of collapsePanel()
    tallyPanelHistory() {
      // ADDING TO PANEL HISTORY
      const historyLimit = 30;
      if (this.activePanelsHistory.length >= historyLimit) {
        // BUT ENSURING THAT WE DON'T EXCEED A LIMIT (by keeping the last
        // <historyLimit> elements only)
        this.activePanelsHistory = this.activePanelsHistory.slice(
          Math.max(this.activePanelsHistory.length - historyLimit, 0),
        );
      }
      this.activePanelsHistory.push(this.activePanels);
    }, // end of tallyPanelHistory()
    updatePanels() {
      const numberOfPanels = this.activePanels.length;
      if (numberOfPanels > 0) {
        // Ascending order of importance...
        // in some of our schemas below, based on numberOfPanels,
        // the last available panel within this list will be given
        // a larger size (normally spanning 2 rows)
        let divOfImportance = false;
        let highestOrder = 0;

        for (var key in this.activePanels) {
          const panelName = this.activePanels[key];
          const currentPanel = this.panels[panelName];
          // var order = currentPanel.order;
          //
          if (currentPanel.order >= highestOrder) {
            divOfImportance = currentPanel.id;
            highestOrder = currentPanel.order;
          }
          // Resetting all placement values
          var currentElement = document.getElementById(currentPanel.id);
          if(currentElement !== null){
            currentElement.style.cssText = 'grid-column: auto, grid-row: auto;';
          }
        };
        var currentElement = document.getElementById(divOfImportance)
        if(currentElement !== null){
          if (numberOfPanels % 2 !== 0) {
            // Most important panel takes two spots to the right
            currentElement.style.cssText = 'grid-column: -2/-1; grid-row: 1/3;';
          } else {
          // Most important panel is always at the top right
          document.getElementById(divOfImportance).style.cssText = 'grid-column: -2/-1; grid-row: -2/-1;';
          }
        }
      } else {
        // no divs left to show
      }
    }, // end of updatePanels()
    updateDocuments(){
      this.flatDoc = [];
      let _collections = [];
      let _documents = [];
      let ix = 0;
      //console.log('fullDocuments',this.fullDocuments);
      //console.log('this.fullDocuments',this.fullDocuments);
      Object.keys(this.fullDocuments).forEach((dockey)=>{
        var isStart = true;
        var isend = false;
        var lastPix = Object.keys(this.fullDocuments[dockey]).length-1;
        Object.keys(this.fullDocuments[dockey]).forEach((pix)=>{
          this.$set(this.flatDoc, ix, {});
          // Some parts never change, these we set using indices
          console.log('dockey',dockey);
          this.flatDoc[ix]['id']          = dockey;
          this.flatDoc[ix]['cId']         = this.fullDocuments[dockey][pix]['cId'];
          this.flatDoc[ix]['dId']         = this.fullDocuments[dockey][pix]['dId'];
          this.flatDoc[ix]['pId']         = this.fullDocuments[dockey][pix]['pId'];
          this.flatDoc[ix]['pRels']       = this.fullDocuments[dockey][pix]['pRels'];
          this.flatDoc[ix]['pTerms']      = this.fullDocuments[dockey][pix]['pTerms'];
          this.flatDoc[ix]['pdfPage']     = this.fullDocuments[dockey][pix]['pdfPage'];
          this.flatDoc[ix]['pRaw']        = this.fullDocuments[dockey][pix]['pRaw'];
          this.flatDoc[ix]['pdfPage']     = this.fullDocuments[dockey][pix]['pdfPage'];
          this.flatDoc[ix]['pHTML']       = this.fullDocuments[dockey][pix]['pHTML'];
          this.flatDoc[ix]['cBaseFn']     = this.fullDocuments[dockey][pix]['cBaseFn'];
          this.flatDoc[ix]['title']     = this.fullDocuments[dockey][pix]['title'];
          this.flatDoc[ix]['displayText'] = this.fullDocuments[dockey][pix]['displayText'];
          this.flatDoc[ix]['displayTextShow']= this.fullDocuments[dockey][pix]['displayTextShow']; // might have to make this reactive by using this.$set
          this.flatDoc[ix]['zoom']        = 0
          //
          // adding a collections NUMBER
          var cIx = _documents.indexOf(this.flatDoc[ix]['cId'])
          if( cIx < 0 ) {
            _documents.push(this.flatDoc[ix]['cId'])
            cIx = _documents.indexOf(this.flatDoc[ix]['cId'])
          }
          this.flatDoc[ix]['cIx'] = cIx+1;
          //
          // adding a doc NUMBER
          var dIx = _documents.indexOf(this.flatDoc[ix]['dId'])
          if( dIx < 0 ) {
            _documents.push(this.flatDoc[ix]['dId'])
            dIx = _documents.indexOf(this.flatDoc[ix]['dId'])
          }
          this.flatDoc[ix]['dIx'] = dIx+1;
          //
          // this part should be reactive
          this.$set(this.flatDoc[ix], 'pShow',    true);
          this.$set(this.flatDoc[ix], 'dStart', isStart);
          //this.$set(this.flatDoc[ix], 'pShow',    true);
          isStart = false;
          lastPix === Number(pix) ? isend = true : isend = false;
          this.$set(this.flatDoc[ix], 'dEnd',   isend);
          ix += 1
          //console.log('flatDoc');
          //console.log(this.flatDoc);
        });
      })

      this.updateTopics()  
    },
    updateTopics() {
      //var _topicToTermsDictionary = {}

      // Object.keys(this.fullDocuments).forEach((docid) => {
      //   this.fullDocuments[docid].forEach((passage) => {
      /* console.log('this.flatDoc',this.flatDoc)
      this.flatDoc.forEach((passage,pId) => {
        console.log(passage.pTerms);
      }); */
      this.flatDoc.forEach((passage,pId) => {
          var paraId = pId; //passage['pId']; // var docId  = passage['dId']
          if (passage["pShow"] == 0) {
            //pass
          } else {
            var term_record = passage["pTerms"]; //JSON.parse(passage["pTerms"]);
            if(term_record){
              term_record.forEach( (term,key) => {
                var term_text = term["term"];
                var topics = [term["topic"],'ALL'];
                topics.forEach((topic_text)=>{
                  if(!(topic_text in this.topicToTermsDictionary)) this.$set(this.topicToTermsDictionary, topic_text, {});
                  if(!(term_text in this.topicToTermsDictionary[topic_text])){
                    this.$set(this.topicToTermsDictionary[topic_text],term_text,{});
                    this.$set(this.topicToTermsDictionary[topic_text][term_text],'selected', false);
                    this.$set(this.topicToTermsDictionary[topic_text][term_text],'sources', []);
                    this.$set(this.topicToTermsDictionary[topic_text][term_text],'show', false);
                    this.$set(this.topicToTermsDictionary[topic_text][term_text],'selectedClass', false);
                    /*
                    _topicToTermsDictionary[topic_text][term_text] = {};
                    _topicToTermsDictionary[topic_text][term_text]['selected'] = false;
                    _topicToTermsDictionary[topic_text][term_text]['sources']  = [];
                    _topicToTermsDictionary[topic_text][term_text]['show']     = false;
                    _topicToTermsDictionary[topic_text][term_text]['selectedClass'] = false;
                    */
                  }
                  this.topicToTermsDictionary[topic_text][term_text]['sources'].push(paraId);
                });
              });
            }
          } 
      });
      //   });
      // })
    }, // end of updateTopics()
  }, // end of methods
};
</script>

<style lang='scss' scoped>

/* for blinking */
.loader-transition-enter-active {
  transition: all 0.3s ease;
}
.loader-transition-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.loader-transition-enter, .loader-transition-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}

.main-menu-div {
  border: 1px solid $color-fiord;
  border-radius: 4px;
  padding: 5px;
  padding-left: 0px !important;
  padding-right: 0px !important;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 8px grey;
  position: absolute;
  bottom: 100;
  right: 0px;
}

.main-menu-ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.8);
}

.main-menu-li {
  padding: 4px;
  padding-left: 30px !important;
  padding-right: 30px !important;
  text-align: left;
  border-top: 1px solid $color-fiord;
}

.main-menu-li a {
  text-decoration: none;
  color: $color-fiord;
}

.fade-enter-active  {
  transition: opacity 1.25s ease-out;
}

.fade-leave-active  {
  transition: opacity 0.0s ease-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
