<template>
  <div class="inner-card">
    <div class='card-fixed'>
      <binaryButton v-bind:controllingVariable="expandAllSections"
                    v-on:update-controller="expandAllSections = $event"
                    contentOn='<i class="fi-arrows-out"></i>'
                    contentOff='<i class="fi-arrows-compress"></i>'
                    titleOn='Show all terms'
                    titleOff='Collapse all terms'
                    >
      </binaryButton>

      <toggleButton v-bind:controllingVariable="collectSections"
                    v-on:update-controller="collectSections = $event"
                    contentOn='<i class="fas fa-minus"></i>' 
                    contentOff='<i class="fas fa-bars"></i>'
                    titleOn='Sort terms by topic'
                    titleOff='Collect all terms'
                    >
      </toggleButton>
      
      <binaryButton v-bind:controllingVariable="sortAlphabetically"
                    v-on:update-controller="sortAlphabetically = $event"
                    contentOn='<i class="fas fa-sort-alpha-down">'
                    contentOff='<i class="fas fa-sort-numeric-down-alt"></i>'
                    titleOn='Sort alphabetically'
                    titleOff='Sort by term popularity within document'
                    >
      </binaryButton>

      <input  type="text" v-model="searchTerm" v-on:keyup="searchTerms" 
              placeholder="search terms" title='Enter text to search for' 
              class='input-element' style='width:100px; color:black;'>
      
      <!-- <toggleButton v-bind:controllingVariable="caseSensitive"
                    v-on:update-controller="caseSensitive = $event"
                    contentOn='Aa'
                    contentOff='Aa'
                    titleOn='Toggle case sensitivity'
                    titleOff='Toggle case sensitivity'
                    customStyle='{"margin-left": "200px"}'
                    >
      </toggleButton> -->

      <simpleButton v-bind:controllingVariable="clearSelections"
                    v-on:update-controller="clearSelections = $event"
                    content='Clear' 
                    title='Clear all filters'>
      </simpleButton>


      <!-- <span style="color:grey; cursor: pointer;" v-on:click="clearSelections=true">x</span> -->
      <!-- <simpleButton content='Search' title='Mark and search for these elements'></simpleButton> -->
    <!-- <span v-on:click="test">TEST</span> -->
    </div>
    
    <div class='card__scroll'>
    <div  v-if="availableTopics.length > 0">
      <!-- A LIST OF SELECTED TERMS -->
      <div v-if="!anythingSelected"  style="font-size:10px !important;">
        <i class="important-message" style="font-size:13px !important;">Try selecting a term</i>
      </div>
      <div v-else style="font-size:10px !important;">
        <b>SELECTED:</b>
        <span v-for='(topicObject,topic) in data.$topicToTermsDictionary'
              v-bind:key='topic'>
          <span v-if="topic!=='MATCHES'">
            <!-- <transition name="jump"> -->
              <span v-for='term in topicToSortedTerms[topic]'
                    v-bind:key='term'>
                <div v-on:click='toggleHighlight(topic,term)' class="termButton termButtonSmall"
                v-if="data.$topicToTermsDictionary[topic][term]['selected']"
                v-bind:class="[data.$topicToTermsDictionary[topic][term]['selected'] ? data.$topicToTermsDictionary[topic][term]['selectedClass'] : '']"
                >
                  {{term}} 
                </div>
              </span>
            <!-- </transition> -->
          </span>
        </span>
      </div>
      <!-- JUST THE HEADER FOR THE LIST OF TOPICS -->
      <div class="topic-header">
        <span>
          TOPIC
        </span>
        <span class="termCount">
          COUNT
        </span>
      </div>
      <!-- THE ACTUAL LIST -->
      <!-- {{availableTopics}}<br>
      {{expandTopic}}
      {{topicToSortedTerms}} -->
      <div v-for='topic in availableTopics' v-bind:key='topic'>
        <span>
          <div class='topic-header topic-header-background' style='cursor: pointer;' v-on:click="toggleExpansion(topic)">
            {{topic}} 
            <span class="termCount">
              {{Object.keys(data.$topicToTermsDictionary[topic]).length}} 
              |
              {{expandTopic[topic]}}
              <span v-if="expandTopic[topic]">
                <i  class="fas fa-angle-up"></i>
              </span>
              <span v-else>
                <i class="fas fa-angle-down"></i>
              </span>
            </span>
          </div><br>
          <transition name="jump">
          <div v-show="expandTopic[topic]" class="terms-container">
            <div v-for='term in topicToSortedTerms[topic]' 
              v-on:click='toggleHighlight(topic,term)' class="termButton"
              v-bind:key=term
              v-bind:title="'Term: '+term+'; Count: '+Object.values(data.$topicToTermsDictionary[topic][term]['sources']).length"
              v-bind:class="[data.$topicToTermsDictionary[topic][term]['selected'] ? data.$topicToTermsDictionary[topic][term]['selectedClass'] : '']"
            >
              {{term}} 
              <span class="countfont">
                {{Object.values(data.$topicToTermsDictionary[topic][term]['sources']).length}}
              </span>
            </div>
          </div>
          </transition>
        </span>
      </div>
    </div>
    <div v-else>
      <i>Please select a collection from the <span class="local-link" v-on:click="$parent.rerouteTo('Dashboard')">Dashboard</span> to populate this section.</i>
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
// we are in                  @/views/<thisProject>/pieces/; 
// ... we want to source from @/views/<thisProject>/stores/
import { localVariables } from '../stores/local.js'
import { dataVariables } from '../stores/data.js'
import { storeToRefs } from 'pinia'

