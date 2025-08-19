
<template>
  <div class="inner-card">
    <div class='card-fixed'>
        <input  type="text"
                ref="searchString"
                v-on:keyup.enter="searchStrings"
                placeholder="term + ↵"
                title='Enter text to search for'
                class='input-element'
                style='width:100px; color:black;'> <!-- font-size:7pt; height:20px; '> -->
        <span v-on:click="searchStrings">
          <simpleButton content='Search' 
                        title='Mark and search for these elements'
                        padding='3px'
                        >
          </simpleButton>
        </span>
        <span v-on:click="resetSearch()">
          <simpleButton content='Clear' 
                        title='Clear search'                        
                        padding='3px'
                    >
          </simpleButton>
        </span>
        <!--
        <span>
          <toggleButton v-bind:controllingVariable="freshSearch"
                    v-on:update-controller="freshSearch = $event"
                    contentOn='<i class="fas fa-plus-circle"></i>'
                    contentOff='<i class="fas fa-plus-circle"></i>'
                    titleOn='Perform a fresh search'
                    titleOff='Append to previous filter'
                    padding='3px'
                    >
                    
          </toggleButton>
        </span>
        -->
        |
        <span>
          <!-- Zoom: {{ zoom_value_to_meaning[globalZoom] }}
          <input type="range" min=0 max=2 value=0 step=1 v-model="globalZoom" width='2px'> -->
          <toggleButton v-bind:controllingVariable="showTerms"
                    v-on:update-controller="showTerms = $event"
                    contentOn='Terms'
                    contentOff='Terms'
                    titleOn='Show passage terms'
                    titleOff='Hide passage terms'
                    padding='3px'
                    >
          </toggleButton>
          <toggleButton v-bind:controllingVariable="showSummary"
                    v-on:update-controller="showSummary = $event"
                    contentOn='Summary'
                    contentOff='Summary'
                    titleOn='Show summary'
                    titleOff='Hide summary'
                    padding='3px'
                    >
          </toggleButton>
          <toggleButton v-bind:controllingVariable="showText"
                    v-on:update-controller="showText = $event"
                    contentOn='Text'
                    contentOff='Text'
                    titleOn='Show passage text'
                    titleOff='Hide passage text'
                    padding='3px'
                    >
          </toggleButton>
          <span v-on:click="test()" class='clickme'><i class="fas fa-bug"></i></span>
        </span>
    <br>
    <pageNumbers  v-if="showPageNumbersUp===true"
                    v-bind:parentShowPageNumbersUp="showPageNumbersUp"
                    v-bind:parentPagesToPassages="pagesToPassages"
                    v-bind:parentCurrentPage="currentPage"
                    v-on:update-location="showPageNumbersUp = $event"
                    v-on:update-current-page="currentPage = $event"></pageNumbers>
    </div>
    <div class='card__scroll'>
        <!-- <div v-for='(doc,docid) in parentFlatDoc' v-bind:key='docid'> -->
          <!--<transition-group name='jump'>-->
            <!-- <div v-bind:class="['passage', 'doccolor'+passage.dId]" v-for='(passage,passageIx) in parentFlatDoc' v-bind:key='passageIx' style='position: relative;' v-show='passage.show'> -->
            <template v-if="true">
            <div v-if="data.$docs.length>0">
            
            <div v-bind:class="['passage-container', 'doccolor'+getDocColor(data.$docs[passageIx].id)]"
                 v-for='passageIx in visiblePassages'
                 v-bind:key='passageIx'
                 style='position: relative;'>

                  <!-- Each passage has a header and footer that will be conditionally shown !-->
                  <!-- HEADER -->
                  <!-- SECTION TO MARK TOP OF THE DOCUMENT -->
                  <div>
                    <!--
                    <div  v-if="data.$docs[passageIx].dStart === true"
                        v-bind:class="[ 'doc-passage-start-and-end',
                                        'doc-passage-start',
                                        'docBackground'+getDocColor(data.$docs[passageIx].id),
                                        'docColor'+getDocColor(data.$docs[passageIx].id)]">
                      <span>
                        BEGINNING OF <b>DOC {{data.$docs[passageIx].id}}</b>
                      </span>
                    </div>
                    -->
                    <!-- SECTION TO MARK TOP OF THE PASSAGE -->
                    <div v-if="passageIx === 0 || data.$docs[passageIx].dStart === true">
                    </div>
                    <div  v-else-if="!data.$docs[passageIx-1]['show']"
                          v-bind:class="['doc-passage-top', 'docColor'+getDocColor(data.$docs[passageIx].id)]"
                          v-on:click="revealNeighboringPassages(passageIx,'above')">
                      <b>
                        <i class="fas fa-caret-up"></i> <i class="fas fa-caret-up"></i> <i class="fas fa-caret-up"></i>
                      </b>
                    </div>

                  </div>

                <!-- THE PASSAGE AREA -->
                <div class="passage">
                
                  <!-- FLOATING OPTIONS -->
                  <div v-bind:class="['top-right-corner', 'docColor'+getDocColor(data.$docs[passageIx].id)]">
                    <!--PDF logo, if link is available ... currently deactivated-->
                    <i class="far fa-file-pdf" style="padding-right:4px; color:grey; cursor: auto;"></i>
                    <!--CLOSE PARA BUTTON-->
                    <i v-on:click="closePassage(passageIx)" class="far fa-eye-slash"></i>
                    <!-- v-if="showPassages.length != 1"
                    <i v-else style="color:grey; cursor: auto;" class="far fa-eye-slash" title=""></i> -->
                  </div>

                  <!-- PASSAGE DIV -->
                  <div class="text_passage">
                    <!--  1. Adding an active/activatible 'full text' -->
                    <div  style="background: white; padding: 0px; margin:0px; padding-left: 10px;">
                      <span v-for="text,text_ix in data.$docs[passageIx]['pShow']" v-bind:key="'tag_'+text_ix"
                              v-on:click="toggle_passage_section(passageIx,text_ix)"
                              v-bind:class="{text_header:true, text_header_inactive:!data.$docs[passageIx]['displayTextShow'][text_ix]}">
                        <span v-if="text_ix==0">
                          Key Words
                        </span>
                        <span v-else-if="text_ix==1">
                          Summary
                        </span>
                        <span v-else-if="text_ix==2">
                          Full Text
                        </span>
                      </span>
                    </div>
                    <!-- <br> -->
                    <!-- <transition-group name="custom-classes-transition" enter-active-class="animated tada" leave-active-class="animated bounceOutRight"> -->
                    <!-- <transition-group name="fade"> -->
                    <div class="passage_subsection">
                      <b><i>{{data.$docs[passageIx]['title']}}</i></b>
                            
                      <transition-group name="slide-fade">
                      <!-- refactored v-for/v-if -->
                      <span v-for="text,text_ix in data.$docs[passageIx]['pShow']" v-bind:key="text_ix">
                        <span v-if="data.$docs[passageIx]['displayTextShow'][text_ix]"
                              v-bind:class='{termdiv:text_ix==0, summarydiv:text_ix==1, textdiv:text_ix==2}'
                        >
                          <span v-if="text_ix == 0">
                            <br><!-- v-if="data.$docs[passageIx]['displayTextShow'][text_ix-1]">-->
                            <b>Terms: </b>
                          </span>
                          
                          <span v-if="text_ix == 1">
                            <br><!-- v-if="data.$docs[passageIx]['displayTextShow'][text_ix-1]">-->
                            <b>Summary: </b>
                          </span>
                          
                          <span v-if="text_ix == 2">
                            <!--v-if="data.$docs[passageIx]['displayTextShow'][text_ix-1] || data.$docs[passageIx]['displayTextShow'][text_ix-2]"-->
                            <!--
                            <b class="summarydiv">Text: </b>
                            <br> 
                            -->
                            <br>
                          </span>
                          
                          <span v-html="data.$docs[passageIx]['pShow'][text_ix]"
                                v-if="data.$docs[passageIx]['pShow'][text_ix]!==false">
                          </span>
                          <span v-else>
                            -
                          </span>
                          <!--
                          <div style="border-top: 1px dashed grey; margin-top:0px; padding-top:0px;"></div>
                          <br>
                          -->
                          </span>                            
                        </span>
                          
                      </transition-group>
                    <div style="border-bottom: 1px dashed grey; margin-top:0px; padding-top:0px;"></div>
                            
                    </div>
                  </div>
                </div>
                
                <!-- FOOTER -->
                  <!-- SECTION TO MARK BOTTOM OF THE DOCUMENT -->
                  <!--
                  <div v-if="data.$docs[passageIx].dEnd === true"
                      v-bind:class="[ 'doc-passage-start-and-end',
                                      'doc-passage-end',
                                      'docBackground'+getDocColor(data.$docs[passageIx].id),
                                      'docColor'+getDocColor(data.$docs[passageIx].id)]">
                    <span>
                      END OF <b>DOC {{data.$docs[passageIx].id}}</b>
                    </span>
                  </div>
                  -->
                  <!-- SECTION TO MARK BOTTOM OF THE PASSAGE -->
                  <div v-if="data.$docs[passageIx].dEnd === true">
                  </div>
                  <div  v-else-if="data.$docs[passageIx+1] !== undefined && data.$docs[passageIx+1]['show'] === false"
                        v-bind:class="['doc-passage-top', 'docColor'+getDocColor(data.$docs[passageIx].id)]"
                        v-on:click="revealNeighboringPassages(passageIx,'below')">
                    <b>
                      <i class="fas fa-caret-down"></i> <i class="fas fa-caret-down"></i> <i class="fas fa-caret-down"></i>
                    </b>
                  </div>
                <!-- FOOTER END -->
              </div>
            </div>
            </template>
    </div>
    <div class='card-fixed'>
      <!-- THIS IS WHERE THE PAGE NUMBERS GO -->
      <pageNumbers  v-if="showPageNumbersUp===false"
                    v-bind:parentShowPageNumbersUp="showPageNumbersUp"
                    v-bind:parentPagesToPassages="pagesToPassages"
                    v-bind:parentCurrentPage="currentPage"
                    v-on:update-location="showPageNumbersUp = $event"
                    v-on:update-current-page="currentPage = $event"></pageNumbers>
    </div>
  </div>
