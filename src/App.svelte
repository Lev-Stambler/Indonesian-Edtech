<script>
	export let name;
	import levels from "./levels/levels.js"
	let currentLevel = 0
	let currentSublevel = 0
	let CurrentScreen = levels[currentLevel][currentSublevel]
	let CurrentComponent = levels[currentLevel][currentSublevel].template
</script>

<style>
</style>

<CurrentComponent {...CurrentScreen.opts}/>
