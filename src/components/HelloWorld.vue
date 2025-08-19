<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/project1">project1</router-link>
  </nav>
</template>

<script setup>
import { createApp } from 'vue'
const app = createApp({})
//import { getCurrentInstance } from 'vue'
//const app = getCurrentInstance();
// router tools
import { useRoute } from 'vue-router'
import { RouterLink, RouterView } from 'vue-router'
// pinia stores
import { globalVariables } from '@/stores/global.js'
console.log("globalVariables",globalVariables);
</script>


<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
