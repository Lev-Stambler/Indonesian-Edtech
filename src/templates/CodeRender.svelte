<script>

// localStorage.setItem('user', JSON.stringify(user));

// Then to retrieve it from the store and convert to an object again:

// let user = JSON.parse(localStorage.getItem('user'));

// If we need to delete all entries of the store we can simply do:

// localStorage.clear();

  let textareas = document.getElementsByTagName('textarea');
  let count = textareas.length;

  function allowTab(e) {
    if(e.keyCode==9 || e.which==9){
      e.preventDefault();
      let s = this.selectionStart;
      this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
      this.selectionEnd = s+1; 
    }
  }

  export let htmlRender = ""
  export let text = false
</script>
<style>
  .container {
    padding: 1rem;
    padding-top: 5rem;
    width: 100%;
    height: 100%;
    background: rgb(59, 59, 59);
  }

  .editor-container {
    padding: 1rem;
    display: flex;
    width: 100%;
    height: 80vh;
    overflow: auto;
  }
  .elem {
    width: 47%;
    margin: 0.5rem;
  }
  .elem.renderSpot {
    background: white;
    border: 1px solid black;
    /* padding: 1rem; */
  }
  .top-container {
    display: flex;
    padding-left: 2rem;
    width: 100%;
    justify-content: space-between;
  }
  .top-container div {
    width: 50%;
  }
  textarea {
  background: url(http://i.imgur.com/2cOaJ.png);
  background-attachment: local;
  background-repeat: no-repeat;
  padding-left: 35px;
  padding-top: 10px;
  border-color: #ccc;
  font-size: 13px;
  line-height: 16px;
}

  .textarea-wrapper {
    display: inline-block;
    background-image: linear-gradient(#F1F1F1 50%, #F9F9F9 50%);
    background-size: 100% 32px;
    background-position: left 10px;
  }
  p {
    background: rgb(255, 255, 255);
    color: rgb(65, 65, 65);
    padding: 1rem;
    border-radius: 0.4rem;
    display: inline-block;
  }
</style>
<div class="container">
  {#if text}
    <p>
      {text}
    </p>
  {/if}
  <div class="top-container" style="display: flex; color: white; width: 100%;">
    <div>Edit your code:</div>
    <div>See your code</div>
  </div>
  <div class="editor-container">
    <div class="editSpot elem textarea-wrapper">
      <textarea name="" id="" cols="400" rows="10" style="width: 100%; height: 100%;" bind:value={htmlRender} on:keydown="{ allowTab }"></textarea>
    </div>
    <div class="renderSpot elem">
      {@html htmlRender}
    </div>
  </div>
</div>