<template>
  <div style='display:inline-block;'>
    <span
      class='button binary-button-left'
      v-bind:class='{ button__on: active === 1 }'
      v-html='contentOn'
      v-on:click='togglePanel(1)'
      v-bind:title="titleOn"
    >
    </span>
    <span
      class='button binary-button-right'
      v-bind:class='{ button__on: active === 0 }'
      v-html='contentOff'
      v-on:click='togglePanel(0)'
      v-bind:title="titleOff"
    >
    </span>
  </div>
</template>

<script>
export default {
  props: ['controllingVariable','contentOn', 'contentOff','titleOn','titleOff'],
  data() {
    return {
      active: this.controllingVariable,
    };
  },
  methods: {    
    togglePanel(trueOrFalse){
      this.active = trueOrFalse;
      this.$emit('update-controller',this.active);
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

.binary-button-left {
  margin-right: 0px !important;
  border-bottom-right-radius: 0px !important;
  border-top-right-radius: 0px !important;
  //border-right: 0.5px splid $color-fiord !important;
}
.binary-button-right {
  margin-left: 0px !important;
  //border-left: 1px solid grey;
  border-bottom-left-radius: 0px !important;
  border-top-left-radius: 0px !important;
}
</style>
