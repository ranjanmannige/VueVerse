<template>
  <div style='position:relative' v-click-outside='closeMe'>
    <span
      class="crunch-theme"
      v-on:click='toggleMenu'
      ><i class='fi-list'></i
    ></span>
    <div class='main-menu-div' v-show='mainMenuActive'>
      <ul class='main-menu-ul'>
        <li
          v-for='linkTuple in prunedlinkTuples'
          v-bind:key='linkTuple.route'
          class='main-menu-li'
          v-on:click.prevent="rerouteTo(linkTuple.route)"
        >
          <span v-html='linkTuple.show'></span>
          <br />
        </li>
        <li class='color-li'>
          <i class="fi-paint-bucket"></i>&nbsp;&nbsp;<span style="color:white;">.</span> Colors<br>
          <div  v-for="color in global.$commonvariables.themeColors" 
                v-on:click="changeColor(color)" 
                v-bind:key="color"
                class='color-div' 
                v-bind:style='{backgroundColor:color, color:color}'></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>

//import {createApp} from 'vue';
//import App from "@/App.vue";
//let app = createApp(App);
import { getCurrentInstance } from 'vue'
const app = getCurrentInstance();


/* // From https://stackoverflow.com/questions/63869859/migrating-detect-click-outside-custom-directive-from-vue-2-to-vue-3
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
});
 */

//import Vue from 'vue';
import { Photoshop } from 'vue-color'
import { globalVariables } from '@/stores/global.js'


export default {
  data() {
    return {
      global: globalVariables(),
      mainMenuActive: false,
      linkTuples:[],
    };
  },
  props: {
    parentRouteName: String,
    parentLinkTuples: Object,
  },
  mounted() {
    this.linkTuples  = this.parentLinkTuples;
    //this.themeColors = this.$themeColors;
    //console.log('this.$linkTuples',this.linkTuples, this.$linkTuples);
    //console.log('this.$themeColors',this.themeColors, this.$themeColors);
  },
  computed: {
    prunedlinkTuples: function () {
      let _prunedLinkTuples = [];
      for(var _linkTupleIx in this.linkTuples){
        const _linkTuple = this.linkTuples[_linkTupleIx];
        if(_linkTuple.route !== this.parentRouteName){
          _prunedLinkTuples.push(_linkTuple);  
        }
      }
      return _prunedLinkTuples;
    },
  },
  methods: {
    closeMe(){
      if(this.mainMenuActive) this.mainMenuActive=false;
    },
    hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },
    changeColor(color){
      const rgbdict = this.hexToRgb(color);
      document.documentElement.style.setProperty('--color-fiord', rgbdict.r+', '+rgbdict.g+', '+rgbdict.b);
    },
    rerouteTo(_name){
      // Sending the selected doc ids to the exploration component
      if(_name !== ''){
        //this.$router.push( { name: _name, params: { msg: 'Hello!' } } );
        this.$router.push( { name: _name, params: {}});
      }
      // ... WARNING: don't use this.$router.push({'path': ...}) ... it does not let you submit params
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
<style lang='scss'>

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
  width: 180px;
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
  text-decoration: none;
  color: $color-fiord;
  background-color: $color-white;
  cursor: pointer;

  &:hover {
    color: $color-white;
    background-color: $color-fiord;
  }
}

.main-menu-li span {

}

.crunch-theme{
  cursor:pointer; color:$color-fiord; font-size: large;
}


.color-li{
  padding: 4px;
  padding-left: 30px !important;
  //padding-right: 30px !important;
  padding-bottom:0px !important;
  text-align: left;
  border-top: 1px solid $color-fiord;
  text-decoration: none;
  color: $color-fiord;
  background-color: $color-white;
  cursor: pointer;
}

</style>
