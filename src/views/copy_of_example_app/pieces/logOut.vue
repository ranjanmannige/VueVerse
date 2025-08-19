<template>
  <span v-on:click='logoff'>
    LOGOUT
  </span>
</template>

<script>
module.exports = {
  name: 'Logout',
  data() {
    return {
      link: '',
      msg:'',
    };
  },
  props: {
    serverpath: String,
  },
  methods: {
    logoff() {
      const path = this.serverpath+'/logout'
      var vm = this;
      console.log(path);
      this.axios.get(path)
        .then(function(res){
          vm.msg = res.data.msg;
          vm.$emit('modify-msg',vm.msg);
        })
        .catch(function(error){
          console.error(error);
        });
    },
  }
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style>
</style>
