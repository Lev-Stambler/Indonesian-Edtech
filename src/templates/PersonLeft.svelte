<script>
  import Speechbox from "../components/speech/Speechbox.svelte"
  export let text
  export let Character
  export let charName
  export let backgroundSrc
</script>
<style>
  .speechcontainer {
    position: absolute;
    bottom: 5%;
    top: 70%;
    left: 10%;
    right: 10%;
    z-index: 10;
  }
  .charactercontainer {
    position: absolute;
    bottom: 5%;
    z-index: 9;
    left: -5%;
  }
  img.background {
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }
</style>
<img src="static/bckgrnds/{backgroundSrc}" alt="" class="background">
<div class="charactercontainer">
  <Character bind:charName />
</div>
<div class="speechcontainer">
  <Speechbox speaker={charName} text={text} />
</div>
