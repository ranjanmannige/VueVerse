<template>
  <div style='display:inline-block;' v-click-outside='closeMe'>
    <span class="config-button" v-on:click='toggleMenu' v-html='panelTitle'>
    </span>
    <div class='main-menu-div' v-show='mainMenuActive'>
      <div style="display: block;">
        <div style="display: inline-block; padding-left:0px;" v-html="title" class="headerColor">
        </div>
        <div v-on:click="toggleMenu()" class="close-button">
          <i class="fas fa-times-circle"></i>
        </div>
      </div>
      
      
      <span v-if="paramsHaveHiddenAttributes()" v-on:click="toggleShowDetails()">
        <span v-if="showDetails">
          Hide hidden parameters
        </span>
        <span v-else>
          Show hidden parameters
        </span>
      </span>
      <toggleButton 
                      v-if="paramsHaveHiddenAttributes()"
                      v-bind:controllingVariable="showDetails"
                      v-on:update-controller="showDetails = $event"
                      contentOn='<i class="fas fa-lock-open"></i>'
                      contentOff='<i class="fas fa-lock"></i>'
                      titleOn='Hide details'
                      titleOff='Show details'
                      >
      </toggleButton>

      <transition-group name="fade">
      <div v-for="(param, paramid) in trimmedProperties" v-bind:key="paramid+param['name']"> <!-- v-if="showElement(paramid)"> -->
        <div style="display: inline-block; font-size:12px; padding-left: 5px;" 
            v-bind:class="{headerColor:isRootKey(paramid)&param.val}"
            v-bind:title="param.hoverText">
          <span v-if="!isRootKey(paramid)" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
          <span v-if="'show' in param"><i class="fas fa-lock-open"></i> &nbsp;</span> 
          <span v-bind:title='param.hoverText' v-html="param.name"></span>
        </div>
        <div style="position: absolute; float-right; right: 15px; font-size:12px;text-align:right; display: inline-block;">
           
          <input v-if='param.type == "text"' style="width:150px; height:24px;" type="text" id="fname" name="fname" 
          v-model="param.val">
          <input v-else-if='param.type == "date"' style="width:150px; " type="date" id="start" v-model="param.val">
          <input v-else-if='param.type == "checkbox"' type="checkbox" id="checkbox" v-model="param.val">
          <toggleButton v-else-if='param.type == "togglebutton"'
                        v-bind:controllingVariable="param.val"
                        v-on:update-controller="param.val = $event"
                        contentOn='on'
                        contentOff='off'
                        titleOn='Turn off'
                        titleOff='Turn on'
                        >
          </toggleButton>

          <select v-else-if='param.type === "dropdown"' v-model="param.val">
            <option v-for='(option_name,oid) in param.options' 
                    v-bind:selected="option_name===param.val" v-bind:key='oid' v-bind:value='option_name'>
              {{option_name}}
            </option>
          </select>

          <span v-else-if='param.type == "slider"'>
              {{param.val}}
          <VueSlider  v-model="param.val"
                      :min="param.min" :max="param.max"
                      :interval="param.step"
                      :drag-on-click="true"
                      :tooltip-formatter="paramid+': {value}'"
                      :processStyle="{'background-color':'black'}"
                      tooltipPlacement="top"
                      :tooltipStyle="{'font-size': '10px', 
                                      'background-color':'white', 
                                      'border':'1px solid #f4511e',
                                      'color':'grey'}"
                      style="width:150px; display: inline-block; top:5px;">
                      <!-- 
                      
                      :disabled="!force.enabled"
                      :height="3"
                      :dotSize="11" -->
          </VueSlider>
          </span>
        </div>
      </div>
      </transition-group>
    </div>
  </div>
</template>

<script>

//import vClickOutside from 'v-click-outside'

import {createApp} from 'vue';
import App from "@/App.vue";
let app = createApp(App);

