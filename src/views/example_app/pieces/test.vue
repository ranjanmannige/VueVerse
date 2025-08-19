<template>
  <div class="inner-card">
    <div class='card-fixed'>
      THIS IS A HEADER 
      <simpleButton content='<i class="fas fa-expand"></i>' title='Release stuck nodes and fit network to frame'/>
    </div>
    
    <div class='card__scroll'>
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
      THIS IS A SCROLLABLE WINDOW
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

import toggleButton from '@/views/pieces/buttonToggle.vue';
import binaryButton from '@/views/pieces/buttonBinary.vue';
import simpleButton from '@/views/pieces/buttonSimple.vue';

import {pdfjsLib} from 'pdfjs-dist';

// import '@/assets/foundation-icons/foundation-icons.css';
// import '@/assets/fontawesome-free-5.13.0-web/css/all.min.css';

import * as jquery from 'jquery';
import * as path from 'path';

//import update from 'immutability-helper';

export default {
  data() {
    return {
      global: globalVariables(),
      local: localVariables(),
      topicToTermsDictionary: {}, // needed
      showPassages: [],
      clearSelections: 0,
      expandAllSections: 1,
      collectSections: 1,
      serverpath:'',
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
    };
  },
  props: {
  },
  components:{
    toggleButton,
    binaryButton,
    simpleButton,
  },
  mounted() {
    var vm = this;
    this.serverpath   = this.global.$commonvariables.serverpath;
    //this.updatePdfInfo();
    //this.calculateTermsToDisplay();
    // we need to wait for the elements dependent 
    
    nextTick(function () {
        vm.test();
    });
  },
  watch: {
    serverpath(){
      this.test();
    },
  },
  
  methods: {
    test(){
      console.log('This is a test')
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss'>
//@import '../../assets/css/template_crunch.scss';
//@import '@/assets/css/vue-transition.css';

</style>
