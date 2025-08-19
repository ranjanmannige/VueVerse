import { ref, computed, onUpdated } from 'vue'
import { defineStore } from 'pinia'


export const dataVariables = defineStore({
  id: 'dataVariables',
  state: () => ({
    // see example_data.js in the same location as this file 
    // to get an example of the $docs structure
    $docs:[], // populate using fillDocs(docs)
    $topicToTermsDictionary:{}, // derived from $docs
    $clearSelections:0, 
    $test:[1,2,3,4]
  }),
  actions: {
    fillDocs(docs){
      this.$docs = docs;
      this.fillTopicsToTermsDictionary();
    },
    fillTopicsToTermsDictionary(){
      //var this.$topicToTermsDictionary = {};
      //return this.$topicToTermsDictionary  
      this.$docs.forEach((passage,pId) => {
        var paraId = pId; //passage['pId']; // var docId  = passage['dId']
        if (passage["pShow"] == 0) {
          //pass
        } else {
          var term_record = passage["pTerms"]; //JSON.parse(passage["pTerms"]);
          if(term_record){
            term_record.forEach( (term,key) => {
              var term_text = term["term"];
              var topics = [term["topic"],'ALL'];
              topics.forEach((topic_text)=>{
                if(!(topic_text in this.$topicToTermsDictionary)) {
                  this.$topicToTermsDictionary[topic_text] = {};
                }
                if(!(term_text in this.$topicToTermsDictionary[topic_text])){
                  this.$topicToTermsDictionary[topic_text][term_text] = {};
                  this.$topicToTermsDictionary[topic_text][term_text]['selected']      = false;
                  this.$topicToTermsDictionary[topic_text][term_text]['sources']       = [];
                  this.$topicToTermsDictionary[topic_text][term_text]['show']          = false;
                  this.$topicToTermsDictionary[topic_text][term_text]['selectedClass'] = false;
                }
                this.$topicToTermsDictionary[topic_text][term_text]['sources'].push(paraId);
              });
            });
          }
        } 
      });
    }
  },
  // computed values
  getters: {
    // Just an example
    $numberOfDocs: (state) => {  
      return  state.$docs.length;
    }
  },
})
