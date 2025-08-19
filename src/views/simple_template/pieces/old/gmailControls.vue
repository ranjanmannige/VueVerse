<template>
  <div style='display:inline-block;'>
    <span class="config-button" v-on:click='toggleMenu'>
      <!-- class="button"  -->
      <i class="fas fa-cogs"></i>
      <!-- <font style='cursor:pointer; color:#f4511e; font-size: large;'  -->
    </span>
    <div class='main-menu-div' v-show='mainMenuActive'>
      <div style="display: block;">
        <div style="display: inline-block; padding-left:0px;">
          <b class="headerColor">{{title}}</b>
        </div>
        <div v-on:click="toggleMenu()" class="close-button">
          <i class="fas fa-times-circle"></i>
        </div>
      </div>
      
      <div v-for="(param, paramid) in properties" v-bind:key="paramid">
        <div style="display: inline-block; font-size:12px; padding-left: 5px;" v-bind:title="param.hoverText">
          <span v-bind:title='param.hoverText'>{{param.name}}</span>
        </div>
        <div style="position: absolute; float-right; right: 15px; font-size:12px;text-align:right; display: inline-block;">
           
          <input v-if='param.type == "text"' style="width:150px; height:24px;" type="text" id="fname" name="fname" 
          v-model="param.val">
          <input v-else-if='param.type == "date"' style="width:150px; " type="date" id="start" name="trip-start" v-model="param.val">
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
          <VueSlider v-else-if='param.type == "slider"'
                      v-model="param.val"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import VueSlider from 'vue-slider-component';
import toggleButton from './buttonToggle.vue';
import 'vue-slider-component/theme/default.css'


//module.exports = {
export default {
  components: {
    VueSlider,
    toggleButton,
  },
  props: {
    parentProperties:Object,
    title:String,
  },
  data() {
    return {
      mainMenuActive:false,
      properties:{},
      //title:{},
    };
  },
  mounted() {
    this.properties = this.parentProperties;
  },
  watch: {
    parentProperties(){
      this.properties = this.parentProperties;
    },
    properties: { handler: 'emitproperties', deep: true },
  },
  methods: {
    emitproperties() {
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
  cursor: pointer; position: absolute; float:right; top: 44px; right: 20px; color: grey;
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
}

.close-button {
  display: inline-block; 
  position: absolute; 
  cursor: pointer; 
  right: 12px; 
  font-size:12px;
  color: $color-fiord;
}

</style>
