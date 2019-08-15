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
	setCurrentOnLoad()
	_CurrentScreen.subscribe(val => { CurrentScreen = val })
	_CurrentComponent.subscribe(val => { CurrentComponent = val })
	function setCurrentOnLoad() {
		const url = window.location.href
		if (url.indexOf("#") !== -1) {
			const levelMap = url.split("#")[1]
			currentLevel = levelMap.split('/')[0] || 0
			currentSublevel = levelMap.split('/')[1] || 0
		}
		setScreen()
	}
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
			currentSublevel = currentLevel >= 0 ? levels[currentLevel].length - 1 : currentSublevel--
			currentSublevel = currentSublevel >= 0 ? currentSublevel : 0
		}
		setScreen()
	}

	function setScreen() {
		window.location.hash = currentLevel + "/" + currentSublevel
		mainVis = false
		_CurrentScreen.set(levels[currentLevel][currentSublevel])
		_CurrentComponent.set(levels[currentLevel][currentSublevel].template)
		setTimeout(() => {mainVis=true}, 40)
	}
	// document.onload = () => {
	// 	document.documentElement.requestFullscreen();
	// }
	// function GoInFullscreen(element) {
	// 	if(element.requestFullscreen)
	// 		element.requestFullscreen();
	// 	else if(element.mozRequestFullScreen)
	// 		element.mozRequestFullScreen();
	// 	else if(element.webkitRequestFullscreen)
	// 		element.webkitRequestFullscreen();
	// 	else if(element.msRequestFullscreen)
	// 		element.msRequestFullscreen();
	// }
</script>

<style>
.direction-selection {
	z-index: 2;
	position: absolute;
	top: 1%;
	right: 1%;
	left: 70%;
	display: flex;
	justify-content: space-between;
}
.main-content {
	z-index: 1;
	position: relative;
	height: 100%;
}

button.back {
	background: url("static/misc/BtnBack.png");
}

button.next {
	background: url("static/misc/BtnNext.png");
}
button {
	background-size: cover!important;
	height: 40px;
	width: 90px;
	border: 0px;
	cursor: pointer;
}

.border-wrapper {
	padding: 2rem;
	width: 100%;
	height: 100%;
	background: url("static/bckgrnds/CityNight.png");
	background-size: contain;
}

.border {
	border: 6px gold;
	border-style: groove;
	position: relative;
	width: calc(100% - 4rem);
	height: calc(100% - 4rem);
	box-shadow: 10px 10px 15px 0px black;
}
</style>

<div class="full background"></div>
<div class="direction-selection">
	<button on:click="{() => decrementStage()}" class="back"></button>
	<button on:click="{() => incrementStage()}" class="next"></button>
</div>
{#if mainVis}
<div class="border-wrapper">
	<div class="border">
		<div class="main-content">
			<CurrentComponent {...CurrentScreen.opts}/>
		</div>
</div>
</div>
{/if}
