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
    $localPanels:{
      Terms: {
          name: 'Terms',
          title: '<strong>Terms</strong> Discussed',
          id: 'panelTerms',
          buttonContent: '<i class="fas fa-list"></i>',
          active: true,
          order: 4,
      },
      Passage: {
          name: 'Passage',
          title: 'Extracted <strong>Passages</strong>',
          id: 'panelPassage',
          buttonContent: '<i class="fas fa-book"></i>', //'<i class="fas fa-book-open"></i>',
          active: true,
          order: 5,
      },
      /* Network: {
          name: 'Network',
          title: '<strong>Network</strong> Depot',
          id: 'panelNetwork',
          buttonContent: '<i class="fas fa-project-diagram"></i>',
          active: false,
          order: 3,
      }, */
      Atlas: {
          name: 'Atlas',
          title: 'Document <strong>Atlas</strong>',
          id: 'panelDocumentAtlas',
          buttonContent: '<i class="fa-solid fa-diagram-project"></i>',
          active: false,
          order: 3,
      },
      Notebook: {
          name: 'Notebook',
          title: '<strong>Once</strong> Upon a Time ...',
          id: 'panelNotebook',
          buttonContent: '<i class="fa-solid fa-pen-to-square"></i>',
          active: false,
          order: 2,
      },
      PDF: {
          name: 'PDF Viewer',
          title: 'Available <strong>PDFs</strong>',
          id: 'panelPdf',
          buttonContent: '<i class="far fa-file-pdf"></i>', //dark version, not as nice: '<i class="fas fa-file-pdf"></i>',
          active: false,
          order: 1,
      },
    },
    $localGridDirectives: {
      0: { display: 'grid', 'grid-template-columns': '1fr', 'grid-template-rows': '1fr' },
      1: { display: 'grid', 'grid-template-columns': '1fr', 'grid-template-rows': 'auto' },
      2: { display: 'grid', 'grid-template-columns': '1fr 1fr', 'grid-template-rows': '1fr' },
      4: { display: 'grid', 'grid-template-columns': '1fr 1fr', 'grid-template-rows': 'auto' },
      3: { display: 'grid', 'grid-template-columns': '1fr 1fr', 'grid-template-rows': '1fr 1fr' },
      other: {
        display: 'grid',
        'grid-template-columns': '1fr 1fr 1fr',
        'grid-template-rows': '1fr 1fr',
      },
    }
  })
  
  /*  
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
  */
})