</template>

<script>

//import {createApp} from 'vue';
//import App from "@/App.vue";
//let app = createApp(App);
import { getCurrentInstance } from 'vue'
const app = getCurrentInstance();
// pinia stores
import { globalVariables } from '@/stores/global.js'
// we are in                  @/views/<thisProject>/pieces/; 
// ... we want to source from @/views/<thisProject>/stores/
import { localVariables } from '../stores/local.js'
import { dataVariables } from '../stores/data.js'

import simpleButton from '@/views/pieces/buttonSimple.vue';
import pageNumbers from '@/views/pieces/pageNumbers.vue';
import toggleButton from '@/views/pieces/buttonToggle.vue';

export default {
  data() {
    return {
      global: globalVariables(),
      local: localVariables(),
      data:dataVariables(),
      singleActionLock: 0,
      globalZoom: 0,
      updatedTheFirstTime:0,
      showTerms:1,
      showSummary:1,
      showText:0,
      // for freeform search
      currentPage: -1,
      freshSearch: 0,
      pagesToPassages: [],
      showPassages: [], //this.parentShowPassages,
      fullDocuments: {}, //this.parentFullDocuments,
      //topicToTermsDictionary: {},
      searchString:'',
      //flatDoc:[],
      passageToTerms:{}, // now a computed value
      //visiblePassages: [], .. now a computed value
      showPageNumbersUp: false,
      zoom_value_to_meaning: {0:'Full Text',1:'Abstract',2:'Key Words'},
    };
  },
  props: {
    parentDummyVariable: Array,
    parentShowPassages: Array,
    //parentFullDocuments: Object,
    parentClearSelections:Number,
    parentFlatDoc: Array,
    parentTopicToTermsDictionary: Object,
  },
  components:{
    simpleButton,
    toggleButton,
    pageNumbers,
  },
  mounted() {
    //this.showPassages = this.parentShowPassages;
    //this.fullDocuments = this.parentFullDocuments;
    //this.showPassages = this.parentShowPassages;
    //this.parentTopicToTermsDictionary = this.parentTopicToTermsDictionary;
    //this.resetSearch();
    //console.log("@@@@@@@@@@@@@@@@@@@@@",this.showPassages);
    //this.updatePassages();
    this.updateSubsections();
    this.showAll();
    /* console.log("this.data.$docs",this.data.$docs);
    this.data.$docs.forEach((passage,pId)=>{
        console.log("this.data.$docs[pId]['show']",pId,this.data.$docs[pId]['show'])
        console.log("this.data.$docs[pId]['pShow']",pId,this.data.$docs[pId]['pShow'])
    }); */

  },
  created() {
    this.updateSubsections();
  },
  watch: {
    parentClearSelections(){
      if(this.parentClearSelections){
        /* this.showPassages = [];
        this.showPassages   = []; //Object.assign({},newList);
        this.passageToTerms = {}; */
        this.resetSearch();
        this.$refs.searchString.value = '';
        //
        
        //this.showAll();
      }
    },
    showTerms(){
      this.updateSubsections();
    },
    showSummary(){
      this.updateSubsections();
    },
    showText(){
      this.updateSubsections();
    },
    // parentFullDocuments(){
    //   this.fullDocuments = this.parentFullDocuments;
    // },
    // parentFlatDoc(){
    //   this.flatDoc = this.data.$docs;
    // },
    // parentShowPassages(){
    //   this.showPassages = this.parentShowPassages;
    //   this.updateShowPassages();
    // },
    globalZoom(){
      //console.log(this.globalZoom);
      this.updateZoomLevel()
    },
    'docs.$topicToTermsDictionary': {
      deep: true,
      // We have to move our method to a handler field
      handler(){
        this.obtainSelectedTerms()
      }
    },
    // topicToTermsDictionary(){
    //   this.updatePassages();
    // },
    // fullDocuments(){ // replace with flatDoc
    //   this.updatePassages();
    // },
    'data.$docs'(){ // replace with flatDoc
      this.showAll()
      //this.updatePassages();
    },
    // TO BE REPLACED BY the analysis of topicToTermsDictionary
    showPassages(){
      //this.$emit('update-show-passages',this.showPassages);
      this.updatePassages();
    },
    parentShowPassages(){
      // Inheriting passages to show from this.parentShowPassages;
      // Only relevant if there is anything IN parentShowPassages
      if((  !this.parentShowPassages) // should be meaningful
         || (this.parentShowPassages.length === 0) ){
        this.showAll();
      } else {
        this.showPassages = this.parentShowPassages;
      }
    },
  },
  computed:{
    //passagesToDisplay(){
    //  showPassages.forEach((pId)=>{
    //  });
    //},
    visiblePassages(){
      /* // REMEMBER, currentPage is 1-indexed
      if(this.currentPage <= this.pagesToPassages.length){
        // do nothing 
      } else {
        this.currentPage = this.pagesToPassages.length
      } */
      return this.pagesToPassages[this.currentPage];
    },
    flatDocLength(){
      var l = this.data.$docs.length;
      if(l === undefined) l = 0;
      return l;
    },
  },
  methods: {
    getDocColor(documentId){
      // Document ID is just an integer
      var number_of_document_colors = 2; // obtained from the array "$passage-colors" in template_crunch.scss
      // iterating through 1,2,3,...,<number_of_document_colors>
      var new_doc_color = (documentId-1)%number_of_document_colors + 1;
      //
      return new_doc_color
    },
    showAll(){
      this.showPassages =  []; //Object.assign({},[]);//.push(... []);
      //
      for(var pix=0; pix < this.data.$docs.length; pix++){
        this.showPassages.push(pix);
      }
      this.updatePassages();
    },
    updateSubsections(){
      this.data.$docs.forEach((passage,pId)=>{
        if((this.data.$docs[pId]['displayText']!== undefined) && 
           (this.data.$docs[pId]['displayText'].length == 3)){
          this.data.$docs[pId]['displayTextShow'][0] = this.showTerms;
          this.data.$docs[pId]['displayTextShow'][1] = this.showSummary;
          this.data.$docs[pId]['displayTextShow'][2] = this.showText;
        }
      });
    },
    obtainSelectedTerms(){
      this.passageToTerms = {};
      //if(this.showPassages.length > 0){
      Object.keys(docs.$topicToTermsDictionary).forEach((topic)=>{
        Object.keys(docs.$topicToTermsDictionary[topic]).forEach((term)=>{
          var termObject = docs.$topicToTermsDictionary[topic][term];
          var selected      = termObject['selected'];
          if(selected===true){
            var passages      = termObject['sources'];
            var selectedClass = termObject['selectedClass'];
            //
            passages.forEach((pId)=>{
              if(!(pId in this.passageToTerms)) this.passageToTerms[pId]=[];
              //
              // check if we have already written this term in
              var _newTerm = true;
              this.passageToTerms[pId].forEach((_dict, _key)=>{
                if(_dict['term'] === term) _newTerm = false;
              });
              //
              if(_newTerm === true) {
                this.passageToTerms[pId].push({
                  'term':term,
                  'selectedClass':selectedClass,
                  'selected':selected,
                  'ignoreCase':false});
              }
            });
          }
        });
      });
      this.updatePassages();
      if(this.updatedTheFirstTime==false){
        this.updateSubsections();
        this.updatedTheFirstTime=1;
      }  
    },
    toggle_passage_section(passageIx,text_ix){
      var _old_value = this.data.$docs[passageIx]['displayTextShow'][text_ix];
      var _new_value = 1;
      if(_old_value == true){
        _new_value = 0;
      }
      this.singleActionLock = 1;
      //this.$set(this.data.$docs[passageIx]['displayTextShow'], text_ix, _new_value); // v2
      this.data.$docs[passageIx]['displayTextShow'][text_ix] = _new_value; // v3
    },              
    switchZoom(zoomLevel){
      console.log('HELLO',zoomLevel);
    },
    updateZoomLevel(){
      console.log('START');
      this.data.$docs.forEach((passage,pId)=>{
        //if (this.showPassages.includes(pId)) {
        var zoomIx = Math.min(this.data.$docs[pId]['displayText'].length - 1,this.globalZoom);
        this.data.$docs[pId]['pShow'] = this.data.$docs[pId]['displayText'][zoomIx];
        //console.log(this.data.$docs[pId]['displayText'][zoomIx]);
        //}
      });
      console.log('END');
    },
    updatePagesToPassages(){
      this.currentPage = 0;
      const itemsPerPage = 20;
      // resetting pages 
      this.pagesToPassages = []; // contains (passageStart, passageStop) tuples
      let _pageNumber = 0;
      for(var i=0; i<this.showPassages.length; i=i+itemsPerPage) {
        // getting the passage ixs
        const _currentPassages = this.showPassages.slice(i,i+itemsPerPage)
        // updating page to passage ix
        // this.$set(this.pagesToPassages, _pageNumber, _currentPassages); // v2
        this.pagesToPassages[_pageNumber] = _currentPassages; // v3
        // incrementing... did I really need to comment this?
        _pageNumber += 1;
      }
    },
    updateShowPassages(){
    },
    broadcastClearSelections(){
      //console.log("this.parentClearSelections",this.parentClearSelections);
      //this.parentClearSelections = 1;
      //console.log("this.parentClearSelections",this.parentClearSelections);
      this.$emit('update:clearSelections',1);
    },
    resetTerms(){
      this.showAll();
      this.passageToTerms = {};
    },
    resetSearch(){
      this.resetTerms();
      this.broadcastClearSelections();
    },
    searchStrings(event){
      // if(event.key==='Escape'){
      //   this.showPassages = [];
      // } else if(this.searchString.length > 0 && event.key === 'Enter') {
        this.searchDocuments();
      // }
    },
    termButtonClass(topic,term) {
      var selected = this.data.$topicToTermsDictionary[topic][term]['selected'];
      var highlightClass = 'term-color-'+this.$parent.highlightColorIx;
      return {'termButtonOn':selected, highlightClass}
    },
    searchDocuments(){
      this.showPassages   = [];
      this.passageToTerms = {};
      if(false){//this.freshSearch){
        //this.broadcastClearSelections();
        //this.showPassages   = []; //Object.assign({},newList);
        //this.passageToTerms = {};
        //this.showPassages = [];
        this.showPassages   = [];
        this.passageToTerms = {};
        //this.resetTerms();
        //this.showAll();
        //this.resetTerms();
        //this.broadcastClearSelections();
        //this.resetSearch();
        this.broadcastClearSelections();
      }
      //this.showPassages.push('dummy');
      
      //this.showPassages.splice(0);
      //this.showPassages.push(... ['dummy']); // replaced: this.showPassages = ['dummy'];
      //this.showPassages = ['dummy'];
      //this.showPassages.splice(0, this.showPassages.length)
      // Getting the search string
      var searchString = this.$refs.searchString.value;//.toLowerCase();
      const non_whitespace_length = searchString.replace(/\s+/g, '').length;
      //
      if(non_whitespace_length === 0){
        // then we don't need to search for anything
        this.resetSearch()
      } else {
        var current_passageIds = [];
        this.data.$docs.forEach((passage,pId)=>{
          //var text = passage['pRaw'];
          var texts = passage['pShow'];
          var showme = false;
          texts.forEach((text, index) => { 
            if(text){
              //var pId  = this.fullDocuments[docId][passageIx]['pId'];
              if(text.includes(searchString)){
                showme = true;
                //if(!current_passageIds.includes(pId)){
                  current_passageIds.push(pId)
                //}
                if(!this.showPassages.includes(pId)) {
                  this.showPassages.push(pId);
                }
              }
            }  
          });
          /* if(showme){
            this.fullDocuments[docId][passage]['show'] = true;
          } else {
            this.fullDocuments[docId][passage]['show'] = false;
          } */
        });
        const term = searchString;
        this.$parent.highlightColorIx = (this.$parent.highlightColorIx+1)%(this.$parent.highlightColors.length);
        var currentHighlightClass = "termButtonOn term-color-"+this.$parent.highlightColorIx;
        current_passageIds.forEach((pId, _key)=>{
          //
          // Getting the next highlight color index (we cycle through them)
          // check if we have already written this term in
          var _newTerm = true;
          if(pId in this.passageToTerms){
            this.passageToTerms[pId].forEach((_dict, _key)=>{
              if(_dict['term'] === term) _newTerm = false;
            });
          } else {
            this.passageToTerms[pId] = [];
          }
          this.passageToTerms[pId].push({
            'term':term,
            'selected':true,
            'selectedClass':currentHighlightClass,
            'ignoreCase':false});
        });
      }
      //console.log("!!!!!!!!!!!!!!!!!!!!!",this.showPassages);
      //this.updatePassages();
      //console.log("!!!!!!!!!!!!!!!!!!!!!",this.showPassages);
    },
    closePassage(passageIx){
      //this.fullDocuments[doxId][passageIx]['show'] = false;
      //this.data.$docs[passageIx]['show'] = false;
      // remove pId from showPassages
      //const pId = this.fullDocuments[doxId][passageIx]['pId'];
      const pId = passageIx;
      // Finding the index of that pId
      const index = this.showPassages.indexOf(pId);
      // Deleting that index, if the pId was found
      if (index > -1) this.showPassages.splice(index, 1);
      //
      if(this.showPassages.length == 0){
        // add all other shown pIds must be added, with the exception of current pId
        // Object.keys(this.fullDocuments).forEach((doxId2)=>{
        //   Object.keys(this.fullDocuments[doxId2]).forEach((passageIx2)=>{
        this.data.$docs.forEach((passage2,passageIx2)=>{
            //const pId2 = this.fullDocuments[doxId2][passageIx2]['pId'];
            const pId2 = passageIx2;
            if(this.data.$docs[passageIx2]['show'] == true && pId2 != pId){
              this.showPassages.push(pId2);
            }
        //   });
        // });
        });
      }
    },
    revealNeighboringPassagesOLD(doxId,passageIx,aboveOrBelow){
      var multiplier = 1;
      var passagesToReveal = 3;
      if(aboveOrBelow === 'above') multiplier = -1;
      for(var i=1; i < passagesToReveal+1; i++){
        var neighborIx = passageIx + i*multiplier;
        this.fullDocuments[doxId][neighborIx]['show'] = true;
        var neighborPId = this.fullDocuments[doxId][neighborIx]['pId'];
        if(!this.showPassages.includes(neighborPId)) this.showPassages.push(neighborPId);
      }
      //this.updatePassages();
    },
    revealNeighboringPassages(passageIx,aboveOrBelow){
      var multiplier = 1;
      var passagesToReveal = 3;
      const dId = this.data.$docs[passageIx]['dId'];
      
      if(aboveOrBelow === 'above') multiplier = -1;
      for(var i=1; i < passagesToReveal+1; i++){
        var neighborIx = passageIx + i*multiplier;

        var withinBounds = false;
        if(neighborIx < -1 || neighborIx < this.data.$docs.length) withinBounds = true;
        //
        if(withinBounds){
          if(this.data.$docs[neighborIx]['dId'] === dId){
            this.data.$docs[neighborIx]['show'] = true;
            //var neighborPId = this.data.$docs[neighborIx][neighborIx]['pId'];
            if(!this.showPassages.includes(neighborIx)) this.showPassages.push(neighborIx);
          }
        }
      }
      //this.updatePassages();
    },
    inject(mainString, subString, injectPosition) {
      return[mainString.slice(0, injectPosition), subString, mainString.slice(injectPosition)].join('');
    },
    getIndicesOf(searchStr, aStr) {
      return searchStr.indexOf(aStr);
    },
    highlightText(mainText, ixToSubtexts, textToClass){
      
      var indices = Object.keys(ixToSubtexts);
      var numericalIndices = indices.map(function(item) {return parseInt(item, 10)});
      
      var ending_text = '';

      numericalIndices.sort((a,b) => a-b);
      numericalIndices.reverse();
      numericalIndices.forEach((ix)=>{
        var subTexts = ixToSubtexts[ix];
        ix = Number(ix)
        if (ix > -1){
          // inject the ending div of the largest substring first, then continuing to smaller texts
          subTexts.sort(function(a, b){
            // ASC  -> a.length - b.length
            // DESC -> b.length - a.length
            return b.length - a.length;
          });
          var unavailable_keywords = [];
          var available_keywords = []
          subTexts.forEach((subText)=>{
            mainText = this.inject(mainText, '</div>', ix+subText.length);
            available_keywords.push(subText)
          });
          // inject the beginning div of the SMALLEST substring first, then continuing to smaller texts
          subTexts.sort(function(a, b){
            // ASC  -> a.length - b.length
            // DESC -> b.length - a.length
            return a.length - b.length;
          });
          subTexts.forEach((subText)=>{
            mainText = this.inject(mainText, '<div class="highlightRegion '+textToClass[subText]+'">', ix);
          });
        } else {
          // The text is likely truncated, so we just say that we derived these keywords from this document
          // ... at the end of the document

          const fontsize = '0.8em';

          // only do this step once
          if(ending_text.length == 0){
            ending_text+='<br><div ';
            ending_text+='style="'
            ending_text+='width:100%; ';
            ending_text+='z-index: 10000000000; ';
            ending_text+='display: inline-block; ';
            ending_text+='border-radius: 3px; ';
            ending_text+='text-align:right; ';
            ending_text+='padding-left: 5px; ';
            ending_text+='padding-right: 2.5px; ';
            ending_text+='margin-right: 2px; ';
            ending_text+='background-color: rgba(0,0,0,0.05); ';
            ending_text+='font-size:'+fontsize+'!important;';
            ending_text+='">';
            ending_text+='<b><i>Available, but not visible:</i></b> '
          }
          // inject the beginning div of the SMALLEST substring first, then continuing to smaller texts
          subTexts.sort(function(a, b){
            // ASC  -> a.length - b.length
            // DESC -> b.length - a.length
            return a.length - b.length;
          });
          subTexts.forEach((subText)=>{
            ending_text += '<div class="highlightRegion '+textToClass[subText]+'" style="font-size:'+fontsize+';">'+subText+'</div>';
          });
        }
      });
      if(ending_text.length>0){
        ending_text+='</div>';
      }

      return mainText+ending_text;
    },
    highlightPassage(pRaw,termObjects){
      var indicesToTerms   = {};
      var termToClass = {};
      //
      termObjects.forEach((aTermObject)=>{
        if(aTermObject['selected']){
          // 'aTermObject' does not have the same content as 'termObject'
          var _term = aTermObject['term'];
          var _class = aTermObject['selectedClass']
          var ix = this.getIndicesOf(pRaw, _term);
          if(!(ix in indicesToTerms))   indicesToTerms[ix]   = [];
          if(!indicesToTerms[ix].includes(_term)){
            indicesToTerms[ix].push(_term);
            termToClass[_term] = _class;
          }
        }
      });
      return this.highlightText(pRaw,indicesToTerms,termToClass)
    },
    updatePassages(){
      console.log('YAY!')
      this.updatePagesToPassages();
      var showAll = false;
      // if( this.showPassages.length === 0 ){
      //   this.showPassages.push(... Object.keys(this.data.$docs));
      // }
      // Object.keys(this.fullDocuments).forEach((docid, docix)=>{
      //     var currentDoc = this.fullDocuments[docid];
      //     currentDoc.forEach((passage,ix)=>
      //var deme = [];
      this.data.$docs.forEach((passage,pId)=>{
        //deme.push(pId);
        //var pId = passage['pId'];
        if (this.showPassages.includes(pId)) {
          this.data.$docs[pId]['show']  = true;
          //
          //this.data.$docs[pId]['pHTML'] = this.highlightPassage(this.data.$docs[pId]['pRaw'],this.passageToTerms[pId]);
          //this.highlightPassage(this.data.$docs[pId]['pHTML'],this.passageToTerms[pId]);
          //console.log("this.data.$docs[pId]['displayText']",pId,this.data.$docs[pId]['displayText'])
          console.log('passageToTerms',this.passageToTerms);
          this.data.$docs[pId]['pShow'] = []
          this.data.$docs[pId]['displayText'].forEach((t,ix)=>{
            if(t && pId in this.passageToTerms){
              t = this.highlightPassage(t,this.passageToTerms[pId]);
            }
            this.data.$docs[pId]['pShow'].push(t);
          });
        } else {
          this.data.$docs[pId]['show'] = false;
        }
      });
    },
    test() {
      console.log('this.passageToTerms',this.passageToTerms);
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss'>
@import '@/assets/css/vue-transition.css';
@import 'https://cdn.jsdelivr.net/npm/animate.css@3.5.1';

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

.top-right-corner {
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

.text_passage {
  //background-color: rgb(207, 207, 207);
  //border-top: 2px solid grey;
  margin: 0px;
  padding: 0px;
}

.passage_subsection {
  padding:0px;
  padding-left:12px!important;
  padding-right:12px!important;
  margin:0px!important;
  margin-bottom: 0px!important;
  padding-bottom: 0px!important;
  background-color: rgb(244, 244, 244);
  overflow-wrap: normal;
}

.text_header {
  border: 1px solid grey;
  border-bottom: 1px solid grey;
  color: grey;
  margin-top: 0px!important;
  margin-right: 0px; 
  margin-left: 0px; 
  margin-bottom: 0px!important; 
  padding-right: 4px; 
  padding-left: 4px; 
  font-size:80%;
  padding-top:0px !important;
  padding-bottom:0px !important;
  /* border-radius: 5px; */
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  cursor: pointer;
}

.text_header_on {
  //background-color: grey;
  border-color: black;
  color: black; //rgba($color-fiord);
  font-weight: bold;
}

.text_header_inactive {
  border-color: rgb(194, 194, 194) !important;
  color: rgb(194, 194, 194) !important;
  //background-color: rgb(192, 192, 192);
}

.text_low_res {
  border-radius : 5px;
  display:inline-block;
  padding-left:3px;
  padding-right:3px;
  margin:5px;
  padding-top: 0px;
  padding-bottom: 0px;
  margin-left:0px !important;
  cursor: pointer;
  font-size: $term-font-size;
  //color: black;
  border: 1px solid #D3D3D3 !important;
  background-color: white;
}

.text_low_res2 {
  font-size: $term-font-size - 1 !important;
  margin:2px;
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left:1px;
  padding-right:1px;
}

.text_comment {
  //
}

.fade-enter-active  {
  transition: opacity 1.25s ease-out;
}

.fade-leave-active  {
  transition: opacity 1.25s ease-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(10px);
  opacity: 0;
}

.odddiv:nth-of-type(even), .odddiv:nth-of-type(even) a {
  color: rgb(0, 127, 212);
  font-style: italic;
}

.termdiv, .termdiv a {
  color: rgb(0, 127, 212);
  font-style: italic;
}

.summarydiv, .summarydiv a {
  color: rgb(0, 127, 212);
  font-style: italic;
}

.textdiv, .textdiv a {
  color: rgb(39, 39, 39);
  //font-style: italic;
}

</style>
