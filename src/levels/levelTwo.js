import MainPlayer from "../components/players/MainPlayer.svelte"
import PersonLeft from "../templates/PersonLeft.svelte"
import CodeRender from "../templates/CodeRender.svelte"
import Init from "../templates/Initial.svelte"
import Video from "../templates/Video.svelte"

console.log(PersonLeft)

export default [
  { 
    template: Init,
    opts: { subtext: 'Click next to start level one', header: 'Now, the real work begins, let\'s learn some HTML' }
  },
  {
    template: PersonLeft,
    opts: { 
      text: `Welcome to Yogakarta, home to the Borobudur temple. This temple has been around since the 9th century (1200 years ago) and has survived many volcanic eruptions, terrorist bombings and even earthquakes!`,
      Character: MainPlayer,
      backgroundSrc: "Borb.png"
    }
  },
  {
    template: PersonLeft,
    opts: {
      Character: MainPlayer,
      text: `This temple is being rebuilt by this team of monks. To get to the next level, you have to help them. Click Next to learn how.`,
      backgroundSrc: "Borb.png"
    }
  },
  {
    template: Video,
    opts: { 
      text: `It's advised that you take notes; but, do not worry. You can always come back and rewatch the video!`,
      url: "https://www.youtube.com/embed/-USAeFpVf_A"
    }
  },
  {
    template: CodeRender,
    opts: {
      text: `Take a second to practice your new found skills. Try to make a header (h1) tag and a paragraph tag (p1)`,
    }
  },
  {
    template: CodeRender,
    opts: {
      challengeText: 'The Monks have a challenge!',
      text: `The monks need to create a flier to alert the members of the temple to sign up to help. Create the basic skeleton of this html page using what you just learned.`
    }
  },
  {
    template: PersonLeft,
    opts: {
      Character: MainPlayer,
      text: `Next stop is Bogor, where we have the Bogor Botanical gardens.`,
      backgroundSrc: "MapNext.png",
      top: true
    }
  }
]