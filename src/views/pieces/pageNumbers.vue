<template>
  <div v-bind:class="{'header-top':showPageNumbersUp,'header-bottom':!showPageNumbersUp}"> <!-- style='display:inline-block;'> -->
    <!-- <span v-on:click="test2()">test</span> -->
    <div v-if="pagesToPassages !== undefined">
      <span style="cursor: auto !important; font-weight: bold;" v-bind:class="{'font-unselected':true}">
        
        <!-- BUTTONS TO TOGGLE THE LOCATION OF THE PAGE NUMBERS -->
        <span title='Move numbers to the bottom of the screen'
              v-if="showPageNumbersUp===true" 
              v-on:click="showPageNumbersUp=false">
          <i class="fas fa-caret-down"></i> 
        </span>
        <span title='Move numbers to the top of the screen'
            v-else v-on:click="showPageNumbersUp=true">
          <i class="fas fa-caret-up"></i>
        </span>

        <!-- JUST A SPACER -->
        <span style='padding-right:4px;'></span>

        <!-- PAGE or PAGES? -->
        <span v-if="pagesToPassages.length > 1">Pages</span>
        <span v-else>                           Page </span>
        
      </span>
      <span v-for='passages,page in pagesToPassages'
            v-bind:key='page'
            v-on:click="currentPage=page"
            >
        <span v-bind:title="'go to page '+(page+1)" v-bind:class="{'font-unselected':page!==currentPage, 'font-selected':page===currentPage}">
          <!-- remember, our pages are 0-indexed -->
          {{page+1}}
        </span>
      </span>
    </div>
  </div>
</template>

<script>

//module.exports = {
export default {
  props: {
    parentPagesToPassages:Array,
    parentCurrentPage: Number,
    parentShowPageNumbersUp: Boolean,
  },
  data() {
    return {
      currentPage: 0,
      pagesToPassages:[0],
      showPageNumbersUp:false,
    };
  },
  mounted() {
    //if(this.parentPagesToPassages !== undefined) this.pagesToPassages = this.parentPagesToPassages;
    this.pagesToPassages = this.parentPagesToPassages;
    //
    this.currentPage = this.parentCurrentPage;
    this.showPageNumbersUp = this.parentShowPageNumbersUp;
  },
  watch: {
    currentPage(){ 
      this.emitpage() 
    },
    showPageNumbersUp(){
      this.emitlocation()
    },
    parentShowPageNumbersUp(){
      this.showPageNumbersUp = this.parentShowPageNumbersUp;
    },
    parentPagesToPassages(){
      // just making sure that we can show 'Page 1' even if there is no legitimate prop (beats 'Page' ...what?)
      if((this.parentPagesToPassages !== undefined)&(this.parentPagesToPassages.length>0)){
        this.pagesToPassages = this.parentPagesToPassages;
      } else {
        // the dummy page to passages
        this.pagesToPassages = [0];
      }
    },
    parentCurrentPage(){
      // Same as above
      // just making sure that we can show 'Page 1' even if there is no legitimate prop (beats 'Page' ...what?)
      if(this.parentCurrentPage !== undefined){
        this.currentPage = this.parentCurrentPage;
      } else {
        // the dummy page to passages
        this.currentPage = 0;
      }
    },
  },
  /* computed:{
    pagesToPassages(){
      return this.$props.parentPagesToPassages;
    }
  }, */
  methods: {
    test2(){
      console.log('AAAA',this.parentPagesToPassages.length);
      console.log('BBBB',this.pagesToPassages);
    },
    emitlocation() {
        this.$emit('update-location', this.showPageNumbersUp);
    },
    emitpage() {
        this.$emit('update-current-page', this.currentPage);
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
//@import '../../assets/css/template_crunch.scss';

.font-unselected {
  //border: 1px solid $color-fiord !important;
  //border-radius: 4px;
  //padding: 5px;
  //background-color: rgba(255, 255, 255, 1.0);
  //box-shadow: 0 0 8px grey;
  color: $color-fiord;
  cursor: pointer;
  font-size:small;
}

.font-selected {
  background-color: $color-fiord;
  color: $color-white;
  padding-left: 3px;
  padding-right: 1px;
  padding-top: 1px;
  padding-bottom: 1px;
  margin-left: 2px;
  margin-right: 2px;
  cursor: pointer;
  font-weight: bold;
  border-radius:10%;
  font-size:small;
}


.header-top {
  border-bottom: 0px solid $color-fiord !important;
  margin-bottom: 0px;
  padding-bottom: 0px;
}

.header-bottom {
  border-top: 1px solid $color-fiord !important;
  margin-top: 0px;
  padding-top: 0px;
}

</style>
