import MainPlayer from "../components/players/MainPlayer.svelte"
import PersonLeft from "../templates/PersonLeft.svelte"
import CodeRender from "../templates/CodeRender.svelte"
import Init from "../templates/Initial.svelte"

console.log(PersonLeft)

export default [
  { 
    template: Init,
    opts: { subtext: 'Click next to start level one', header: 'Now, the real work begins, let\'s learn some HTML' }
  },
  {
    template: PersonLeft,
    opts: { 
      text: `Hi! My name is Diah, and this is my hometown of Jakarta! 
Jakarta is the largest city in Indonesia, and also its capital! Over 10 million people live here!
There are so many people who come to here for opportunities in business and education!`,
      Character: MainPlayer,
      backgroundSrc: "CityNight.jpg"
    }
  },
  {
    template: PersonLeft,
    opts: {
      Character: MainPlayer,
      text: `I am on a mission to explore other parts of my beautiful country. Why don’t you come along?`,
      backgroundSrc: "CityNight.jpg"
    }
  },
  {
    template: PersonLeft,
    opts: {
      Character: MainPlayer,
      text: `The first stop on our journey will be Magelang! This city is home to the Borobudur Temple, the world’s biggest Buddhist Temple!`,
      backgroundSrc: "BorbMap.png",
      top: true
    }
  },
  {
    template: PersonLeft,
    opts: {
      Character: MainPlayer,
      text: `Let’s stop by and explore what it’s like!`,
      backgroundSrc: "BorbMap.png",
      top: true
    }
  },
  {
    template: CodeRender
  }
]