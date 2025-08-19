<template>
  <div style='display:inline-block;'>
    <span
      v-bind:for='id + "-button"'
      class='button'
      v-bind:class='{ button__on: active }'
      v-bind:title='"Show" + name'
      v-html='content'
      v-on:click='togglePanel()'
    >
    Hi
    </span>
  </div>
</template>

<script>
export default {
  props: ['name', 'contentOn', 'contentOff', 'value'],
  data() {
    return {
      id: 1,
      active: true,
      content: this.contentOn,
    };
  },
  methods: {    
    togglePanel(){
      console.log(this.name);
      console.log(this.content);
      console.log('YAY');
      this.active === true ? this.active = false : this.active = true;
      if(this.active === true){
        this.content = this.contentOn;
      } else {
        this.content = this.contentOff;
      }
      //
    }
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
@import '../assets/css/template_crunch.scss';

</style>
