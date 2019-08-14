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
    background: rgba(102, 102, 102, 0.52);
    padding: 1rem;
    max-width: 70%;
    border-radius: 1rem;
  }
  h1 {
    color: white;
    font-size: 4rem;
    padding: 1rem;
  }
  p {
    color: rgb(243, 243, 243);
    font-size: 2rem;
  }
</style>
<img src="static/bckgrnds/{backgroundSrc}" alt="" class="background">
<div class="wrapper">
  <div class="transpar">
    <h1>{header}</h1>
    <p>{subtext}</p>
  </div>
</div>