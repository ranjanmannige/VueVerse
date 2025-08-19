
<template>
  <div class="inner-card"  id="divGraph" ref="divGraph" style="padding:5px !important; margin:0px !important;">
  <!--
  <div v-if="menuOn===true" v-on:click="toggleMenu()" style="background-color: grey; width:1%; height: 90%; position: absolute; top: 100; right: 0;">
  aha  
  </div>
  -->
  <!-- <span v-on:click="test()">test</span> -->
  <div ref="editorNode" id="editorNode">
  </div>
  <!-- 
  <QuillEditor theme="snow" toolbar="minimal" />  
  -->
  </div>
</template>

<script>
//import {createApp} from 'vue';
//import App from "@/App.vue";
//let app = createApp(App);
import { getCurrentInstance } from 'vue'
const app = getCurrentInstance();
// pinia stores
import { globalVariables } from '@/stores/global.js'
import { localVariables } from '../stores/local.js'


/* import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@vueup/vue-quill/dist/vue-quill.bubble.css';
require("quill-mention");  */

//const axios = require('axios');
import axios from 'axios';
import * as jquery from 'jquery';

// TODO: disappear the mention list if mouse clicks out of the window bounds hideMentionList();
import Quill from 'quill'; 
import "quill-mention"; 
const Parchment = Quill.imports.parchment;
const Delta = Quill.imports.delta;
const Embed = Quill.import("blots/embed");
class MentionBlot extends Embed {
  static create(data) {
    const node = super.create();
    //const denotationChar = document.createElement("span");
    //denotationChar.className = "ql-mention-denotation-char";
    //denotationChar.innerHTML = data.denotationChar;
    //node.appendChild(denotationChar);
    node.innerHTML += data.value;
    node.contenteditable = 'true';
    return MentionBlot.setDataValues(node, data);
  }
  static setDataValues(element, data) {
    const domNode = element;
    Object.keys(data).forEach(key => {
      domNode.dataset[key] = data[key];
    });
    domNode.contenteditable='true';
    return domNode;
  }

  static value(domNode) {
    return domNode.dataset;
  }
}

MentionBlot.blotName = "mention";
MentionBlot.tagName = "span";
MentionBlot.className = "ql-label";

Quill.debug('error');
Quill.register(MentionBlot);

// ==================================================================================


