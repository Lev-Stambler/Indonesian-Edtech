import MainPlayer from "../components/players/MainPlayer.svelte"
import PersonLeft from "../templates/PersonLeft.svelte"
import CodeRender from "../templates/CodeRender.svelte"

console.log(PersonLeft)

export default [
  {
    template: PersonLeft,
    opts: { 
      text: `Hi! My name is Diah, and this is my hometown of Jakarta! 
Jakarta is the largest city in Indonesia, and also its capital! Over 10 million people live here!
There are so many people who come to here for opportunities in business and education!`,
      Character: MainPlayer,
      backgroundSrc: "generic.jpg"
    }
  },
  {
    template: PersonLeft,
    opts: {
      Character: MainPlayer,
      text: `I am on a mission to explore other parts of my beautiful country. Why don’t you come along?`,
      backgroundSrc: "generic.jpg"
    }
  },
  {
    template: PersonLeft,
    opts: {
      Character: MainPlayer,
      text: `The first stop on our journey will be Magelang! This city is home to the Borobudur Temple, the world’s biggest Buddhist Temple!`,
      backgroundSrc: "generic.jpg" //TODO change
    }
  },
  {
    template: PersonLeft,
    opts: {
      Character: MainPlayer,
      text: `Let’s stop by and explore what it’s like!`,
      backgroundSrc: "generic.jpg" //TODO change
    }
  },
  {
    template: CodeRender
  }
]