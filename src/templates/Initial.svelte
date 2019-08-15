<script>
  export let backgroundSrc = "CityNight.jpg"
  export let header = "Welcome"
  export let subtext = "Welcome"
</script>
<style>
  .wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  .transpar {
    background: rgb(108, 144, 74);
    padding: 1rem;
    max-width: 70%;
    border-radius: 1rem;
  }
  h1 {
    color: rgb(255, 255, 255);
    font-size: 4rem;
    padding: 1rem;
  }
  p {
    color: rgb(0, 255, 255);
    font-size: 2rem;
  }
</style>
<img src="static/bckgrnds/{backgroundSrc}" alt="" class="background">
<div class="wrapper">
  <div class="transpar">
    <h1>
      {#each header.replace(/[\n\r]/g, '').split(' ') as word, index}
        <div data-aos="fade-up" style="display: inline-block;" data-aos-delay={index * 50}>
          { word.trim() }&nbsp;
        </div>
      {/each}
    </h1>
    <p data-aos="fade-left" data-aos-delay=300>{subtext}</p>
  </div>
</div>