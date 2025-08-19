import { ref, computed, onUpdated } from 'vue'
import { defineStore } from 'pinia'

import cv from '/common.json'; // this exists in the homepage
import fs from 'fs';
//const fs = require('fs');



// a listing of all existing projects
const projects = import.meta.glob('@/views/*/main.vue');
const images = import.meta.glob('@/views/*/icon.{png,jpg,jpeg,svg,webp}');

// maybe sort the projects at this point
// Getting the project name (the "*" in the previous glob)
// ... then storing this info with the location as a dictionary (placed in a list)
var projectObject = []
for(var projectLocation in projects){
  const matched = projectLocation.match(/views\/(.+)\/main.vue/i)
  
  if(matched.length === 2){
    const projectName = matched[1] // the first object is the whole matched string

    // Getting the base project directory (e.g., /src/views/new_project/ if /src/views/new_project/main.vue exists)
    var originalFile = "main.vue";
    const baseProjectDir = projectLocation.substring(0,projectLocation.length - originalFile.length);
    // Going through the possible listed to see if the base directory matches
    var candidate_image_locations = [];
    for(var imageLocation in images){
      if(imageLocation.substring(0,baseProjectDir.length) == baseProjectDir){
        candidate_image_locations.push(imageLocation);
      }
    }
    const backgroundImage = candidate_image_locations.length>0 ? candidate_image_locations[0] : null ;
    
    projectObject.push({projectPath:'/'+projectName.replaceAll(' ','_'), 
                        projectName:projectName.replaceAll('_',' '), projectLocation:projectLocation,
                        backgroundImage: backgroundImage})
  }
};

export const globalVariables = defineStore({
  id: 'globalVariables',
  state: () => ({
    $commonvariables:cv,
    $projects:projectObject,
  })
})
