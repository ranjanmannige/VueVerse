<template>
  <div class="inner-card"  id="divNetwork" ref="divNetwork" style="padding:5px !important; margin:0px !important;">
    <div class='card-fixed-spaced'  id="divNetworkNonGraph" ref="divNetworkNonGraph">
      <span>
        <span v-on:click="zoomFit(.95,500)">
          <simpleButton content='<i class="fas fa-expand-alt"></i>' title='Release stuck nodes and fit network to frame'/>
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
            Style: 
            <!-- Notice that, in on v-on, we are passing an event, which ontains the value of the option selected -->
            <select v-on:change="modifyProperties($event)"> 
              <option v-for='forcesettings,settingName in preSettings' v-bind:key='settingName' v-bind:value='settingName'>
                      {{settingName}}
              </option>
            </select>
            &nbsp;
            <i class="fas fa-caret-right" style='cursor:pointer;' v-on:click="showStyleDropdown = !showStyleDropdown"></i>
          </span>
          <span v-else v-on:click="showStyleDropdown = !showStyleDropdown">
            <i class="fas fa-caret-left" style='cursor:pointer;'></i>
          </span>
        </span>
      &nbsp;
      <span v-on:click="test()"><i class="fas fa-bug"></i></span> &nbsp;
      <controlPanel style='z-index:1000000;' v-bind:parentProperties="displayProperties"  title="VISUAL SETTINGS"
              panelTitle='<i class="fas fa-palette"></i>'
              v-on:update-properties="displayProperties=$event" />
      &nbsp;
      <controlPanel style='z-index:1000000;' v-bind:parentProperties="forceProperties"  title="FORCE SETTINGS"
              panelTitle='<i class="fas fa-flask"></i>'
              v-on:update-properties="forceProperties=$event" />
      </span>
    </div>
    <!-- <div class='card__scroll' id="divNetwork" style='margin:0px; padding:0px; background: red;'>   -->
    <div id="divNetworkSvgWrapper" class='card-fixed' style="position:relative !important; text-align:center; margin:0px  !important; padding:0px !important; ">
      <!-- <span v-on:click="test()">test</span> -->
      <svg width="100%" height="100%" id="divNetworkSvg"></svg>
    </div>
  </div>
</template>


<script>

//import Vue from 'vue';
import {nextTick} from 'vue';

import JQuery from 'jquery';
import * as d3 from 'd3'; // from https://levelup.gitconnected.com/d3-js-and-vue-js-7a6a721eb79f

//var jsnx = require('jsnetworkx');
import cytoscape from 'cytoscape'; // OR var cytoscape = require('cytoscape');

import * as jLouvain from '../../assets/js/jLouvain.js'

import { select } from 'd3-selection';
import transition from 'd3-transition';

//import VueSlider from 'vue-slider-component'
//import 'vue-slider-component/theme/default.css'

const greadability = require('../../assets/js/greadability.js');

import toggleButton from './buttonToggle.vue';
import binaryButton from './buttonBinary.vue';
import simpleButton from './buttonSimple.vue';
import multipleButton from './buttonMultiple.vue';
//import graphControls from './graphControls.vue';
import controlPanel from './controlDropdownPanel.vue';

import exampleGraphObject from './miserables.json';

