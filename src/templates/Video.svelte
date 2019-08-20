<div class="container">
  <p>
    {text}
  </p>
  <iframe width="660" height="400" src="{url}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
<style>
  .container {
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  p {
    background: rgb(202, 202, 202);
    padding: 2rem;
    border: 2px black solid;
    border-radius: 10px;
  }
</style>
<script>
  export let vidSrc = false
  export let text = ''
  export let url
</script>