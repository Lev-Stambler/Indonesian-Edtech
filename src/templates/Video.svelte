<div class="container">
  <p>
    {text}
  </p>
  <video src="{vidSrc}" height="600" width="800">
    <source src="{vidSrc}" type="video/mp4">
  </video>
</div>
<style>
  .container {
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
</style>
<script>
  export let vidSrc = false
  export let text = ''
</script>