/* 
// From https://stackoverflow.com/questions/63869859/migrating-detect-click-outside-custom-directive-from-vue-2-to-vue-3
// Use as <someElement v-click-outside="dosomething"></someElement>
app.directive('click-outside', {
    beforeMount(el, binding, vnode) {
        el.clickOutsideEvent = function(event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event, el);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
    }
}); */


import VueSlider from 'vue-3-slider-component';
import toggleButton from './buttonToggle.vue';

//module.exports = {
export default {
  components: {
    VueSlider,
    toggleButton,
  },
  props: {
    panelTitle: {
      type: String,
      default: '<i class="fas fa-cogs"></i>'
    },
    parentProperties:Object,
    title:String,
  },
  data() {
    return {
      mainMenuActive:false,
      properties:{},
      trimmedProperties:{},
      showDetails:0,
      //title:{},
    };
  },
  mounted() {
    this.properties = this.parentProperties;
  },
  watch: {
    parentProperties(){
      this.properties = this.parentProperties;
      this.trimProperties();
    },
    showDetails(){
        this.trimProperties();
    },
    properties: { handler: 'emitproperties', deep: true },
  },
  methods: {
    toggleShowDetails(){
      if(this.showDetails == 0) {
        this.showDetails = 1;
      } else {
        this.showDetails = 0;
      }
    },
    closeMe(){
      if(this.mainMenuActive) this.mainMenuActive=false;
    },
    trimProperties(){
        var _tmp_trimmed_properties = {}
        for(var paramid in this.properties){
            if(this.showElement(paramid)){
                _tmp_trimmed_properties[paramid] = this.properties[paramid];
            }
        this.trimmedProperties = _tmp_trimmed_properties;
        }
    },
    paramsHaveHiddenAttributes(){
        var foundHiddenAttributes = false;
        for(var key in this.properties){
            if(this.properties[key]['show'] === false){
                foundHiddenAttributes = true;
            }
        }
        return foundHiddenAttributes;
    },
    isRootKey(propKey){
        var rootkey = propKey.split('-')[0];
        return rootkey == propKey
    },
    showElement(propkey){
        var show = true;
        if(!this.showDetails & this.properties[propkey]['show']===false){
            show = false;
        } else {
            var rootkey = propkey.split('-')[0];
            if(rootkey != propkey){
                if(this.properties[rootkey]){
                    if(!this.properties[rootkey]['val']){
                        show = false;
                    }
                }
            }
            // checking if the parent key is false or 0
            //this.properties.forEach((d,ix)=>{  
            //});
        }
        return show;
    },
    emitproperties() {
        this.trimProperties();
        this.$emit('update-properties', this.properties);
    },
    toggleMenu() {
      if (this.mainMenuActive === true) {
        this.mainMenuActive = false;
      } else {
        this.mainMenuActive = true;
      }
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
//@import '../../assets/css/template_crunch.scss';


.main-menu-div {
  text-align: left;
  border: 1px solid $color-fiord !important;
  border-radius: 4px;
  padding: 5px;
  padding-left: 10px !important;
  padding-right: 10px !important;
  background-color: rgba(255, 255, 255, 1.0);
  box-shadow: 0 0 8px grey;
  position: absolute;
  float:right;
  right: 15px;
  width: 380px;
  z-index: 1000000 !important;
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

.config-button {
  //position: absolute; float:right; top: 44px; right: 20px; color: grey;
  cursor: pointer; 
  display: inline-block; 
  //position: absolute; 
}

.alternating-background {
  background-color: rgba(0,0,0,0.0);
  border-radius: 4px;
}

.alternating-background:nth-child(2n) {
  background-color: rgba($color-fiord-raw,0.2);
}

.headerColor {
  color: $color-fiord;
  font-weight:bold; 
}

.close-button {
  display: inline-block; 
  position: absolute; 
  cursor: pointer; 
  right: 12px; 
  font-size:12px;
  color: $color-fiord;
}


.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.fa-map-pin:after {
  position: absolute;
  content: "/";
  color: red;
  font-weight: 700;
  font-size: 1.7em;
  left: 7px;
  top: -10px;
}

</style>
