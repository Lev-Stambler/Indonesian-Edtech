<script>
  import Speechbox from "../components/speech/Speechbox.svelte"
  export let text = ''
  export let Character = ''
  export let charName = ''
  export let backgroundSrc = ''
  export let top = false
</script>
<style>
  .speechcontainer {
    position: absolute;
    height: 25%;
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

</style>
<img src="static/bckgrnds/{backgroundSrc}" alt="" class="background">
<div class="charactercontainer">
  <Character bind:charName />
</div>
<div class="speechcontainer" style="{ top ? 'top: 5%; left: 25%; right: 15%;' : ''}">
  <Speechbox speaker={charName} text={text} />
</div>