export default {
  data() {
    return {
      global: globalVariables(),
      local: localVariables(),
      menuOn:false,
      serverpath:'',
      editorContent: null,
      editorInstance: null,
      editorMentionTrigger: '>>>',
      availableOptions:['Tab to suggest funny', 'Tab to Suggest sad', 'Tab to suggest angry'],
      availableOption: 'original',
      suggestionColor:'#b3ffff'
    };
  },
  props: {
    value: { type: String, default: 'This is a value' }
  },
  components:{
    //QuillEditor
  },
  mounted() {
    //
    var vm = this;
    this.serverpath   = this.global.$commonvariables.serverpath;
    this.doSomePossiblePreActivity()
    .then( function(){
        vm.initializeEditor();
        // We need to manually supply the HTML content of our custom dropdown list
        //vm.updateBrainPicker();
      });
  },
  beforeDestroy () {
    // Turn off all listeners set on text-change
    this.editorInstance.off('text-change')
  },
  watch: {
    //
    value (newVal) {
      // Only update the content if it's changed from an external source
      // or else it'll act weird when you try to type anything
      if (newVal !== this.editorContent) {
        this.editorInstance.pasteHTML(newVal)
      }
    }
  },
  computed:{
    cursorPos(){
      const range = this.editorInstance.getSelection();
      if (range == null) return 0;
      return range.index;
      //
    }
  },
  created() {
    //
  },
  methods: {
    //
    toggleMenu(){
      this.menuOn = !this.menuOn;
    },
    askForSuggestions(prompt='Hello.'){
      //const promptResponse = axios.get(this.serverpath+'/completeme', { params: { prompt:prompt, model_key:this.availableOption,} }) 
      const promptResponse = {
        dataIsTrue: false,
        data: { suggestions: [
                  ' ...this is one suggestion...',
                  ' ...this is another suggestion...',
                  ' ...this the last suggestion...',
                  ' ...Or is it?'
                ]
              }
      }
      return promptResponse
      /* .then(response => (console.log(response)));
      console.log('YAY!');
      return false; */
    },
    async makeSuggestions(x){
      //
      var editor_content = this.editorInstance.container.innerHTML;
      editor_content = jquery("#editorNode").text();
      //console.log(this.editorInstance.getText());
      var editor_elemements = this.editorInstance.getContents().ops; //JSON.stringify(this.editorInstance.getContents());
      var prompting_text = '';
      for(var i=0; i<editor_elemements.length; i++){
        if(editor_elemements[i].insert.mention == undefined){
          // then we have a regular element
          //editor_elemements[i] = editor_elemements[i].replaceAll(this.editorMentionTrigger,'')
          var currentText = '';
          if(editor_elemements[i].insert.label == undefined){
            currentText = editor_elemements[i].insert;
          } else {
            currentText = editor_elemements[i].insert.label;
          }
          currentText = currentText.replaceAll(this.editorMentionTrigger,'');
          prompting_text += currentText;
        } else {
          var currentText = editor_elemements[i].insert.mention.value;
          currentText = currentText.replaceAll(this.editorMentionTrigger,'');
          prompting_text += currentText;
        }
      }
      //
      var returns = await this.askForSuggestions(prompting_text);
      const raw_suggestions = returns['data'].suggestions;
      var suggestions = [];
      suggestions.push({'id':0,value:'.'});
      for (var i = 0; i < raw_suggestions.length; i++) { 
        suggestions.push({'id':i+1,value:raw_suggestions[i]}); 
      } 
      // the final suggestion is a blank, to escape the suggestion cycle!
      
      // Suggestions should look like this
      /* var suggestions = [
        { id: 1, value: "Fredrik Sundqvist" },
        { id: 2, value: "Patrik Sjölin" }
      ]; */
      return suggestions;
    },
    async doSomePossiblePreActivity(){
      // We could pre-populate some server-side material
      // E.g.:
      //let listOfOptions = await axios.get(this.serverpath+'/listbrains')
      // this.availableOptions = listOfOptions.data.brains;
    },
    test(){
      this.editorInstance.enable(true);
    },
    getTextBeforeCursor() {
      /* const startPos = Math.max(0, this.cursorPos - this.options.maxChars);
      const textBeforeCursorPos = this.quill.getText(
        startPos,
        this.cursorPos - startPos
      );
      return textBeforeCursorPos; */
      return 0
    },
    initializeEditor () {
      var vm = this;
      // Set initial content that's going to be picked up by Quill
      this.$refs.editorNode.innerHTML = this.value
      // Create the Quill instance
      this.editorInstance = new Quill(this.$refs.editorNode, {
          modules: {
            mention: {
              mentionDenotationChars: [vm.editorMentionTrigger],
              allowedChars:/^[a-zA-Z0-9_]*$/,
              minChars:0,
              maxChars:10,
              positioningStrategy: 'fixed',
              fixMentionsToQuill: false,
              //offsetTop:2,
              //offsetLeft:0,
              isolateCharacter:false, 
              defaultMenuOrientation:"bottom",
              showDenotationChar:false,
              onSelect: function (item, insertItem) {
                // Getting the text selection
                var selection = vm.editorInstance.getSelection(true);
                // Getting cursor position
                var cursorPos = 0;
                if (selection !== null) cursorPos = selection.index;
                // Getting text before cursor position
                const startPos = Math.max(0, cursorPos);// - vm.editorInstance.options.maxChars);
                const textBeforeCursorPos = vm.editorInstance.getText(startPos, cursorPos - startPos);
                //
                const mentionCharLength = vm.editorMentionTrigger.length;
                //
                var mentionCharPos = cursorPos - mentionCharLength; //(textBeforeCursor.length - mentionCharIndex);
                //
                // DELETING THE TRIGGER STRING
                vm.editorInstance.deleteText(mentionCharPos,vm.editorMentionTrigger.length);
                //
                //this._quill.insertText(selection.index, mergeFieldText);
                //
                selection = vm.editorInstance.getSelection(true);
                vm.editorInstance.insertText(selection.index, item.value);
                //, {
                //  'background': vm.suggestionColor, //'#00FEFE',//'#ffff00'
                //});
                /*
                // resetting the text formatting
                selection = vm.editorInstance.getSelection(true);
                vm.editorInstance.insertText(selection.index, ' ', {
                  'background': '#ffffff',
                });
                */
                //vm.editorInstance.clipboard.dangerouslyPasteHTML(cursorPos, item.value); 
                //insertItem(item, false);
              },
              //listItemClass:null,
              //mentionContainerClass:null,
              //mentionListClass:null,
              editable:true,
              contenteditable:true,
              spaceAfterInsert:false,
              /* onClose: function(x){
                var editableElements = document.querySelectorAll("span[contenteditable=false]");
                for (var i = 0; i < editableElements.length; ++i) {
                  console.log(i);
                  editableElements[i].setAttribute("contentEditable", true);
                }
                vm.editorInstance.enable(true);
              }, */
              blotName:'mention',
              source: async function(searchTerm, renderList) {
                const matchedPeople = await vm.makeSuggestions(searchTerm);
                //console.log('matchedPeople',matchedPeople)
                renderList(matchedPeople); 
              }
            },
            keyboard: {
              bindings: {
                tab: {
                  key: 9,
                  handler: function() {
                    // Handle tab
                    // Elicits the automention trigger
                    vm.editorInstance.getModule("mention").openMenu(vm.editorMentionTrigger);
                    return false
                  },
                },
              }
            },
            toolbar: {
              container: [
                [{ 'someOption': vm.availableOptions}], // ['original', 'twain_brain', 'jane_brain','toy_brain'] }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
                //['blockquote', 'code-block' ],
                //[{ 'header': 1 }, { 'header': 2 }],
                [
                  //{ 'list': 'ordered' }, 
                  //{ 'list': 'bullet' }, 
                  { 'align': [] }
                ],
                //[{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [
                  { 'color': [] },        // change font color
                  //{ 'background': [] }, // change background color
                ],
                ['clean'], // clear formatting
                ['link','image'],
                //['link', 'image', 'video'],
                //[{ 'direction': 'rtl' }]
              ],
              handlers: {
                "availableOption": function (value) { 
                  if (value) {
                    vm.availableOption = value;
                    //vm.updateBrainPicker();
                    //const cursorPosition = vm.editorInstance.getSelection().index;
                    //vm.editorInstance.insertText(cursorPosition, value);
                    //vm.editorInstance.setSelection(cursorPosition + value.length);
                  }
                }
              }
            }
          },
          theme: 'snow'
        }
      )
      // Setup handler for whenever things change inside Quill
      this.editorInstance.on('text-change', this.onEditorContentChange)
      // Save any initial content to this.editorContent
      this.setEditorContent()
    },
    onEditorContentChange () {
      // Whenever we change anything, update this.editorContent
      this.setEditorContent()
      // Then emit its value as input so we have a working v-model
      // This $emit will be catched up in the watch:value
      // that's why we guard against calling pasteHTML
      // calling that function while we are typing is undesirable
      this.$emit('input', this.editorContent)
    },
    setEditorContent () {
      this.editorContent = this.editorInstance.getText().trim()
        ? this.editorInstance.root.innerHTML
        : ''
    }
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss'>
@import '@/assets/css/vue-transition.css';
@import '@/assets/css/quill.snow.css';
@import '@/assets/css/quill.mention.css';

.highlight {
  background-color: #FFFBCC;
  padding: 0.3em;
  margin: 0 0.2em;
}

</style>
