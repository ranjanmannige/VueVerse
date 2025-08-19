<template>
  <div class="inner-card"  id="divAtlas" ref="divAtlas" style="padding:5px !important; margin:0px !important;">
    <div class='card-fixed-spaced'  id="divAtlasNonGraph" ref="divAtlasNonGraph">
      <span>
        <span v-on:click="zoomFit(.95,500)">
          <simpleButton content='<i class="fas fa-expand"></i>' title='Release stuck nodes and fit network to frame'/>
        </span>
        <span v-on:click="releaseNodes()">
          <simpleButton content='<i class="fas fa-tape"></i>' title='Release stuck nodes and fit network to frame'/>
        </span>      
        
        <multipleButton v-bind:controllingVariable="graphToLoad"
                      v-bind:graphToLoadOptions="graphToLoadOptions"
                      v-on:update-controller="graphToLoad = $event"
                      xheader="GRAPHS"
                      title='Select graph type to display'/>
      </span>
      
      
      <!-- <graphControls v-bind:parentForceProperties="forceProperties"
                     v-on:update-force-properties="forceProperties=$event" /> -->
      <span>
        <span style='font-size:12px;'>
          <span v-if="showStyleDropdown">
            <span v-on:click="test()" class='clickme'><i class="fas fa-bug"></i></span> | 
            <i class="fas fa-caret-right" style='cursor:pointer;' v-on:click="showStyleDropdown = !showStyleDropdown"></i>
          </span>
          <span v-else v-on:click="showStyleDropdown = !showStyleDropdown">
            <i class="fas fa-caret-left" style='cursor:pointer;'></i>
          </span>
        </span>
      Style: 
      <!-- Notice that, in on v-on, we are passing an event, which ontains the value of the option selected -->
      <select v-on:change="modifyProperties($event.target.value)" v-model="selectedNetworkStyle"> 
        <option v-for='forcesettings,settingName in preSettings' v-bind:key='settingName' v-bind:value='settingName'>
                {{settingName}}
        </option>
      </select>
      &nbsp;
      <controlPanel style='z-index:1000000;' v-bind:parentProperties="displayProperties"  title="DISPLAY SETTINGS"
              panelTitle='<i class="fas fa-palette">'
              v-on:update-properties="displayProperties=$event" />
      &nbsp;
      <controlPanel style='z-index:1000000;' v-bind:parentProperties="filterProperties"  title="FILTER SETTINGS"
              panelTitle='</i><i class="fas fa-filter"></i>'
              v-on:update-properties="filterProperties=$event" />
      &nbsp;
      <controlPanel style='z-index:1000000;' v-bind:parentProperties="forceProperties"  title="FORCE SETTINGS"
              panelTitle='<i class="fas fa-flask"></i>'
              v-on:update-properties="forceProperties=$event" />
      </span>
    </div>
    <!-- <div class='card__scroll' id="divAtlas" style='margin:0px; padding:0px; background: red;'>   -->
    <div class='card-fixed' style="position:relative !important; text-align:center; margin:0px  !important; padding:0px !important; ">
      <!-- <span v-on:click="test()">test</span> -->
      <svg width="100%" height="100%" id="divAtlasSvg"></svg>
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
import { localVariables } from '../stores/local.js'

//import Vue from 'vue';
import {nextTick} from 'vue';
import { quantileSeq } from 'mathjs'

import * as JQuery from 'jquery';
//import * as d3 from 'd3'; // from https://levelup.gitconnected.com/d3-js-and-vue-js-7a6a721eb79f

import * as d3 from 'd3'
// WAS: var d3 = require('d3');
import * as cola from 'webcola';
// WAS: var cola = require('webcola')

//var jsnx = require('jsnetworkx');
import cytoscape from 'cytoscape';     // OR var cytoscape = require('cytoscape');
//import natural from 'natural';         // var natural = require('natural');
//import stopword from 'stopword'; // var stopword = require('stopword');

//import * as fib from 'force-in-a-box';

//import WordPOS from 'wordpos'; // 

import {calc} from '@/assets/js/jLouvain.js';
//import * as jLouvain from 'louvain';

//import * as greadability from '@/assets/js/greadability.js';

import { select } from 'd3-selection';
import { transition } from 'd3-transition';

//import VueSlider from 'vue-slider-component'
//import 'vue-slider-component/theme/default.css'


import toggleButton from '@/views/pieces/buttonToggle.vue';
import binaryButton from '@/views/pieces/buttonBinary.vue';
import simpleButton from '@/views/pieces/buttonSimple.vue';
import multipleButton from '@/views/pieces/buttonMultiple.vue';
//import graphControls from '@/views/pieces/graphControls.vue';
import controlPanel from '@/views/pieces/controlDropdownPanel.vue';

import exampleGraphObject from '@/assets/miserables.json';

