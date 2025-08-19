<template>
  <!-- <div style="width:800px; margin:0 auto; background-color:red;margin-bottom: 50px;"> -->
  <div>
    <div><br>{{global.$commonvariables.companyName}}'s Available Apps</div>
    <div class="gallery">
      
      <!-- 
      !!!!!!!!!!!!!!!!!This method would be preferable, but the dynamic loading process causes the links to be cashed 
      !!!!!!!!!!!!!!!!!(and so all projects will looke like the first one)
      
        <div
          v-for='projectDeets in global.$projects'
          v-bind:key='projectDeets.projectName'
          class='tile'
          v-on:click.prevent="rerouteTo(projectDeets.projectPath)"> 
        "{{projectDeets.projectPath}}"
      </div>
      -->
      <a  v-for='projectDeets in global.$projects'
          v-bind:href="projectDeets.projectPath"
          v-bind:key='projectDeets.projectName'
      >
        <div class='tile' :style="{ backgroundImage: 'url(' + projectDeets.backgroundImage + ')' }">  
          <!-- Only show the project name if the background image (projectDeets.backgroundImage) is none -->
           <span class="tiletext">
            {{projectDeets.backgroundImage ? projectDeets.projectName : projectDeets.projectName}}
           </span>
        </div>
      </a>
    </div>
  </div>
</template>


<script>
import { createApp } from 'vue'
const app = createApp({})
//import { getCurrentInstance } from 'vue'
//const app = getCurrentInstance();
// router tools
import { useRoute } from 'vue-router'
import { RouterLink, RouterView } from 'vue-router'
// pinia stores
import { globalVariables } from '@/stores/global.js'

export default {
  name: 'Home',
  data() {
    return {
      //$route:useRoute(),
      global: globalVariables()
    };
  }, // end of data
  methods: {
    rerouteTo(_name){
      // Sending the selected doc ids to the exploration component
      console.log('retouting to:',_name);
      this.$router.push( { path: _name, params: {} } );
      // ... WARNING: don't use this.$outer.push({'path': ...}) ... it does not let you submit params
    },
  }, // end of methods
};
</script>

<style  lang='scss' scoped>

.gallery{
  display: flex; /* or inline-flex */
  flex-wrap: wrap;
  justify-content:center;
  width:100%;
  background-color: #ffffff;
}

.tile{
  cursor:pointer;
  border-radius: 10px;
  min-width: 7em;
  height: 7em;
  line-height: 6em;
  margin: 0.3em;
  padding: 0.3em;
  color: $color-white;
  //background-color: $color-fiord;
  background: $color-fiord; // url('/src/views/project1/icon.jpg')!important;
  border: 1.5px solid $color-text;
  box-shadow: 3px 3px 5px #888888;
  background-size:     cover;                      /* <------ */
  background-repeat:   no-repeat;
  background-position: center center;              /* optional, center the image */
  word-break: break-all;
}

.tiletext{
  flex-wrap: wrap;
  cursor:pointer;
  //text-align:center;
  word-break: break-all;
  border: 1.5px solid black;
  padding:2px; 
  border-radius: 6px; 
  color: rgba(0,0,0,1); 
  background-color: rgba(255, 255, 255, 0.7);
}


</style>