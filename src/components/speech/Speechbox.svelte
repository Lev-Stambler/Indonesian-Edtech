<script>
  export let text
  export let speaker
</script>
<style>
.box {
  background: white;
  border: black 2px solid;
  display: inline-block;  
  width: 100%;
  height: 100%;
}
.speaker {
  font-weight: 500;
  padding-left: 1.2rem;
  padding-top: 1rem;
}
p {
  padding: 1rem;
  padding-top: 0.3rem;
}
</style>
<div class="box">
  <div class="speaker">{speaker}</div>
  <p>
    {text}
  </p>
</div>