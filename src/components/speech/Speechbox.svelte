<script>
  export let text
  export let speaker
</script>
<style>
.box {
  background: white;
  border: black 3px solid;
  display: inline-block;  
  width: 100%;
  height: 100%;
  clip-path: polygon(2% 2%, 6% 0%, 94% 0%, 98% 2%, 100% 6%, 100% 94%, 98% 98%, 94% 100%, 6% 100%, 2% 98%, 0% 94%, 0% 6%)
}
.speaker {
  font-weight: 500;
  padding-left: 1.2rem;
  padding-top: 1rem;
}
p {
  padding: 1rem;
  padding-top: 0.3rem;
  /* word-break: break-all; */
  overflow-wrap: break-word;
  white-space: normal;
}
</style>
<div class="box">
  <div class="speaker">{speaker}</div>
  <p>
    {#each text.replace(/[\n\r]/g, '').split(' ') as word, index}
      <div data-aos="flip-left" style="display: inline-block;" data-aos-delay="{index * 50}">
        { word.trim() }&nbsp;
      </div>
    {/each}
  </p>
</div>