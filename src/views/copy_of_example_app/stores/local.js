import { ref, computed, onUpdated } from 'vue'
import { defineStore } from 'pinia'

export const localVariables = defineStore({
  id: 'localVariables',
  state: () => ({
    $msg:'',
    $projectName:'Test Project 1',
    $linkTuples:[
      { 
          route: 'Home',
          show: '<i class=\'fas fa-house\'></i>&nbsp;&nbsp; Home' 
      },
      {
          route: 'Dashboard',
          show: '<i class=\'fas fa-gauge-high\'></i>&nbsp;&nbsp; Dashboard',
      },
      {
          route: 'Signout',
          show: '<i class=\'fas fa-right-from-bracket\'></i>&nbsp;&nbsp; Log out',
      },
    ],
  })
})