export default {
  data() {
    return {
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
      graphToLoad:'?',
      graphToLoadOptions: ['Rels','Terms','<i class="fas fa-book"></i>','?'],
      value: 0.5,
      jsonFn: "/miserables.json", // placed in /client/public/
      resetNetwork: null,
      fullHeight: null, // check if 
      graphSettings:{
        // all settings must have following keys
        // key : { minvalue: 0, value: 0.5, maxvalue: 1.0, valyeStep: 0.1, title: 'Link length' }
      },
      displayProperties: {
        'nodes'   : {'name':'SHOW NODES' ,'val':1,'type':'togglebutton' ,'hoverText':'Show radii.'},
        'labels'   : {'name':'SHOW LABELS' ,'val':1,'type':'togglebutton' ,'hoverText':'Show radii.'},
        'links'   : {'name':'SHOW EDGES' ,'val':1,'type':'togglebutton' ,'hoverText':'Show radii.'},
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
        'link-distance': 
                     {'name':'distance' ,'val':30,'min':0,'max':100,'step':1, 'type':'slider' ,'hoverText':'Something.'},
        'link-iterations'  : 
                     {'name':'iterations' ,'val':1,'min':1,'max':5,'step':1, 'type':'slider' ,'hoverText':'Something.'},
      },
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
    graphToLoad(){
      console.log('GRAPHTOLOADCHANGED!')
      this.startNetwork();
    },
    parentResetNetwork(){
      this.resetNetwork = this.parentResetNetwork;
    },
    resetNetwork(){
      if(this.resetNetwork === true){
        console.log('RESTARTING NETWORK!')
        if(this.firstRender){
          this.startNetwork();
          this.firstRender = false;
        } else {
          var targetHeight = JQuery("#divNetwork").height() - JQuery("#divNetworkNonGraph").height();
          var targetWidth  = JQuery("#divNetwork").width();
          JQuery("#divNetwork").height()
          
          this.width        = targetHeight;
          this.height       = targetWidth;
          this.svg = d3.select("#divNetworkSvg") //d3.create("svg")
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
    this.fullHeight = this.$refs.divNetwork.clientHeight;
  },
  mounted() {
    this.resetNetwork = this.parentResetNetwork;
    //
  },
  methods: {
    modifyProperties(event){
      var style = event.target.value; // getting values from select/option clusters is annoying
      console.log('style',style);
      
      for(const parameterKey in this.preSettings[style]['forces']) {
        //
        var parameters = this.preSettings[style]['forces'][parameterKey];
        console.log(parameterKey);
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
    changeNetworkState(state='bubbles'){
      /*
      preSettings: {
        'bubbles' : {
          'charge'          : {'val':1,},
          'charge-strength' : {'val':4},
          'collide'         : {'val':1},
          'collide-strength': {'val':0.7},
          'link'            : {'val':0},
        },
        'angryBubbles' : {
          'charge'          : {'val':1,},
          'charge-strength' : {'val':4},
          'collide'         : {'val':1},
          'collide-strength': {'val':0.7},
          'link'            : {'val':0},
        },
        'links' : {
      */
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

      var parent = d3.select("#divNetworkSvg");
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
        console.log('-----------------------')
        console.log(passage)
        console.log(passage['pTerms']);
        
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
      console.log(graph);
      var nodes = [];
      var rels  = [];
      var graph = {'links':[],'nodes':[]}
      return graph;
    },
    returnGraphObject(){
      //graphToLoadOptions: ['Rels','Terms','?'],
      var _graph = {'links':[{"source":"Data", "target":"... not yet available", "value":10, "weight":1}],
                   'nodes':[{"id":"Data","group":1},{"id":"... not yet available", "group":2}]}
      //
      if(this.graphToLoad === '<i class="fas fa-book"></i>'){ 
        // DUMMY GRAPH for instruction purposes
        _graph = exampleGraphObject; 
        //this.loadRels();
      } else if (this.graphToLoad === 'Rels'){
        // LOADING RELS 
        _graph = this.loadRels()
      } else if (this.graphToLoad === 'Terms'){
        //
        _graph = this.loadTopics()
      }

      var graph = {'nodes':[],'links':[]};
      if(true){
        // ----------------------------------------------------------------
        // Converting to Cytoscape, and calculating for a largest sub-component
        
        // declaring, then converting from JSON
        var cy = cytoscape({});
        _graph.nodes.forEach((n)=> cy.add({data: { type:'node', id: n.id, group: n.group }}) );
        _graph.links.forEach((e)=> cy.add({data: { type:'edge', id: e.source+'--'+e.target, source: e.source, target: e.target } }) );
        
        
        const closeness_centrality = cy.elements().closenessCentralityNormalized();
        const degree_centrality = cy.elements().degreeCentralityNormalized();
        const betweenness_centrality = cy.elements().betweennessCentrality()

        /* cy.nodes().forEach( n => {
          console.log(n)
          console.log('closeness',closeness_centrality.closeness( n ))
          console.log('degree',degree_centrality.degree( n ))
          console.log('betweenness',betweenness_centrality.betweennessNormalized( n ))
        } ); */
        
        // calculate components
        var components = cy.elements().components();
        
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
        let community = jLouvain()
          .nodes(nodesForLouvain)
          .edges(graph['links']);
        let result = community();
        
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
                 .attr("font-size","8px")
      }

      /* this.node
        //.attr("r", forceProperties.collide.radius)
        //.attr("r", this.forceProperties.collide.params.radius.value)
        //.attr("r", this.forceProperties['radius'].val);
        .attr("r", 100); //this.returnRadius); */
        
        //.attr("stroke", this.forceProperties.charge.params.strength.value > 0 ? "blue" : "red")
        //.attr("stroke-width", this.forceProperties.charge.enabled==false ? 0 : Math.abs(forceProperties.charge.strength)/15);
      var drawLink = this.displayProperties['links'].val;

      this.link
        //.attr("stroke-width", this.forceProperties.link.enabled ? 1 : .5)
        .attr("stroke-width", drawLink ? 1 : .5)
        //.attr("opacity", this.forceProperties.link.enabled ? 1 : 0);
        .attr("opacity", drawLink ? 1 : 0);
    },
    updateForces(){
      var forceProperties = this.forceProperties;
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
    returnChart(){
      var vm = this;
      this.links = this.data.links.map(d => Object.create(d));
      this.nodes = this.data.nodes.map(d => Object.create(d));
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

      this.svg = d3.select("#divNetworkSvg") //d3.create("svg")
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
        .attr("font-size","8px")
        .attr("fill", "black")
        //.attr("color", "black")
        .attr("stroke-width", 0.1)
        .attr("stroke", "white");
      

      function toggleElement(event){
        // basic toggling of selected nodes
        var selectedNode = d3.select(this);
        console.log()
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
      
      this.simulation.on("tick", ticked);
      
      return this.svg.node();
    },
    async startNetwork() {
      //var divheight = Math.min(JQuery("#divNetwork").height(), JQuery("#divNetwork").width());
      //var divheight = this.$refs.divNetwork.clientHeight);
      //var graph; // the data - an object with nodes and links
      //
      var link, node; // svg objects
      var targetHeight = JQuery("#divNetwork").height() - JQuery("#divNetworkNonGraph").height();
      var targetWidth  = JQuery("#divNetwork").width();
      await nextTick()
      var targetHeight = JQuery("#divNetwork").height() - JQuery("#divNetworkNonGraph").height();
      var targetWidth  = JQuery("#divNetwork").width();

      
      this.width        = targetHeight;
      this.height       = targetWidth;
      //
      console.log(JQuery("#divNetwork").height(), JQuery("#divNetworkNonGraph").height(), JQuery("#divNetwork").width())
      // this.graph = this.returnGraphObject();
      this.data = this.returnGraphObject();
      console.log('this.data',this.data);
      // var color = d3.scaleOrdinal(d3.schemeTableau10); //d3.schemeAccent);
      // var color = d3.scaleSequential(d3.interpolatePiYG);
      this.color = d3.scaleOrdinal(d3.schemeCategory10);
      console.log("JQuery",JQuery);
      JQuery("#divNetworkSvg").empty();
      JQuery("#divNetworkSvg").attr("height", targetHeight);
      JQuery("#divNetworkSvg").attr("width", targetWidth);
      
      //this.root = d3.select("#divNetworkSvg");

      this.chart = this.returnChart();
      /*
      

      if(targetHeight <=20 || targetWidth < 20){
        // emit a message, if needed
        var _error = 'Hosting div is too small to render the network';
        console.log(_error)
        return(_error)
      }

      JQuery("#divNetworkSvg").empty();
      JQuery("#divNetworkSvg").attr("height", targetHeight);
      JQuery("#divNetworkSvg").attr("width", targetWidth);

      this.root = d3.select("#divNetworkSvg");
      
      
      // force simulator
      this.simulation = d3.forceSimulation();

      this.simulation.nodes(this.graph.nodes);

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
//@import '../../assets/css/template_crunch.scss';
@import '../../assets/css/vue-transition.css';
</style>
