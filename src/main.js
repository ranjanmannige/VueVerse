import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())

// import our global pinia variables
import { globalVariables } from '@/stores/global.js'
const global = globalVariables()

global.$projects.forEach((projectDict) => {
    const _name          = projectDict['projectName'];
    const _urlPath       = projectDict['projectPath'];
    const _componentPath = projectDict['projectLocation'];
    const _backgroundImage = projectDict['backgroundImage'];
    
    router.addRoute({
        path: _urlPath,
        name: _name,
        backgroundImage: _backgroundImage,
        component: () => import(_componentPath /* @vite-ignore */)
    })
})

console.log('global',global.$commonvariables.companyNamePossesive);



document.title = global.$commonvariables.companyNamePossesive + ' Apps';
//document.title = global.commonvariables //companyNamePossesive+s'

app.use(router)

import '@/assets/main.css'
//import '@/assets/foundation-icons/foundation-icons.css';
//import '@/assets/fontawesome-free-5.13.0-web/css/all.min.css';
//import '@/assets/fontawesome-free-7.0.0-web/css/all.min.css';

import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
library.add(fas, far, fab)
dom.watch();



import '@/assets/css/main_theme.css'

// A universally directed vue directive, useful for dropdown menues
// ... also, a very useful template to create your own vue directive magic :)
// From https://stackoverflow.com/questions/63869859/migrating-detect-click-outside-custom-directive-from-vue-2-to-vue-3
// Use as <someElement v-click-outside="dosomething"></someElement>
app.directive('click-outside', {
    beforeMount(el, binding, vnode) {
        el.clickOutsideEvent = function(event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event, el);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
    }
});


app.component("font-awesome-icon", FontAwesomeIcon).mount('#app')