export default {
  data() {
    return {
      global: globalVariables(),
      local: localVariables(),
      language: "EN", // for the natural POS tokenizer
      defaultCategory: 'N', // for the natural POS tokenizer
      defaultCategoryCapitalized: 'NNP', // for the natural POS tokenizer
      root:null,
      graph:null,
      data:{},
      showStyleDropdown: false, // a simple control for if the user gets to see the styles we can use
      links:null,//for v6
      nodes:null,//for v6
      color:null,//for v6
      drag:null,//for v6
      svg:null,//for v6
      chart:null,//for v6
      zoom:null,//for v6
      radius_min:2.5,// used by function `returnRadius()` & computed property `radius_default`
      radius_max:15,// used by function `returnRadius()` & computed property `radius_default`
      node:null,
      link:null,
      firstRender:true,
      labels:null,
      simulation: null,
      graphToLoad:'<i class="fas fa-book"></i>', // 
      graphToLoadOptions: ['Rels','Terms','Story', 'Story (small)', '<i class="fas fa-book"></i>','?'],
      value: 0.5,
      jsonFn: "/miserables.json", // placed in /client/public/
      resetNetwork: null,
      fullHeight: null, // check if 
      selectedNetworkStyle:"graph",
      graphSettings:{
        // all settings must have following keys
        // key : { minvalue: 0, value: 0.5, maxvalue: 1.0, valyeStep: 0.1, title: 'Link length' }
      },
      displayProperties: {
        'nodes'   : {'name':'NODES' ,'val':1,'type':'togglebutton' ,'hoverText':'Show radii.'},
        'labels'   : {'name':'LABELS' ,'val':1,'type':'togglebutton' ,'hoverText':'Show radii.'},
        'labels-scaling' : {'name':'Scale by' ,'val':1,'min':0.1,'max':10,'step':0.1, 'type':'slider' ,'hoverText':'Scale the size of the labels.'},
        'links'   : {'name':'EDGES' ,'val':1,'type':'togglebutton' ,'hoverText':'Show radii.'},
        'links-scaling' : {'name':'Scale by' ,'val':1,'min':0.1,'max':10,'step':0.1, 'type':'slider' ,'hoverText':'Scale the thickness of the labels.'},
      },
      filterProperties: {
        'node-filter' : {'name': 'NODE Filtering' ,'val':0,'min':0.0,'max':1,'step':0.05, 'type':'slider' ,'hoverText':'Limit nodes used by quantiled importance.'},
        'link-filter' : {'name': 'LINK Filtering' ,'val':0,'min':0.0,'max':1,'step':0.05, 'type':'slider' ,'hoverText':'Limit links used by quantiled importance.'},
        'label-scale' : {'name': 'LABEL Scaling' ,'val':1,'min':0.1,'max':5,'step':0.1, 'type':'slider' ,'hoverText':'Scale the size of the labels.'},
      },
      forceProperties: {
        'nodes'                   : {'name':'RADIUS' ,'val':1,'type':'togglebutton' ,'hoverText':'Something.'},
        'nodes-radius-multiplier' : {'name':'radius multiplier' ,'val':1,'min':0.5,'max':10,'step':0.5, 'type':'slider' ,'hoverText':'The multiplier for each radius.'},
        'nodes-radius-coupling'   : {'name':'Radius coupled to' ,'val':'degree','options':['degree','closeness','betweenness'], 'type':'dropdown' ,'hoverText':'How the radius is scaled.'},
        'nodes-radius-min'        : {'name':'Min' ,'val':2.5,'min':0.5,'max':5,'step':0.5,'type':'slider' ,'hoverText':'How the radius is scaled.'},
        'nodes-radius-max'        : {'name':'Max' ,'val':15,'min':1,'max':30,'step':1,'type':'slider' ,'hoverText':'How the radius is scaled.'},        
        'center'   : {'name':'CENTER' ,'val':1,'type':'togglebutton' ,'hoverText':'Something.'},
        'center-x' : {'show':false, 'name':'x' ,'val': 0.5, 'min': 0, 'max': 1, 'step':0.1, 'type':'slider' ,'hoverText':'Something.'},
        'center-y' : {'show':false,'name':'y' ,'val': 0.5, 'min': 0, 'max': 1, 'step':0.1, 'type':'slider' ,'hoverText':'Something.'},
        'charge'   : {'name':'CHARGE' ,'val':1,'type':'togglebutton' ,'hoverText':'Something.'},
        'charge-strength': 
                     {'name':'strength' ,'val':-10,'min':-10,'max':10,'step':1, 'type':'slider' ,'hoverText':'Something.'},
        // REPLACED by `radius`
        // 'charge-distance-min': 
        //             {'show':false, 'name':'min distance' ,'val':1,'min':0.5,'max':10,'step':0.1, 'type':'slider' ,'hoverText':'Something.'},
        'charge-distance-max': 
                     {'show':false, 'name':'max distance' ,'val':300,'min':10,'max':500,'step':10, 'type':'slider' ,'hoverText':'Something.'},
        'collide'  : {'name':'COLLIDE' ,'val':0, 'type':'togglebutton' ,'hoverText':'Something.'},
        'collide-strength'  : 
                     {'name':'strength' ,'val':0.7,'min':0,'max':10,'step':0.1, 'type':'slider' ,'hoverText':'Something.'},
        'collide-iterations'  : 
                     {'show':false, 'name':'iterations' ,'val':1,'min':1,'max':5,'step':1, 'type':'slider' ,'hoverText':'Something.'},
        'link'     : {'name':'LINK' ,'val':1, 'type':'togglebutton' ,'hoverText':'Something.'},
        'link-strength': 
                     {'name':'strength (experimental)', 'val':'normal','options':['weak','normal','strong'], 'type':'dropdown' ,'hoverText':'Strength of the links.'},
        'link-distance': 
                     {'name':'distance' ,'val':30,'min':0,'max':100,'step':1, 'type':'slider' ,'hoverText':'Something.'},
        'link-iterations'  : 
                     {'show':false, 'name':'iterations' ,'val':1,'min':1,'max':5,'step':1, 'type':'slider' ,'hoverText':'Something.'},
      },
      linkStrength:undefined,
      preSettings: {
        'graph' : {
          'forces':{'charge'          : {'val':1,},
                    'charge-strength' : {'val':-10},
                    'collide'         : {'val':0},
                    'link'            : {'val':1},},
          'display':{'nodes':{'val':1}, 'labels':{'val':1}, 'links':{'val':1}},
        },
        'bubbles' : {
          'forces':{'charge'          : {'val':1,},
                    'charge-strength' : {'val':4},
                    'collide'         : {'val':1},
                    'collide-strength': {'val':2},
                    'link'            : {'val':0},},
          'display':{'nodes':{'val':1}, 'labels':{'val':0}, 'links':{'val':0}},
        },
        'spread' : {
          'forces':{'charge'          : {'val':1,},
                    'charge-strength' : {'val':-5},
                    'collide'         : {'val':1},
                    'collide-strength': {'val':2},
                    'link'            : {'val':0},},
          'display':{'nodes':{'val':1}, 'labels':{'val':1}, 'links':{'val':0}},
        },
        'popcorn' : {
          'forces':{'charge'          : {'val':1,},
                    'charge-strength' : {'val':10},
                    'collide'         : {'val':1},
                    'collide-strength': {'val':10},
                    'link'            : {'val':0},},
          'display':{'nodes':{'val':1}, 'labels':{'val':1}, 'links':{'val':0}},
        },
      },
    };
  },
  props: {
    parentFlatDoc: Array,
    parentResetNetwork: Boolean,
    parentTopicToTermsDictionary: Object,
    parentShowPassages: Array,
  },
  components:{
    toggleButton,
    binaryButton,
    simpleButton,
    multipleButton,
    //VueSlider,
    //graphControls,
    controlPanel,
  },
  computed: {
    // 
    radius_default(){
      return this.forceProperties['nodes-radius-min'].val + (this.forceProperties['nodes-radius-max'].val - this.forceProperties['nodes-radius-min'].val)/4;
    },
    node_minmax(){
      var all_rs = []
      //this.data['nodes'].forEach((n,ix) => { all_rs.push(n['degree']) });
      this.data['nodes'].forEach((n,ix) => { all_rs.push(n[this.forceProperties['nodes-radius-coupling'].val]) });
      return {
               'min':Math.min(...all_rs), 'max':Math.max(...all_rs),
              //'mean':Math.mean(...all_rs), 'median':Math.median(...all_rs)
            };
    },
    flatDoc(){
      return this.parentFlatDoc;
    },
    sortedTopics() {
      // sort by Object.keys(this.topicToTermsDictionary).sort();
      var sortedTerms = Object.keys(this.topicToTermsDictionary).sort();
      return sortedTerms;
    },
  },
  watch: {
    forceProperties:   { handler: 'updateForceProperties',   deep: true },
    displayProperties: { handler: 'updateDisplayProperties', deep: true },
    //forceProperties: { handler: 'updateGraph', deep: true },
    //graph: { handler: 'startNetwork', deep: true },
    flatDoc: { handler: 'startNetwork', deep: true },
    graphToLoad(){
      //console.log('GRAPHTOLOADCHANGED!')
      this.startNetwork();
    },
    parentResetNetwork(){
      // in case data in other windows require that the network be reset 
      // (this is set by the parent)
      this.resetNetwork = this.parentResetNetwork;
    },
    async resetNetwork(){
      // Activity of starting or restarting the network 
      if(this.resetNetwork === true){
        // Only needed if resetNetwork was moved from something else to 'true'
        console.log('RESTARTING NETWORK!')
        
        if(this.firstRender){
          // First time we are rendering something... we need to set up a lot of stuff
          this.startNetwork();
          this.firstRender = false;
        } else {
          // First time rendering has been completed before, now we only make small changes
          var targetHeight = JQuery("#divAtlas").height() - JQuery("#divAtlasNonGraph").height();
          var targetWidth  = JQuery("#divAtlas").width();
          await nextTick(); // waiting for the window to resize
          targetHeight = JQuery("#divAtlas").height() - JQuery("#divAtlasNonGraph").height();
          targetWidth  = JQuery("#divAtlas").width();

          //JQuery("#divAtlas").height()
          
          this.width        = targetHeight;
          this.height       = targetWidth;

          this.svg = d3.select("#divAtlasSvg") //d3.create("svg")
                .attr("height", targetHeight)
                .attr("width", targetWidth)
                .attr("viewBox", [0, 0, targetWidth, targetHeight]);
          this.zoomFit(0.95, 500);
        }
        //this.startNetwork();
        //this.zoomFit(0.95, 500);
        this.resetNetwork = false;
        this.$emit('update-reset-network',this.resetNetwork);
      }
    },
    /* fullHeight(){
      console.log('fullHeight',this.fullHeight);
    } */
  },
  ready: function () {
    this.fullHeight = this.$refs.divAtlas.clientHeight;
  },
  mounted() {
    this.resetNetwork = this.parentResetNetwork;
  },
  methods: {
    modifyProperties(style){ // 
      //var style = event.target.value; // getting values from select/option clusters is annoying
      //console.log('style',style);
      
      for(const parameterKey in this.preSettings[style]['forces']) {
        //
        var parameters = this.preSettings[style]['forces'][parameterKey];
        //console.log(parameterKey);
        for(const valueKey in parameters){
          //console.log(valueKey,'OLD:',this.forceProperties[parameterKey][valueKey],'NEW:',parameters[valueKey]);
          this.forceProperties[parameterKey][valueKey] = parameters[valueKey];
        }
      }
      for(const parameterKey in this.preSettings[style]['display']) {
        //
        //'display':{'nodes':{'val':1}, 'labels':{'val':1}, 'links':{'val':1}},
        var parameters = this.preSettings[style]['display'][parameterKey];
        for(const valueKey in parameters){
          this.displayProperties[parameterKey][valueKey] = parameters[valueKey];
        }
      }
    },
    printProperties(){
      console.log('properties',this.forceProperties);
    },
    test(){
      //console.log('this.flatDoc',this.flatDoc);
      //var selection = d3.selectAll(".selected");
      console.log('parentFlatDoc',this.parentFlatDoc);
      //console.log('selection',selection[0].id);
    },
    getTransformation(transform) {
      // Create a dummy g for calculation purposes only. This will never
      // be appended to the DOM and will be discarded once this function 
      // returns.
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      
      // Set the transform attribute to the provided string value.
      g.setAttributeNS(null, "transform", transform);
      
      // consolidate the SVGTransformList containing all transformations
      // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
      // its SVGMatrix. 
      var matrix = g.transform.baseVal.consolidate().matrix;
      
      // Below calculations are taken and adapted from the private function
      // transform/decompose.js of D3's module d3-interpolate.
      var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
      // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
      var scaleX, scaleY, skewX;
      if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
      if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
      if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
      if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
      return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * 180 / Math.PI,
        skewX: Math.atan(skewX) * 180 / Math.PI,
        scaleX: scaleX,
        scaleY: scaleY
      };
    },
    zoomFit(paddingPercent, transitionDuration) {
      //d3.event.transform',d3.event);//.transform);
      //var root = d3.selectAll('g');//.node();
      var root = d3.select(".everything");//.node();
      
      if(root === null || root === undefined) return false;
      
      if(root.node()=== null || root.node() === undefined) return false;

      var bounds = root.node().getBBox(); //.node().getBoundingClientRect();
      var parent = root.node().parentElement;
      
      var parent = d3.select("#divAtlasSvg");
      //var fullWidth = parent.height, fullHeight = parent.width;
      var fullWidth = this.width, fullHeight = this.height;
      
      var width = bounds.width,
          height = bounds.height;
      
      var midX = bounds.x + width / 2,
          midY = bounds.y + height / 2;
      if (width == 0 || height == 0) return; // nothing to fit

      
      var scale = (1 || 0.5) / Math.max(width / fullWidth, height / fullHeight);
      //var scale = 1.5 / Math.max(width / fullWidth, height / fullHeight);
      var translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];
      
      

      // This code looks like it works, but then using the mouse reverts to original
      // zoom and skew. Likely because the zoom objects are not shared with main code
      // see http://bl.ocks.org/TWiStErRob/b1c62730e01fe33baa2dea0d0aa29359
      //d3.select(".everything")
      // don't use this anymore, but if the zoom.transform 
      
      this.svg.transition()
         .duration(transitionDuration || 0) // milliseconds
         .call(this.zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
      /*
      root
         .transition()
         .duration(transitionDuration || 0) // milliseconds
         .attr('transform',
             'translate('+translate[0]+','+translate[1]+')'
             +   ' scale(' + scale     + ')');
      */
      
      //d3.select(".everything").attr("transform", t); //"translate("+ (vm.width + t.x) + "," + (vm.height + t.y)  + ") scale(" + t.k + ")");
      //d3.select(".everything").zoom(d3.zoom().on("zoom", this.zoomed(t)));
      //d3.select(".everything").on("zoom", null);
      //this.svg.on("zoom", null);

      //attr("transform", function(d) {
      //  console.log("translate(" + (d.x + translate[0]) + "," + (d.y+translate[1]) + ")");
        //return "translate(" + (d.x + translate[0]) + "," + (d.y+translate[1]) + ")"+' scale(' + scale     + ')'
      //  return "translate(" + translate[0] + "," + translate[1] + ")" //+' scale(' + scale     + ')'
      //});
      
      // FOLLOWING IS THE RIGHT WAY TO DO THINGS, BUT HAVE TO FIGURE OUT HOW TO 
      // SHARE ZOOM OBJECT BEFORE BREAKING OTHER CODE
      /*
      // Build a new zoom transform (using d3.zoomIdentity as a base)
      var transform = d3.zoomIdentity
        .scale( scale ) 
        .translate( translate );  
      var root = d3.select(".everything")
        .transition()
        .duration(transitionDuration || 0) // milliseconds
        .call(zoom.transform, transform);
      */
    },
    releaseNodes(){
      // Checking if any nodes need releasing (fx or fy attributes will be truthy)
      var release_the_nodes = false;
      var vars = [];
      this.nodes.forEach((d,ix)=>{
        if(!vars.includes(d.fx)) vars.push(d.fx);
        if(!vars.includes(d.fy)) vars.push(d.fy);
        if( d.fx || d.fy ) release_the_nodes = true;
      });

      if(release_the_nodes === true){
        this.nodes.forEach((d,ix)=>{
          this.nodes[ix].fy = null;
          this.nodes[ix].fx = null;
        });
        this.simulation.alpha(1).restart();
      }
      //
    },
    loadTopics(){
      var nodes = [];
      var rels  = [];
      var graph = {'links':[],'nodes':[]}
      //console.log('this.flatDoc',this.flatDoc);
      this.flatDoc.forEach((passage,pId)=>{
        const source = 'p'+pId;
        // e.g. node: { "id": "Myriel", "group": 1 },
        if(nodes.indexOf(source) === -1)  {
          nodes.push(source);
          graph['nodes'].push({'id':source,'group':1});
        }

        // skip if pterms is not available
        if(!passage['pTerms']) {
           pass; //continue; 
        } else {
          passage['pTerms'].forEach((term)=>{
            //
            
            const target = term['term'];
            const link = 'FoundIn';
            
            if(nodes.indexOf(target) === -1)  {
              nodes.push(target);
              graph['nodes'].push({'id':target,'group':1});
            }
            //
            // e.g. link: { "source": "Mme.Hucheloup", "target": "Enjolras", "value": 1 }
            //
            var rel = (source,target);
            if(rels.indexOf(rel) === -1)  {
              rels.push(rel);
              graph['links'].push({'source':source,'target':target,'weight':1});
            }
          });
        }
      });
      return graph;
    },
    phrases(){
      
    },
    loadStory(showCommunityGraph=false){
      
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // Turned off because the system crawls when more than one 
      // document is selected
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      return {'links':[{"source":"Currently turned off", "target":"... compute is costly!", "value":10, "weight":1}],
              'nodes':[{"id":"Currently turned off","group":1},{"id":"... compute is costly!", "group":2}]}
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // UNCOMMENT THE RETURN STATEMENT ABOVE TO TRY OUT THE NLP 
      // ANALYSIS BELOW
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

      //var tokenizer = new natural.WordTokenizer();
      //var wordpos = new WordPOS();
      // tokenizers (sent and word)
      var wordTokenizer = new natural.TreebankWordTokenizer();
      var sentTokenizer = new natural.SentenceTokenizer();
      var paraTokenizer = new natural.RegexpTokenizer({pattern: /\n\n+/});

      // for the POS tagger
      var lexicon = new natural.Lexicon(this.language, this.defaultCategory, this.defaultCategoryCapitalized);
      var ruleSet = new natural.RuleSet(this.language);
      var POStagger = new natural.BrillPOSTagger(lexicon, ruleSet);

      // The POS abbreviations below were obtained from README.md avilable in the most recent distribution 
      // of jsPOS, downloadable here: https://code.google.com/archive/p/jspos/downloads
      // The list was manually parsed and split into POS_disallowed and POS_allowed
      const POS_disallowed = [
        'CC', // Coord Conjuncn          and,but,or
        'DT', // Determiner              the,some
        'EX', // Existential there       there
        'IN', // Preposition             of,in,by
        'LS', // List item marker        1,One
        'MD', // Modal                   can,should
        'POS',// Possessive ending       �s
        'PP$',// Possessive pronoun      my,one�s
        'PRP',// Personal pronoun        I,you,she
        'SYM',// Symbol                  +,%,&
        'TO', // �to�                    to
        'WDT',// Wh-determiner           which,that
        'WP', // Wh pronoun              who,what
        'WP$',// Possessive-Wh           whose
        ',',  // Comma                   ,
        '.',  // Sent-final punct        . ! ?
        ':',  // Mid-sent punct.         : ; �
        '"',  // quote                   "
        '(',  // Left paren              (
        ')',  // Right paren             )
      ]
      const POS_allowed = [
        'CD',  // Cardinal number         one,two
        'FW',  //Foreign Word             mon dieu
        'JJ',  //Adjective                big
        'JJR', //Adj., comparative        bigger
        'JJS', //Adj., superlative        biggest
        'NN',  //Noun, sing. or mass      dog
        'NNP', //Proper noun, sing.       Edinburgh
        'NNPS',//Proper noun, plural     Smiths
        'NNS', //Noun, plural            dogs
        'PDT', //Predeterminer           all, both
        'RB',  // Adverb                 quickly
        'RBR', // Adverb, comparative    faster
        'RBS', // Adverb, superlative    fastest
        'RP',  // Particle               up,off
        'UH',  // Interjection           oh, oops
        'VB',  // verb, base form        eat
        'VBD', // verb, past tense       ate
        'VBG', // verb, gerund           eating
        'VBN', // verb, past part        eaten
        'VBP', // Verb, present          eat
        'VBZ', // Verb, present          eats
        'WRB', // Wh-adverb              how,where
        '$',   // Dollar sign            $
        '#',   // Pound sign             #
      ]
      const explicitly_ignore = ['is','are','then','when','so'];
      // for punctuation removal
      var punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~“”–’';
      //
      var NGrams = natural.NGrams;
      var nodes = [];
      var rels  = [];
      
      const first_pass_window = 2; 
      const second_pass_window = 5;

      // 1. Getting tokenized sentences
      var all_tokens = [];
      // putting spacers in front of each passage, para, and sentence, if desired
      const passage_spacer = 0; // the space between each passage will be passage_spacer+para_spacer
      const para_spacer = second_pass_window;
      const sent_spacer = 0; // we want messages within a paragraph to be more coherent
      const spacer_token_symbol = 'xyz';
      // Array(3).fill('aha') == ['aha','aha','aha'];
      const passage_spacer_tokens = Array(passage_spacer).fill(spacer_token_symbol);
      const para_spacer_tokens = Array(para_spacer).fill(spacer_token_symbol);
      const sent_spacer_tokens = Array(sent_spacer).fill(spacer_token_symbol);
      // going through the passages
      this.flatDoc.forEach((passage,pId)=>{
        // adding the passage spacer 
        all_tokens.concat(passage_spacer_tokens);
        // splitting a passage into paras
        const current_paras = paraTokenizer.tokenize(passage['pRaw']);
        for(const _paraIx in current_paras){
          // adding para spacers
          all_tokens = all_tokens.concat(para_spacer_tokens);
          // splitting a paragraph into sentences
          const current_sentences = sentTokenizer.tokenize(current_paras[_paraIx]);
          for(var _sentIx in current_sentences){
            // adding sent spacers
            all_tokens = all_tokens.concat(sent_spacer_tokens);
            //
            // splitting a sentence into words
            const _full_sent = wordTokenizer.tokenize(current_sentences[_sentIx]);
            var _final_sent = [];
            if(true){
              // Chosing tokens based on POS
              // splitting a sentence into words
              const _full_sent = wordTokenizer.tokenize(current_sentences[_sentIx]);
              const POS = POStagger.tag(_full_sent);
              for(var _ix in POS['taggedWords']){
                const abbreviated_tag = POS['taggedWords'][_ix]['tag'];
                if(POS_allowed.includes(abbreviated_tag)){ // could also use the next if statement (when the lists are settled on, one will be more efficient than the other)
                //if(!POS_disallowed.includes(abbreviated_tag)){
                  const _current_token = POS['taggedWords'][_ix]['token'].toLowerCase();
                  if(!explicitly_ignore.includes(_current_token)){
                    _final_sent.push(_current_token);
                  }
                }
              }
              // Removing stop words if any are still present
              _final_sent = stopword.removeStopwords(_final_sent);
            } else {
              // using all tokens that are not stop words
              // cleaning up
              const _full_sent_sans_stopwords = stopword.removeStopwords(_full_sent);
              var _final_sent = _full_sent_sans_stopwords.filter(function(_) {return punctuation.indexOf(_) === -1;});
              // last step could involve a lemmatizer/stemmer
              // e.g., _final_sent = natural.PorterStemmer.stem(_final_sent)
            }
            if(_final_sent.length > 0){
              all_tokens = all_tokens.concat(_final_sent);
            }
          }
        }
      });
      //console.log("all_tokens.length",all_tokens.length, all_tokens.length === 0);
      if(all_tokens.length === 0){
        // PROBABLY HAVE NOTHING LOADED, SOE WE RETURN NOTHING
        var _graph = {'links':[{"source":"Data", "target":"... not yet available", "value":10, "weight":1}],
                   'nodes':[{"id":"Data","group":1},{"id":"... not yet available", "group":2}]}
        return _graph;
      }
      // Window searching
      //all_tokens = ['a','b','c','d','e']
      // | | | | |
      //   1 2 3 4 <-- distance
      //   4 3 2 1 <-- weights
      var distance_weights = {}
      for(var _i=1; _i<second_pass_window; _i++){
        distance_weights[_i] =  second_pass_window-_i;
      }
      // Getting edges, weighted by proximity and incidence within the text
      var pairs_to_weight = {};
      var windows = [second_pass_window]
      for(var windowIx in windows){
        var _current_window =  windows[windowIx];
        for(let _i=0; _i < all_tokens.length; _i++){
          const tokeni = all_tokens[_i];
          if(tokeni != spacer_token_symbol){
            for(let _j=1; _j < _current_window; _j++){
              const tokenj = all_tokens[_i+_j];
              if(tokenj && tokenj != spacer_token_symbol){
                var _sorted_tuple = [tokeni,tokenj];
                _sorted_tuple.sort();
                if(!(_sorted_tuple in pairs_to_weight)){
                  pairs_to_weight[_sorted_tuple] = 0;
                }
                pairs_to_weight[_sorted_tuple] += distance_weights[_j];
              }
            }
          }
        };
      };
      //
      var histogram = {};
      var deme = 0;
      for(var i in pairs_to_weight){
        var val = pairs_to_weight[i];
        if(!(val in histogram)){
          histogram[val] = 0
        }
        histogram[val] += 1;
      }
      //
      //var graph = {'links':[],'nodes':[]};
      var cy = cytoscape({});
      var existingNodes = [];
      //var existingEdges = [];
      for(var flatpair in pairs_to_weight){
        //
        const pair = flatpair.split(',');
        //
        const n1 = pair[0];
        const n2 = pair[1];
        const weight = pairs_to_weight[flatpair];
        //
        for(var _nix in pair){
          const _n = pair[_nix];
          if(! existingNodes.includes(_n)){
            cy.add({data: { type:'node', id: _n, group: 1 }})
            //graph['nodes'].push({'id':_n,'group':1});
            existingNodes.push( _n );
          }
        }
        //
        cy.add({data: { type:'edge', id: flatpair, source: n1, target: n2, weight: weight } });
        //graph['links'].push({'source':n1, 'target':n2, 'weight':weight});
        //
      };
      //
      const closeness_centrality   = cy.elements().closenessCentralityNormalized();
      const degree_centrality      = cy.elements().degreeCentralityNormalized();
      const betweenness_centrality = cy.elements().betweennessCentrality();
      //
      var nodesForLouvain = [];
      cy.nodes().forEach( n => {
        var data = n.data();
        nodesForLouvain.push(data['id']);
        //console.log('closeness',closeness_centrality.closeness( n ))
        //console.log('degree',degree_centrality.degree( n ))
        //console.log('betweenness',betweenness_centrality.betweennessNormalized( n ))
      } );
      var linksForLouvain = [];
      cy.edges().forEach( n => {
        var data = n.data();
        linksForLouvain.push({'source':data['source'],'target':data['target'], 'weight':data['weight']});
      } );
      /*
      // Another way to collect nodes, but via the in-house _graph
      let nodesForLouvain = [];
      graph['nodes'].forEach((n) => { 
        nodesForLouvain.push(n['id']) 
      });
      var linksForLouvain = graph['edges'];
      */
      // ----------------------------------------------------------------
      // Calculating communities
      let community = calc().nodes(nodesForLouvain).edges(linksForLouvain);
      let community_result = community();
      //
      //graph['nodes'].forEach((n,ix) => {
      //  graph['nodes'][ix]['group'] =  community_result[n.id]
      //  graph['nodes'][ix]['community'] =  community_result[n.id]
      //});
      //graph['perform_analysis'] = true;
      // ----------------------------------------------------------------
      // Pruning some unimportant nodes
      // 1. getting the centralities per node
      var betweenness_centralities = [];
      var node_to_betweenness = {}
      cy.nodes().forEach( n => {
        var data = n.data();
        var _betweenness = betweenness_centrality.betweennessNormalized( n );
        betweenness_centralities.push(_betweenness);
        node_to_betweenness[data['id']] = _betweenness;
      } );
      // min deletion threshold
      const min_existence_threshold = quantileSeq(betweenness_centralities, 0.0);
      // making a list of nodes to delete
      var delete_nodes = [];
      cy.nodes().forEach( n => {
        var data = n.data();
        var _betweenness = betweenness_centrality.betweennessNormalized( n );
        if(_betweenness < min_existence_threshold){
          delete_nodes.push(data['id'])
        }
    });
      // MAKING A NEW GRAPH OBJECT!
      var graph = {'links':[],'nodes':[]}; 
      cy.nodes().forEach( n => {
        const data = n.data();
        const nodeId = data['id']
        if(!delete_nodes.includes( nodeId )) graph['nodes'].push({'id':nodeId,'group':1, 'betweenness':node_to_betweenness[nodeId]});
      });
      cy.edges().forEach( n => {
        const data = n.data();
        const n1     = data['source'] 
        const n2     = data['target']
        const weight = data['weight']
        //console.log(data)
        if(delete_nodes.includes( n1 ) || delete_nodes.includes( n2 )) {
          //pass
        } else {
          graph['links'].push({'source':n1, 'target':n2, 'weight':weight});
        }
      });
      //
      // getting a community's participants
      var community_to_node = {};
      for(var _node in community_result){
        const _community_id = community_result[_node];
        // creating an entry if the community does not exist yet
        if(!(_community_id in community_to_node))community_to_node[_community_id] = [];
        // adding the node to the community
        community_to_node[_community_id].push(_node)
      }
      //console.log('community_to_node',community_to_node);
      //
      // getting community names from the top N nodes
      const max_nodes_to_display = 3       // top N
      var community_to_community_name = {} // 
      var community_name_to_community = {}
      for(var communityId in community_to_node){
        var node_betweenness_tuples = []
        //console.log(communityId)
        for(var nodeIx in community_to_node[communityId]){
          const nodeId = community_to_node[communityId][nodeIx];
          //console.log(nodeId,node_to_betweenness);
          node_betweenness_tuples.push([nodeId,node_to_betweenness[nodeId]])
        }
        // sorting based on the second item (betweenness or any other metric added above)
        //node_betweenness_tuples.sort(function(a, b) { return a[1] > b[1] ? 1 : -1; });
        node_betweenness_tuples.sort(function(a, b){return b[1]-a[1]}); // reverse sort
        //
        var node_shortlist = node_betweenness_tuples.slice(0,max_nodes_to_display);
        var community_name  = '';
        for(var ix in node_shortlist){
          if(ix > 0) community_name += '--';
          community_name += node_shortlist[ix][0];
        }
        community_to_community_name[communityId] = community_name;
        community_name_to_community[community_name] = communityId;
      }
      //
      // getting a node's neighbors
      var node_to_neighbors = {}
      var community_to_neighbors = {}
      var community_to_name = {}
      var community_edge_weights = {}
      console.log("community_to_community_name",community_to_community_name);
      cy.edges().forEach( n => {
        const data = n.data();
        const n1     = data['source'] 
        const n2     = data['target']
        const weight = data['weight']
        const c1 = community_result[n1];
        const c2 = community_result[n2];
        //
        // possibly filter by weight
        // ...
        // populating the neighbor list
        if(!(n1 in node_to_neighbors)) node_to_neighbors[n1] = [];
        if(!(n2 in node_to_neighbors)) node_to_neighbors[n2] = [];
        if(!(node_to_neighbors[n1].includes(n2))) node_to_neighbors[n1].push(n2);
        if(!(node_to_neighbors[n2].includes(n1))) node_to_neighbors[n2].push(n1);
        //
        // Finding if the two nodes belong to different communities
        if(c1 !== c2){ 
          const cname1 = community_to_community_name[c1];
          const cname2 = community_to_community_name[c2];
          // for our records
          if(!(c1 in community_to_name)) community_to_name[c1] = cname1;
          if(!(c2 in community_to_name)) community_to_name[c2] = cname2;
          // for graph building
          if(!(cname1 in community_to_neighbors)) community_to_neighbors[cname1] = [];
          if(!(cname2 in community_to_neighbors)) community_to_neighbors[cname2] = [];
          // there could be many connections between cname1 and cname2; we should normalize that in the next step with some kind of weight
          community_to_neighbors[cname1].push(cname2);
          community_to_neighbors[cname2].push(cname1);
          //
          var edgeNameTuple = [cname1,cname2];
          edgeNameTuple.sort();
          var edgeName = edgeNameTuple[0]+'=>'+edgeNameTuple[1]
          if(!(edgeName in community_edge_weights)) community_edge_weights[edgeName]=0;
          community_edge_weights[edgeName]+=weight;
        }
      });
      // collecting edge weights to trim edge weights:
      var _communityEdgeWeightsOnly = [];
      for(var edgeName in community_edge_weights) _communityEdgeWeightsOnly.push(community_edge_weights[edgeName]);
      var communityEdgeWeightThreshold = 0;
      if(_communityEdgeWeightsOnly.length > 10) { // lets say that we should have at least 10 community links before we start to look to prune 
        communityEdgeWeightThreshold = quantileSeq(_communityEdgeWeightsOnly, 0.0); // 0 -> no filter; 0.5 -> ~50% of your edges will be pruned
      }
      // finally, populating a new graph object
      var _community_graph = {'links':[],'nodes':[]};
      var existingNodes = [];
      var existingEdges = [];
      for(var edgepair in community_edge_weights){
        // getting each edge pair
        var edgePairTuple = edgepair.split('=>');
        var n1 = edgePairTuple[0];
        var n2 = edgePairTuple[1];
        var weight = community_edge_weights[edgepair];
        //console.log(n1,n2,weight)
        
        //
        if(weight > communityEdgeWeightThreshold){
          for(var _nix in edgePairTuple){
            const _n = edgePairTuple[_nix];
            if(!existingNodes.includes(_n)){
              const communityID = community_name_to_community[_n]
              //cy.add({data: { type:'node', id: _n, group: communityID }})
              var degree = community_to_neighbors[_n].length;
              _community_graph['nodes'].push({'id':_n, 'group':communityID, 'degree':degree});
              existingNodes.push( _n );
            }
          }
          //
          //cy.add({data: { type:'edge', id: flatpair, source: n1, target: n2, weight: weight } });
          _community_graph['links'].push({'source':n1, 'target':n2, 'weight':weight});
        } else {
          // console.log("Edge ignored for low weight:", edgepair);
        }
      }
      //console.log("_community_graph",_community_graph)
      // very important: if you don't copy the '_community_graph' to the 'graph' variable, then it will not be rendered in the UI
      if(showCommunityGraph===true){
        graph = _community_graph;
        graph['perform_analysis'] = false;
      } 
      /* 
      for(var community1 in community_to_neighbors){
        for(var cix2 in community_to_neighbors[community1]){
          const community2 = community_to_neighbors[community1][cix2];
          var edgetuple = [community1,community2];
          edgetuple.sort(); // in place
          console.log(edgetuple[0]+'=>'+edgetuple[1]);
        }
      } */
      //_community_graph['nodes'].push({'id':_n,'group':1});
      //_community_graph['links'].push({'source':n1, 'target':n2, 'weight':weight});
      //console.log("community_to_node",community_to_node);
      //
      console.log('DONEDONEDONE');
      /*
      var existingNodes = [];
      var existingEdges = [];
      var cy = cytoscape({});
      for(var flatpair in pairs_to_weight){
        //
        const pair = flatpair.split(',');
        //
        const n1 = pair[0];
        const n2 = pair[1];
        const weight = pairs_to_weight[flatpair];
        //
        for(var _nix in pair){
          const _n = pair[_nix];
          if(! existingNodes.includes(_n)){
            cy.add({data: { type:'node', id: _n, group: 1 }})
            existingNodes.push( _n );
          }
        }
        //
        console.log(flatpair);
        cy.add({data: { type:'edge', id: flatpair, source: n1, target: n2, weight: weight } });
      };
      //

      //
      existingNodes = [];
      var cy = cytoscape({});
      //
      console.log("DONE!");
      */
      //
      if(false){
        // ----------------------------------------------------------------
        // Converting to Cytoscape, and calculating for a largest sub-component
        
        //
        const closeness_centrality = cy.elements().closenessCentralityNormalized();
        const degree_centrality = cy.elements().degreeCentralityNormalized();
        const betweenness_centrality = cy.elements().betweennessCentrality()
        //
        /* cy.nodes().forEach( n => {
          console.log(n)
          console.log('closeness',closeness_centrality.closeness( n ))
          console.log('degree',degree_centrality.degree( n ))
          console.log('betweenness',betweenness_centrality.betweennessNormalized( n ))
        } ); */
        //
        // calculate components
        var components = cy.elements().components();
        //
        // Iterate through components
        for(var componentIx = 0; componentIx < components.length; componentIx++){
          if(graph['nodes'].length <= 200){
            components[componentIx].each((e)=>{
              var data = e.data();
              if(data.type === 'node'){
                graph['nodes'].push({
                                     "id":data.id,"component":componentIx+1,
                             'closeness':closeness_centrality.closeness( e ), 
                                 'degree': degree_centrality.degree( e ),
                            'betweenness':betweenness_centrality.betweennessNormalized( e )
                                 })
              } else {
                graph['links'].push({"source":data.source,"target":data.target,value:10})
              }
            });
          }
        }
        // ----------------------------------------------------------------
        // Calculating communities
        let nodesForLouvain = [];
        graph['nodes'].forEach((n) => nodesForLouvain.push(n['id']) );
        let community = calc().nodes(nodesForLouvain).edges(graph['links']);
        let result = community();
        //
        graph['nodes'].forEach((n,ix) => {
          graph['nodes'][ix]['group']     =  result[n.id]
          graph['nodes'][ix]['community'] =  result[n.id]
        });
        // ----------------------------------------------------------------
      }  
      //
      //console.log('tokenized_sentences',tokenized_sentences);
      //var graph = {'links':[],'nodes':[]}
      //
      return graph;
    },
    loadRels(){
      var nodes = [];
      var rels  = [];
      var graph = {'links':[],'nodes':[]}
      this.flatDoc.forEach((passage)=>{
        if(passage['pRels'] !== undefined){
          passage['pRels'].forEach((rel)=>{
            const source = rel[0];
            const link   = rel[1];
            const target = rel[2];
            // e.g. node: { "id": "Myriel", "group": 1 },
            if(nodes.indexOf(source) === -1)  {
              nodes.push(source);
              graph['nodes'].push({'id':source,'group':1});
            }
            if(nodes.indexOf(target) === -1)  {
              nodes.push(target);
              graph['nodes'].push({'id':target,'group':1});
            }
            //
            // e.g. link: { "source": "Mme.Hucheloup", "target": "Enjolras", "value": 1 }
            //
            var rel = (source,target);
            if(rels.indexOf(rel) === -1)  {
              rels.push(rel);
              graph['links'].push({'source':source,'target':target,'weight':1});
            }
          });
        }
      });
      //console.log(graph);
      var nodes = [];
      var rels  = [];
      var graph = {'links':[],'nodes':[]}
      return graph;
    },
    returnGraphObject(){
      //graphToLoadOptions: ['Rels','Terms','?'],
      var _graph = {'links':[{"source":"Data", "target":"... not yet available", "value":10, "weight":1}],
                   'nodes':[{"id":"Data","group":1},{"id":"... not yet available", "group":2}]}
      this.selectedNetworkStyle = 'graph'; this.modifyProperties('graph'); // conceptually, we should merge the two actions here
      //
      if(this.graphToLoad === '<i class="fas fa-book"></i>'){ 
        // DUMMY GRAPH for instruction purposes
        _graph = exampleGraphObject; 
        this.selectedNetworkStyle = 'graph'; this.modifyProperties('graph'); // conceptually, we should merge the two actions here
      } else if (this.graphToLoad === 'Rels'){
        _graph = this.loadRels()
        this.selectedNetworkStyle = 'graph'; this.modifyProperties('graph'); // conceptually, we should merge the two actions here
      } else if (this.graphToLoad === 'Story') {
        _graph = this.loadStory(false)
        this.selectedNetworkStyle = 'graph'; this.modifyProperties('graph'); // conceptually, we should merge the two actions here
      } else if (this.graphToLoad === 'Story (small)') {
        _graph = this.loadStory(true)
        this.selectedNetworkStyle = 'spread'; this.modifyProperties('spread'); // conceptually, we should merge the two actions here
      } else if (this.graphToLoad === 'Terms'){
        _graph = this.loadTopics()
        this.selectedNetworkStyle = 'graph'; this.modifyProperties('graph'); // conceptually, we should merge the two actions here
      }

      if(!('perform_analysis' in _graph)){
        _graph['perform_analysis'] = true;
      }

      var graph = {'nodes':[],'links':[]};
      if(_graph['perform_analysis']){
        // ----------------------------------------------------------------
        // Converting to Cytoscape
        
        // declaring, then converting from in house dictinoary (_graph)
        var existingEdges = []; // ensure that we are not readding the nodes
        var cy = cytoscape({});
        _graph.nodes.forEach((n)=> cy.add({data: { type:'node', id: n.id, group: n.group }}) );
        // Iterating through the links
        _graph.links.forEach((e)=> { 
          // defining an arbitrary key for the new edge
          const edgeKey = e.source+','+e.target;
          if(!existingEdges.includes(edgeKey)){
            cy.add({data: { type:'edge', id: edgeKey, source: e.source, target: e.target } })
            existingEdges.push(edgeKey);
          } else {
            console.log('WARNING: edge key exists: "'+edgeKey+'"');
          }
        });
        existingEdges = []; // freeing some memory (presumably)
        //
        const closeness_centrality = cy.elements().closenessCentralityNormalized();
        const degree_centrality = cy.elements().degreeCentralityNormalized();
        const betweenness_centrality = cy.elements().betweennessCentrality();
        //
        /* cy.nodes().forEach( n => {
          console.log(n)
          console.log('closeness',closeness_centrality.closeness( n ))
          console.log('degree',degree_centrality.degree( n ))
          console.log('betweenness',betweenness_centrality.betweennessNormalized( n ))
        } ); */
        //
        // calculate components
        var components = cy.elements().components();
        //
        // Iterate through components
        for(var componentIx = 0; componentIx < components.length; componentIx++){
          if(true) { //graph['nodes'].length <= 200){
            components[componentIx].each((e)=>{
              var data = e.data();
              if(data.type === 'node'){
                graph['nodes'].push({
                                     "id":data.id,"component":componentIx+1,
                             'closeness':closeness_centrality.closeness( e ), 
                                 'degree': degree_centrality.degree( e ),
                            'betweenness':betweenness_centrality.betweennessNormalized( e )
                                 })
              } else {
                graph['links'].push({"source":data.source,"target":data.target,value:10})
              }
            });
          }
        }
        // ----------------------------------------------------------------
        // Calculating communities
        let nodesForLouvain = [];
        graph['nodes'].forEach((n) => nodesForLouvain.push(n['id']) );
        let community = calc().nodes(nodesForLouvain).edges(graph['links']);
        let result = community();
        //
        graph['nodes'].forEach((n,ix) => {
          graph['nodes'][ix]['group'] =  result[n.id]
          graph['nodes'][ix]['community'] =  result[n.id]
        });
        // ----------------------------------------------------------------
        
      } else {
        graph = _graph;
      }

      /* graph['links'].forEach((l,ix) => {
          console.log(graph['links'][ix]['value']);//['group'] =  result[n.id];
        }); */

      return graph; //this.loadRels()
    },
    updateFilterProperties(){

    },
    updateForceProperties(){
      this.displayProperties['links'].val = this.forceProperties['link'].val;
      this.updateDisplay();
      this.updateForces();
      // updates ignored until this is run
      // restarts the simulation (important if simulation has already slowed down)
      this.simulation.alpha(1).restart();
    },
    updateDisplayProperties(){
      //this.forceProperties['link'].val = this.displayProperties['links'].val;
      this.updateDisplay();
      // updates ignored until this is run
      // restarts the simulation (important if simulation has already slowed down)
      //this.simulation.alpha(1).restart();
    },
    // update the display based on the forces (but not positions)
    updateDisplay() {
      //
      //console.log('displayProperties',this.displayProperties);
      //console.log("this.forceProperties['radius'].val",this.forceProperties['radius'].val)
      this.node
        .selectAll("circle")
        .attr("r", this.returnRadius); //this.forceProperties['radius'].val);
        //.attr("stroke", forceProperties.charge.strength > 0 ? "blue" : "red")
        //.attr("stroke-width", forceProperties.charge.enabled==false ? 0 : Math.abs(forceProperties.charge.strength)/15);
      
      
      if(this.displayProperties['labels'].val != true){
        // hiding labels
        this.node.selectAll("text")
                 //.attr("stroke-width", 0.0)
                 .attr("font-size","0px")
      } else {
        this.node.selectAll("text")
                 .attr("font-size",this.returnLabelSize)
      }

      /* this.node
        //.attr("r", forceProperties.collide.radius)
        //.attr("r", this.forceProperties.collide.params.radius.value)
        //.attr("r", this.forceProperties['radius'].val);
        .attr("r", 100); //this.returnRadius); */
        
        //.attr("stroke", this.forceProperties.charge.params.strength.value > 0 ? "blue" : "red")
        //.attr("stroke-width", this.forceProperties.charge.enabled==false ? 0 : Math.abs(forceProperties.charge.strength)/15);

      this.link
        //.attr("stroke-width", this.forceProperties.link.enabled ? 1 : .5)
        .attr("stroke-width", this.returnLinkThickness)
        //.attr("opacity", this.forceProperties.link.enabled ? 1 : 0);
        .attr("opacity", this.displayProperties['links'].val ? 1 : 0);
    },
    updateForces(){
      // loading the force properties
      var forceProperties = this.forceProperties;

      // Some pre-processing
      // Link strength comes in values of weak, normal, strong; these need to translate to an actual value in linkStrength
      this.linkStrength = false; // setting to undefined means that we will have link strength calculated 
      if(forceProperties['link-strength'].val === 'weak') this.linkStrength = 0.05;
      if(forceProperties['link-strength'].val === 'normal')  this.linkStrength = false;
      if(forceProperties['link-strength'].val === 'strong') this.linkStrength = 0.6;

      

      // get each force by name and update the properties
      // if(this.forceProperties['center'].val){}
      this.simulation.force("center")
          //.x(this.width * forceProperties.center.params.x.value)
          //.y(this.height * forceProperties.center.params.y.value);
          .x(this.width * forceProperties['center-x'].val)
          .y(this.width * forceProperties['center-y'].val);
      
      // if (this.forceProperties['charge'].val){}
      this.simulation.force("charge")
          //.strength(forceProperties.charge.params.strength.value * forceProperties.charge.enabled)
          //.distanceMin(forceProperties.charge.params.distanceMin.value)
          //.distanceMax(forceProperties.charge.params.distanceMax.value);
          .strength(forceProperties['charge-strength'].val * forceProperties['charge'].val)
          //.distanceMin(forceProperties['charge-distance-min'].val)
          .distanceMin(this.radius_default * forceProperties['nodes-radius-multiplier'].val)
          .distanceMax(forceProperties['charge-distance-max'].val);
      
      this.simulation.force("collide")
          //.strength(forceProperties.collide.params.strength.value * forceProperties.collide.enabled)
          //.radius(forceProperties.collide.params.radius.value)
          //.iterations(forceProperties.collide.params.iterations.value);
          .strength(forceProperties['collide-strength'].val * forceProperties['collide'].val)
          //.radius(forceProperties['radius'].val)
          //.radius(this.radius_default * forceProperties['nodes-radius-multiplier'].val)
          .radius(this.returnRadius)
          .iterations(forceProperties['collide-iterations'].val);
      
      this.simulation.force("link")
          //.force("link", d3.forceLink(this.links).id(d => d.id))
          //.id(function(d) {return d.id;})
          //.distance(forceProperties.link.params.distance.value)
          //.iterations(forceProperties.link.params.iterations.value)
          //.links(forceProperties.link.enabled ? this.graph.links : []);
          //.forceLink(this.links).id(d => d.id)
          .distance(forceProperties['link-distance'].val)
          .iterations(forceProperties['link-iterations'].val)
          .links(forceProperties['link'].val ? this.links : []);
      
      if(this.linkStrength){
        this.simulation.force("link").strength(this.linkStrength);
      } else {
        // Figure out how to reset the strength of the link to default values
        // Currently, I don't know how to switch a link strength from some arbitrary number to 'normal'
        // This is because the undefined link strength is tuned to the graph specifically
        // A dirty solution is to reset the graph, which resets the link strength, but I don't want to go there
      }
      
      // background positive attraction so that orphan nodes and clusters don't fly away
      this.simulation.force("centralGravity", d3.forceManyBody());
      this.simulation.force("centralGravity")
         //.strength(Math.max([Math.abs(this.forceProperties.charge.params.strength.value)/2,10]))
         ////.strength(Math.abs(this.forceProperties.charge.params.strength.value)/2)
         ////.strength(5)
         //.distanceMin(this.forceProperties.charge.params.distanceMax.value+1)
         //.distanceMax(this.forceProperties.charge.params.distanceMax.value*10);
         .strength(Math.max([Math.abs(forceProperties['charge-strength'].val)/2,10]))
         //.distanceMin(forceProperties['charge-distance-min'].val+1) 
         .distanceMin(this.radius_default * forceProperties['nodes-radius-multiplier'].val) 
         .distanceMax(forceProperties['charge-distance-max'].val*10);
    },
    zoomed(e) {
      var t = e.transform;
      d3.select(".everything").attr("transform", t);//"translate("+ (vm.width + t.x) + "," + (vm.height + t.y)  + ") scale(" + t.k + ")");
    },
    returnRadius(d){
      // the choice of metric to convert to a radius
      //d.r = d['degree'];
      d.r = d[this.forceProperties['nodes-radius-coupling'].val];
      
      var radius = this.radius_default; //
      if(this.displayProperties['nodes'].val != 1){
        radius = 0;
      } else if((d.r===undefined) || (this.node_minmax.min === this.node_minmax.max)){
        // pass; the default radius will do
      } else {
        // scaling to expected range
        //radius = this.radius_min + (this.radius_max-this.radius_min)*(d.r - this.node_minmax.min)/(this.node_minmax.max-this.node_minmax.min)
        radius = this.forceProperties['nodes-radius-min'].val + (this.forceProperties['nodes-radius-max'].val-this.forceProperties['nodes-radius-min'].val)*(d.r - this.node_minmax.min)/(this.node_minmax.max-this.node_minmax.min)
      }
      // Finally multiplying by the forceProperties
      return radius * ( this.forceProperties['nodes-radius-multiplier'].val || 1)
    },
    returnLinkThickness(d){
      //console.log('edge d',d);
      return (this.displayProperties['links'].val ? 1 : .5 ) * this.displayProperties['links-scaling'].val;
    },
    returnLabelSize(d){
      // We couple our font sizes to our radius
      const fontmin = 7;
      const fontmax = 15;
      var currentFontSize = 8;
      
      // d.r = d[this.forceProperties['nodes-radius-coupling'].val]; 
      if(this.displayProperties['nodes'].val != 1){
        currentFontSize = 0;
      } else if((d.r===undefined) || (this.node_minmax.min === this.node_minmax.max)){
        // pass; the default radius will do
      } else {
        // font scaling is linked to radius scaling
        currentFontSize = fontmin + (fontmax-fontmin)*(d.r - this.node_minmax.min)/(this.node_minmax.max-this.node_minmax.min)
      }
      // Finally multiplying by both radius multiplier and labels multiplier ('labels-scaling')
      return currentFontSize * ( this.forceProperties['nodes-radius-multiplier'].val || 1) * ( this.displayProperties['labels-scaling'].val || 1)
    },
    returnChart(){
      var vm = this;
      this.links = this.data.links.map(d => Object.create(d));
      this.nodes = this.data.nodes.map(d => Object.create(d));
      //
      //var cola = cola.d3adaptor(d3).size([this.width, this.height]); //console.log('COLA!', cola);
      //
      this.simulation = d3.forceSimulation(this.nodes)
          .force("link", d3.forceLink(this.links).id(d => d.id))
          //.force("link", d3.forceLink())
          //.force("charge", d3.forceManyBody())
          .force("charge", d3.forceManyBody())
          //.force("center", d3.forceCenter(this.width / 2, this.height / 2));
          .force("center", d3.forceCenter())
          .force("collide", d3.forceCollide());  
      //
      function ticked() {
        vm.link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        /* vm.node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y); */
        vm.node.attr("transform", d => 'translate('+d.x+','+d.y+')');


        /* vm.labels
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; }); */
      }
      
      // DRAG DECLARATIONS
      function dragstarted(event) {
        if (!event.active) vm.simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) vm.simulation.alphaTarget(0);
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      var drag = d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      
      //var cola = cola.d3adaptor(d3).size([width, height]); console.log('COLA!', cola);
      
      this.svg = d3.select("#divAtlasSvg") //d3.create("svg")
          .attr("viewBox", [0, 0, this.width, this.height]);

      var g = this.svg.append("g").attr("class", "everything");
      
      this.link = g.append("g")
          .attr("stroke", "#999")
          .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(this.links)
        .join("line")
        .style("marker-end",  "url(#suit)") // Modified line
        .attr("stroke-width", d => Math.sqrt(d.value));

      
      this.node = g.append("g")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
        .selectAll("g")
        .data(this.nodes)
        .join("g")
        .call(drag);
      
      this.node
        .append("circle")
        //.join("circle")
        .attr("r", this.returnRadius)
        //.attr("r", d => this.min + this.max(d.group)
        .attr("fill", d => this.color(d.group));
      
      this.node.append("text")
      .attr("x", 8)
      .attr("y", "0.31em")
      .text(d => d.id)
      //.clone(true).lower()
        .attr("font-family","sans-serif")
        .attr("font-size","18px")
        .attr("fill", "black")
        //.attr("color", "black")
        .attr("stroke-width", 0.1)
        .attr("stroke", "white");
      

      function toggleElement(event){
        // basic toggling of selected nodes
        var selectedNode = d3.select(this);
        //console.log()
        var isselected = selectedNode.classed("selected")
        if(isselected === true){
          selectedNode.attr("stroke", "white");
          selectedNode.classed("selected",false);
          // note that attr converts 0 to '0' and 1 to '1'
        } else {
          selectedNode.attr("stroke", "black");
          selectedNode.classed("selected",true);
          // note that attr converts 0 to '0' and 1 to '1'
        }
      }
      

      // selection option
      this.node.on('click',toggleElement)
      
      /* this.labels = this.node
          .join("text")
          .attr("dx", 10)
          .attr("dy", ".35em")
          .style("stroke", "red")
          .text(function(d) { return 'A'}); //d.name }) */
      
      /* this.labels = this.node
          .append("text")
          .text(function(d) {
            return d.id;
          })
          .attr("font-family","sans-serif")
          .attr("font-size","10px")
          .attr("fill","rgba(0,0,0,0.7)")
          .attr("x", 6)
          .attr("y", 3) */;
        
      /* this.node.append("title").text(function(d) {
        return d.id;
      }); */
      
      this.zoom = d3.zoom().extent([[0, 0], [this.width, this.height]])
                        .scaleExtent([0.2, 8])
                        .on("zoom", this.zoomed)
      
      // resetting all zoom transforms
      this.svg.call(this.zoom.transform, d3.zoomIdentity)

      this.svg.call(this.zoom);
      
      //this.node.append("title")
      //    .text(d => d.id);

      this.updateDisplay();
      this.updateForces();
      //
      this.simulation.on("tick", ticked);
      
      //this.simulation.on("end", this.zoomFit(0.95, 500));
      

      return this.svg.node();
    },
    async startNetwork() {
      //var divheight = Math.min(JQuery("#divAtlas").height(), JQuery("#divAtlas").width());
      //var divheight = this.$refs.divAtlas.clientHeight);
      //var graph; // the data - an object with nodes and links
      //
      var link, node; // svg objects
      var targetHeight = JQuery("#divAtlas").height() - JQuery("#divAtlasNonGraph").height();
      var targetWidth  = JQuery("#divAtlas").width();
      await nextTick(); // waiting for the window to resize
      targetHeight = JQuery("#divAtlas").height() - JQuery("#divAtlasNonGraph").height();
      targetWidth  = JQuery("#divAtlas").width();

      
      this.width        = targetHeight;
      this.height       = targetWidth;
      //
      //console.log(JQuery("#divAtlas").height(), JQuery("#divAtlasNonGraph").height(), JQuery("#divAtlas").width())
      // this.graph = this.returnGraphObject();
      this.data = this.returnGraphObject();
      //console.log('this.data',this.data);
      // var color = d3.scaleOrdinal(d3.schemeTableau10); //d3.schemeAccent);
      // var color = d3.scaleSequential(d3.interpolatePiYG);
      this.color = d3.scaleOrdinal(d3.schemeCategory10);
      //console.log("JQuery",JQuery);
      JQuery("#divAtlasSvg").empty();
      JQuery("#divAtlasSvg").attr("height", targetHeight);
      JQuery("#divAtlasSvg").attr("width", targetWidth);
      //JQuery("#divAtlasSvg").css("background-color", "lightgrey");
      JQuery("#divAtlasSvg").addClass("mycanvas")
      //this.root = d3.select("#divAtlasSvg");

      this.chart = this.returnChart();
      
      /*
      if(targetHeight <=20 || targetWidth < 20){
        // emit a message, if needed
        var _error = 'Hosting div is too small to render the network';
        console.log(_error)
        return(_error)
      } 

      JQuery("#divAtlasSvg").empty();
      JQuery("#divAtlasSvg").attr("height", targetHeight);
      JQuery("#divAtlasSvg").attr("width", targetWidth);

      this.root = d3.select("#divAtlasSvg");
      
      
      // force simulator
      this.simulation = d3.forceSimulation();
      //
      this.simulation.nodes(this.graph.nodes);
      //
      // initializing forces
      this.simulation
          .force("link", d3.forceLink())
          .force("charge", d3.forceManyBody())
          .force("collide", d3.forceCollide())
          .force("center", d3.forceCenter());
      //
      this.updateForces();
      //
      //add encompassing group for the zoom
      var g = this.root.append("g").attr("class", "everything");
      //this.simulation.on("end", this.zoomFit(0.95, 500));
      
      //var jsonFn = "static/miserables.json";
      //d3.json(this.jsonFn).then(function(graph) {
        
        //draw lines for the links
        this.link = g
          .append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(this.graph.links)
          .enter()
          .append("line")
          .attr("stroke-width", function(d) {
            return Math.sqrt(d.value);
          })
          .attr("stroke", "rgba(0,0,0,0.2)");

        //draw circles for the nodes
        this.node = g
          .append("g")
          .attr("class", "nodes")
          .selectAll("circle")
          .data(this.graph.nodes)
          .enter()
          .append("g");

        var circles = this.node
          .append("circle")
          .attr("r", 5)
          .attr("stroke","rgb(50,50,50)")
          .attr("stroke-width",1)
          .attr("fill", function(d) {
            return color(d.group);
          });
        
        this.labels = this.node
          .append("text")
          .text(function(d) {
            return d.id;
          })
          .attr("font-family","sans-serif")
          .attr("font-size","10px")
          .attr("fill","rgba(0,0,0,0.7)")
          .attr("x", 6)
          .attr("y", 3);
        
        this.node.append("title").text(function(d) {
          return d.id;
        });

        node = this.node;
        link = this.link;
        
        //this.simulation.on("tick", ticked);
        this.simulation.nodes(this.graph.nodes).on("tick", ticked);
        //this.simulation.force("link").links(graph.links);
        
        function ticked() {
          link
            .attr("x1", function(d) {
              return d.source.x;
            })
            .attr("y1", function(d) {
              return d.source.y;
            })
            .attr("x2", function(d) {
              return d.target.x;
            })
            .attr("y2", function(d) {
              return d.target.y;
            });
          
          node.attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
            }); 
        }

        var zoom_handler = d3.zoom().on("zoom", zoom_actions);
        zoom_handler(this.root);

        function zoom_actions() {
          //console.log('d3.event.transform',d3.event.transform);
          g.attr("transform", d3.event.transform);
        }

        //-----------------------------------------------------------------------------------
        //-----------------------------------------------------------------------------------
        var drag_handler = d3
          .drag()
          .on("start", drag_start)
          .on("drag", drag_drag)
          .on("end", drag_end);

        //same as using .call on the node variable as in https://bl.ocks.org/mbostock/4062045
        drag_handler(this.node);
        //drag handler
        //d is the node
        var simulation = this.simulation;
        function drag_start(d) {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }
        function drag_drag(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }
        function drag_end(d) {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = d.x;
          d.fy = d.y;
        }
        //-----------------------------------------------------------------------------------
        //-----------------------------------------------------------------------------------
      //});
      
      */
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss'>
@import '@/assets/css/vue-transition.css';

.mycanvas {
  background-color: rgba(var(--color-fiord), 0.15);
}
</style>
