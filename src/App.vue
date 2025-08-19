<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
    <router-view>
    </router-view>  
</template>

<style lang="scss">

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $color-fiord;
  padding: 0px;
  margin:0px;
}

nav {

  padding: 0px;

  font-size: 0.8em;
  color: $color-text;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: $color-fiord;
    }
  }
}
</style>