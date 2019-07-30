<script>
	import levels from "./levels/levels.js"
	import { writable } from 'svelte/store';
	export let name;
	let mainVis = true;
	let currentLevel = 0
	let currentSublevel = 0
	export let CurrentScreen, CurrentComponent
	const _CurrentScreen = writable()
	const _CurrentComponent = writable()
	setScreen()
	_CurrentScreen.subscribe(val => { CurrentScreen = val })
	_CurrentComponent.subscribe(val => { CurrentComponent = val })
	function incrementStage() {
		currentSublevel++
		if (currentSublevel >= levels[currentLevel].length && currentLevel + 1 < levels.length) {
			currentSublevel = 0
			currentLevel++
		} else if(currentSublevel >= levels[currentLevel].length) {
			currentSublevel-- //lool whata hacky piece of code
		}
		setScreen()
	}
	function decrementStage() {
		currentSublevel--
		if (currentSublevel < 0) {
			currentLevel = currentLevel > 0 ? currentLevel - 1 : 0
			currentSublevel = currentLevel > 0 ? levels[currentLevel].length - 1 : currentSublevel--
			currentSublevel = currentSublevel >= 0 ? currentSublevel : 0
		}
		setScreen()
	}

	function setScreen() {
		mainVis = false
		_CurrentScreen.set(levels[currentLevel][currentSublevel])
		_CurrentComponent.set(levels[currentLevel][currentSublevel].template)
		setTimeout(() => {mainVis=true}, 40)
	}
</script>

<style>
.direction-selection {
	z-index: 2;
	position: absolute;
	top: 2%;
	right: 2%;
}
.main-content {
	z-index: 1;
}
</style>

<div class="direction-selection">
	<button on:click="{() => decrementStage()}">I have to go back</button>
	<button on:click="{() => incrementStage()}">Next Please!</button>
</div>
{#if mainVis}
<div class="main-content">
	<CurrentComponent {...CurrentScreen.opts}/>
</div>
{/if}
