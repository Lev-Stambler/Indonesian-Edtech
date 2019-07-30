import MainPlayer from "../components/players/MainPlayer.svelte"
import PersonLeft from "../templates/PersonLeft.svelte"
import CodeRender from "../templates/CodeRender.svelte"

console.log(PersonLeft)

export default [
  {
    template: PersonLeft,
    opts: { 
      text: "asasdj djshdjs hdjsh d",
      Character: MainPlayer,
      backgroundSrc: "generic.jpg"
    }
  },
  {
    template: CodeRender
  }
]