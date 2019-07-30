<script>
  import Speechbox from "../components/speech/Speechbox.svelte"
  export let text
  export let Character
  export let charName
</script>
<style>
  .speechcontainer {
    position: absolute;
    bottom: 5%;
    top: 70%;
    left: 10%;
    right: 10%;
  }
</style>
<Character bind:charName={charName}/>
{text}
{charName}

<div class="charactercontainer">
  <Character />
</div>
<div class="speechcontainer">
  <Speechbox speaker={charName} text={text} />
</div>