import toggleButton from '@/views/pieces/buttonToggle.vue';
import binaryButton from '@/views/pieces/buttonBinary.vue';
import simpleButton from '@/views/pieces/buttonSimple.vue';

//import '@/assets/foundation-icons/foundation-icons.css';
//import '@/assets/fontawesome-free-5.13.0-web/css/all.min.css';
//import '@/assets/fontawesome-free-7.0.0-web/css/all.min.css';


//import update from 'immutability-helper';

export default {
  data() {
    return {
      global: globalVariables(),
      local: localVariables(),
      data: dataVariables(),
      topicToTermsDictionary: {}, // needed
      showPassages: [],
      clearSelections: 0,
      expandAllSections: 1,
      collectSections: 0,
      sortAlphabetically: 0,
      mainMenuActive: false,
      groupByTopics: true,
      topicToTermDict: {},
      caseSensitive:0,
      expandTopic: {},        // moved to computed?
      //topicToSortedTerms: {}, // moved to computed
      //availableTopics: {},    // moved to computed
      deme: 0,
      searchTerm: '',
      testDoc:[],
    };
  },
  mounted() {
    this.topicToTermsDictionary = this.data.$topicToTermsDictionary;
    // Used to be (before pinia)
    // this.data.$topicToTermsDictionary = this.parentTopicToTermsDictionary;
    this.data.$topicToTermsDictionary['MATCHES'] = {};
    var d = {};
    const _trueOrFalse = this.expandAllSections;
    Object.keys(this.data.$topicToTermsDictionary).forEach((topic) => d[topic] = _trueOrFalse);
    this.expandTopic = d;
    //
  },
  props: {
    parentTopicToTermsDictionary: Object,
    parentShowPassages: Array,
    parentClearSelections: Number,
  }, 
  components:{
    toggleButton,
    binaryButton,
    simpleButton,
  },
  computed: {
    anythingSelected(){
      var _boolean = false;
      Object.keys(this.data.$topicToTermsDictionary).forEach((topic)=>{
        Object.keys(this.data.$topicToTermsDictionary[topic]).forEach((term)=>{
          if(this.data.$topicToTermsDictionary[topic][term]['selected']){
            _boolean = true;
          }
        });
      });
      return _boolean;
    },
    topicToSortedTerms(){
      // this JSON double routine is a hack to deep copy the dictionary
      //var _newDict = JSON.parse(JSON.stringify(this.parentTopicToTermDict));
      //var _newDict = JSON.parse(JSON.stringify(this.data.$topicToTermsDictionary))
      var _newDict = {}
      Object.keys(this.data.$topicToTermsDictionary).forEach((topic)=>{
        var termsObject = this.data.$topicToTermsDictionary[topic]
        if(this.sortAlphabetically === 1){
          _newDict[topic] = Object.keys(termsObject).sort(
            // this function ensures that our alphabetical sorting is case insensitive 
            function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());}
          );
        } else {
          _newDict[topic] = this.sortByCount(termsObject);
        }
      });
      //this.topicToSortedTerms = _newDict;
      return _newDict
    },
    availableTopics() {
      let _availableTopics = [];

      Object.keys(this.$data.topicToTermsDictionary).forEach((topic)=>{
        // setting the show section option to false, then selectively showing specific ones
        var _showSection = false; 
        if( this.searchTerm.length > 0 ){
          // 1. If we are searching for something, show only MATCHES
          if(topic === 'MATCHES') _showSection = true;
        } else if (this.collectSections === 1) {
          // 2. If we are not searching for something, and collectSections is on, show only ALL
          if(topic === 'ALL') _showSection = true;
        } else {
          // 3. OTHERWISE, show all but MATCHES and ALL
          _showSection = true;
          if(topic === 'MATCHES' || topic === 'ALL') _showSection = false;
        }
        if(_showSection===true){
          _availableTopics.push(topic);
        }
      });
      return _availableTopics.sort(); //Object.keys(this.data.$topicToTermsDictionary).sort();;
    },
  },
  watch: {
    parentClearSelections(){
      //
      var vm = this;
      this.clearSelections = this.parentClearSelections;
      nextTick(function () {
        if(vm.parentClearSelections){ // == 1
          vm.$emit('update:clearSelections',0);
        }
      });
      //
      /*
      if(this.clearSelections){
        Object.keys(this.data.$topicToTermsDictionary).forEach((topic)=>{
          Object.keys(this.data.$topicToTermsDictionary[topic]).forEach((term)=>{
            this.data.$topicToTermsDictionary[topic][term]['selected'] = false;
          });
        });
      }
      this.$emit('update:clearSelections',0);
      //this.parentClearSelections = 0;
      */
    },
    clearSelections(){
      this.searchTerm = '';
      if(this.clearSelections){
        this.showPassages = [];
        // also updating the 'selected' variables within each topic
        Object.keys(this.data.$topicToTermsDictionary).forEach((topic)=>{
          Object.keys(this.data.$topicToTermsDictionary[topic]).forEach((term)=>{
            this.data.$topicToTermsDictionary[topic][term]['selected'] = false;
          });
        });
        this.broadcastClearSelections();
      }
    },
    caseSensitive(){
      this.searchTerms();
    },
    //parentTopicToTermsDictionary(){
    /*
    parentTopicToTermsDictionary:{
      deep: true,
      // We have to move our method to a handler field
      handler: function(v) {
    */
    /* parentTopicToTermsDictionary(){
        this.data.$topicToTermsDictionary = this.parentTopicToTermsDictionary;
        this.data.$topicToTermsDictionary['MATCHES'] = {};
        var d = {};
        const _trueOrFalse = this.expandAllSections;
        Object.keys(this.data.$topicToTermsDictionary).forEach((topic) => d[topic] = _trueOrFalse);
        this.expandTopic = d;
    }, */
    parentShowPassages(){
      if(this.parentShowPassages.length > 0){
        Object.keys(this.data.$topicToTermsDictionary).forEach((topic)=>{
          Object.keys(this.data.$topicToTermsDictionary[topic]).forEach((term)=>{
            if(this.data.$topicToTermsDictionary[topic][term]['selected'] === true) {
              // lets check if at least one passage that contains this term is present
              var keepOn = false;
              this.data.$topicToTermsDictionary[topic][term]['sources'].forEach((pId)=>{
                if(this.parentShowPassages.includes(pId)) keepOn = true;
              });
              if(keepOn===false){
                this.data.$topicToTermsDictionary[topic][term]['selected'] = false;
              }
            }
          });
        });
      }
      
      this.showPassages = this.parentShowPassages;
    },
    collectSections() {
      //console.log('this.expandAllSections BEFORE',this.expandAllSections)
      //this.collectSections === 1 ? this.expandAllSections = 1 : this.expandAllSections = 0;
      //console.log('this.expandAllSections AFTER',this.expandAllSections)
    },
    expandAllSections() {
      this.updateAllExpansions();
    },
    showPassages(){
      // Since showPassages will be primarily used in the Passages section, we need to
      // update the parent showPassages variable 
      // (which is bound to explorePassages.vue sub-component)
      this.$emit('update-show-passages',this.showPassages);
    },
  },
  created() {
    //
  },
  methods: {
    broadcastClearSelections(){
      this.$emit('update:clearSelections',1);
    },
    searchTerms(event){
      if(event === undefined){
        event = {'key':'DUMMYKEY'};
      }
      var _changed_since_last_time = false;
      if(event.key==='Escape'){
        this.searchTerm = '';
      } else if(this.searchTerm.length > 0) {
        let lowerCaseSearchTerm = this.searchTerm;
        if(this.caseSensitive == false){
          lowerCaseSearchTerm = lowerCaseSearchTerm.toLowerCase();
        }
        this.data.$topicToTermsDictionary['MATCHES'] = {};
        Object.keys(this.data.$topicToTermsDictionary['ALL']).forEach((term)=>{
          var termToCompare = term;
          if(this.caseSensitive == false) {
            termToCompare = term.toLowerCase();
          }
          if(termToCompare.includes(lowerCaseSearchTerm)){
            this.data.$topicToTermsDictionary['MATCHES'][term] = this.data.$topicToTermsDictionary['ALL'][term];
            this.data.$topicToTermsDictionary['MATCHES'][term]['show'] = true;
            _changed_since_last_time = true;
          }
        });
      }
      if(_changed_since_last_time){
        this.expandTopic['MATCHES'] = 1;
      }
      this.updateSelectionButtons()
    },
    sortByCount(topic_entry){
      var unique_terms = Object.keys(topic_entry).sort();
      // Getting term counts
      var term_to_count = {};
      Object.keys(topic_entry).forEach((term)=>{
        term_to_count[term] = topic_entry[term]['sources'].length;
      });
      // Reordering values by count
      var to_sort_by = Object.values(term_to_count)
        .filter(this.$parent.onlyUnique)
        .sort(this.$parent.sortNumber)
        .reverse();
      var ordered_list = []
      to_sort_by.forEach((tCount) => {
        unique_terms.forEach((term) => {
          if (term_to_count[term] == tCount) {
            ordered_list.push(term);
          }
        });
      });
      return ordered_list;
    },
    termButtonClass(topic,term) {
      var selected = this.data.$topicToTermsDictionary[topic][term]['selected'];
      var highlightClass = 'term-color-'+this.$parent.highlightColorIx;
      return {'termButtonOn':selected, highlightClass}
    },
    updateShowPassages(){
      // Recalculating the passages to show after a term has been toggled 
      // It is easier to recalculate the whole variable than to figure out which 
      // passages exist exclusively in a term that was switched off
      var _showPassages = [];
      // iterating through topics...
      Object.keys(this.data.$topicToTermsDictionary).forEach((topic)=>{
        // and terms
        Object.keys(this.data.$topicToTermsDictionary[topic]).forEach((term)=>{
          // to get to the term object within
          if(this.data.$topicToTermsDictionary[topic][term]['selected'] === true){
            this.data.$topicToTermsDictionary[topic][term]['sources'].forEach((_pid)=>{
              if(!_showPassages.includes(_pid)) _showPassages.push(_pid);
              //if(!(_pid in _showPassages)) _showPassages.push(_pid);
            });
          }
        });
      });
      // Finally updating the passages to show variable
      this.showPassages = _showPassages;
    },
    test() {
      console.log('this.data.$topicToTermsDictionary',this.data.$topicToTermsDictionary);
    },
    toggleHighlight(topic,term) {
      var a = this.data.$topicToTermsDictionary[topic][term]['selected']; // getting state
      a === true? a = false: a =true;                               // toggling state
      this.data.$topicToTermsDictionary[topic][term]['selected'] = a;     // setting state
      
      if(a === true){
        // Cycling through highlight classes
        this.$parent.highlightColorIx = (this.$parent.highlightColorIx+1)%(this.$parent.highlightColors.length);
        this.data.$topicToTermsDictionary[topic][term]['selectedClass'] = 'termButtonOn term-color-'+this.$parent.highlightColorIx;
      }
      this.updateShowPassages();
    },
    show(topic) {
      var _showSection = false; 
      var collectSections = this.collectSections;

      if( this.searchTerm.length > 0 ){
        // 1. If we are searching for something, show only MATCHES
        _showSection = false;
        if(topic === 'MATCHES') _showSection = true;
      } else if (this.collectSections === 1) {
        // 2. If we are not searching for something, and collectSections is on, show only ALL
        _showSection = false;
        if(topic === 'ALL') _showSection = true;
      } else {
        // 3. OTHERWISE, show all but MATCHES and ALL
        _showSection = true;
        if(topic === 'MATCHES' || topic === 'ALL') _showSection = false;
      }
      //
      return _showSection;
    },
    sortNumber(a, b) {
      // Same as above, but sorts items correctly (i.e., [10,1,1,2], becomes [1,1,2,10] and not [1,1,10,2])
      return a - b;
    },
    runTests(){
    },
    updateAllExpansions() {
      if(this.expandAllSections === 0 || this.expandAllSections === 1){
        var _trueOrFalse = this.expandAllSections;
        var hello = true;
        Object.keys(this.expandTopic).forEach( (x) => {this.expandTopic[x] = _trueOrFalse } );
        //console.log('!!!!!',this.expandTopic);
      }
    },
    toggleExpansion(x) {
      this.expandTopic[x] ?  this.expandTopic[x] = 0 : this.expandTopic[x] = 1;
      this.updateSelectionButtons()
    },
    updateSelectionButtons(){
      // Checking if all buttons are opened or closed ... updating the button as on respectively
      this.expandAllSections = 2; // '2' unhighlights those buttons
      var allVisiblePanels = 0;
      var openVisiblePanels = 0;
      Object.keys(this.expandTopic).forEach((topic)=>{
      //Object.keys(this.availableTopics).forEach((topic)=>{
        if(this.show(topic)){
          allVisiblePanels += 1;
          if(this.expandTopic[topic]){
            openVisiblePanels += 1;
          }
        }
      });

      // Converting expandAllSections to 0 or 1 in case all the visible panels are open or closed
      if(allVisiblePanels > 0 && openVisiblePanels == 0){
        this.expandAllSections = 0;
      } else if (allVisiblePanels > 0 && openVisiblePanels == allVisiblePanels){
        this.expandAllSections = 1;
      }
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss'>
@import '@/assets/css/vue-transition.css';

</style>
