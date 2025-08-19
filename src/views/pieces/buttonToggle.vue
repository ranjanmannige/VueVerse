<template>
  <div style='display:inline-block;'>
    <span
      class='button'
      v-bind:style='{"font-size":fontSize,"padding-left":padding, "padding-right":padding}'
      v-bind:class='{ button__on: active }'
      v-html='content'
      v-bind:title="title"
      v-on:click='togglePanel()'
    >
    </span>
  </div>
</template>


<script>
export default {
  props: {
    'controllingVariable':{type:Number},
    'contentOn':{type:String},
    'contentOff':{type:String},
    'titleOn':{type:String},
    'titleOff':{type:String},
    'fontSize':{type:String,default:'9pt'},
    'padding':{type:String,default:'12px'}
  },
  data() {
    return {
      id: 1,
      active: this.controllingVariable,
      content: '',
      title: '',
    };
  },
  methods: {    
    updateVariables(){
      if(this.active == true) {
        this.content = this.contentOn;
        this.title = this.titleOn;
      } else {
        this.content = this.contentOff;
        this.title = this.titleOff;
      }
    },
    togglePanel(){
      this.active == true ? this.active = 0 : this.active = 1;
      this.updateVariables();
      this.$emit('update-controller',this.active);
    },
  },
  created() {
    this.active = this.controllingVariable;
    this.updateVariables();
  },
  watch: {
    controllingVariable() {
      this.active = this.controllingVariable;
      this.updateVariables();
    },
  }
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
//@import '../../assets/css/template_crunch.scss';


</style>
