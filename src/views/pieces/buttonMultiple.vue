<template>
  <div style='display:inline-block;'>
    <span style="font-size:10px; margin-left:10px;" v-if="header!==undefined">
      <b>{{header}}</b>
    </span>
    <span v-for="buttonText in graphToLoadOptions" v-bind:key="buttonText"
      v-bind:class='returnClass(buttonText)'
      v-html='buttonText'
      v-on:click='selectButton(buttonText)'
      v-bind:title="title"
    >
    </span>
    
  </div>
</template>

<script>
export default {
  props: ['controllingVariable','graphToLoadOptions','header','title'],
  data() {
    return {
      active: this.controllingVariable,
    };
  },
  methods: {    
    returnClass(buttonText){
      
      var _isLeft   = this.graphToLoadOptions.indexOf(buttonText)===0;
      var _isRight  = this.graphToLoadOptions.indexOf(buttonText)===this.graphToLoadOptions.length-1;
      var _isMiddle = _isLeft === false && _isRight === false;

      var _class = {};
      _class['button'] = true;
      _class['button-left']   = _isLeft;
      _class['button-right']  = _isRight;
      _class['button-middle'] = _isMiddle;
      _class['button__on']    = buttonText===this.controllingVariable;
      return _class
    },
    selectButton(selectedButtonText){
      this.$emit('update-controller',selectedButtonText);
      //
    }
  },
  watch: {
    controllingVariable() {
      this.active = this.controllingVariable;
    },
  }
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
//@import '../../assets/css/template_crunch.scss';

.button-left {
  margin-right: 0px !important;
  border-bottom-right-radius: 0px !important;
  border-top-right-radius: 0px !important;
  //border-right: 0.5px splid $color-fiord !important;
}
.button-right {
  margin-left: 0px !important;
  //border-left: 1px solid grey;
  border-bottom-left-radius: 0px !important;
  border-top-left-radius: 0px !important;
}

.button-middle {
  margin-left: 0px !important;
  margin-right: 0px !important;
  //border-left: 1px solid grey;
  border-radius: 0px !important;
}
</style>
