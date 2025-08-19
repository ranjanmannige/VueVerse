<template>
  <div style='display:inline-block;'>
    <span
      v-bind:style='{"font-size":fontSize,"padding-left":padding, "padding-right":padding}'
      class='button'
      v-bind:class='{ button__on: active }'
      v-html='content'
      v-on:click='emitme()'
      v-bind:title='title'
    >
    </span>
  </div>
</template>

<script>
export default {
  props: {
    'content':{type:String},
    'title':{type:String},
    'fontSize':{type:String,default:'9pt'},
    'padding':{type:String,default:'12px'}
  },
  data() {
    return {
      active: this.controllingVariable,
    };
  },
  created() {
    this.active = this.controllingVariable;
  },
  methods: {    
    emitme(){
      this.active = true;
      this.$emit('update-controller',this.active);
      this.active = false;

    },
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

</style>
