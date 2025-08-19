<template>
  <div style='display:inline-block;'>
    <span class="config-button" v-on:click='toggleMenu'>
      <!-- class="button"  -->
      <i class="fas fa-cogs"></i>
      <!-- <font style='cursor:pointer; color:#f4511e; font-size: large;'  -->
    </span>
    <div class='main-menu-div' v-show='mainMenuActive'>
      <div style="display: block;">
        <div style="display: inline-block; padding-left:4px;">
          <b>NETWORK SETTINGS</b>
        </div>
        <div v-on:click="toggleMenu()" class="close-button">
          <i class="fas fa-times-circle"></i>
        </div>
      </div>
      
      <!-- JUST A HEADER -->
      <div style="display: block;">
        <div style="display: inline-block; padding-left:5px; font-size:12px;">
          <span style="color:grey;"><b>Force</b> (buttons toggle <span class="notice">activation</span>)</span>
        </div>
        <div style="position: absolute; float-right; right: 14px; display: inline-block; font-size:12px;text-align:right;font-align:right; display: inline-block; height: 200px;">
          <span style="color:grey;"><b>Parameter</b></span>
        </div>
      </div>

      <div class="alternating-background" v-for="(force,forceid) in forceProperties" v-bind:key="forceid">
        <div style="display: inline-block;" v-if="checkForce(forceid)">
          <span v-for="(param,paramid,paramix) in force.params" v-bind:key="forceid+paramid"
                v-if="param.showSlider" style="display:block;" >
            <toggleButton v-bind:controllingVariable="force.enabled"
                    v-on:update-controller="force.enabled = $event"
                    v-bind:contentOn='forceid'
                    v-bind:contentOff='forceid'
                    v-bind:titleOn='"toggle"+forceid'
                    v-bind:titleOff='"toggle"+forceid'
                    v-if="paramix===0"/>
            <div v-else style="color:white; display:inline-block;">
            </div>
              <div style="position: absolute; float-right; right: 15px; display: inline-block; font-size:12px;text-align:right;font-align:right; display: inline-block; height: 200px;">
                {{paramid}} ({{param.value}})
                <VueSlider v-model="forceProperties[forceid]['params'][paramid].value"
                          :min="param.min" :max="param.max"
                          :drag-on-click="true"
                          :interval="param.step"
                          :disabled="!force.enabled"
                          :tooltip-formatter="paramid+': {value}'"
                          :processStyle="{'background-color':'black'}"
                          tooltipPlacement="top"
                          :tooltipStyle="{'font-size': '10px', 
                                          'background-color':'white', 
                                          'border':'1px solid #f4511e',
                                          'color':'grey'}"
                          style="width:200px; display: inline-block; top:5px;">
                          <!-- :height="3"
                          :dotSize="11" -->
                </VueSlider>
              </div>
            
          </span>
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
    parentForceProperties:Object,
  },
  data() {
    return {
      mainMenuActive:false,
      forceProperties:{},
    };
  },
  mounted() {
    this.forceProperties = this.parentForceProperties;
  },
  watch: {
    parentForceProperties(){
      this.forceProperties = this.parentForceProperties;
    },
    forceProperties: { handler: 'emitForceProperties', deep: true },
  },
  methods: {
    checkForce(forceid){
      var _containsDisplayableContent = false
      Object.keys(this.forceProperties[forceid]['params']).forEach((parameter)=>{
        if(this.forceProperties[forceid]['params'][parameter]['showSlider'] == true){
          _containsDisplayableContent = true
        }
      });
      return _containsDisplayableContent
    },
    emitForceProperties() {
      console.log('UPDATING!')
      this.$emit('update-force-properties', this.forceProperties);
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
  background-color: rgba(255, 255, 255, 0.9);
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

.close-button {
  display: inline-block; 
  position: absolute; 
  cursor: pointer; 
  right: 12px; 
  font-size:12px;
  color: $color-fiord;
}

</style>
