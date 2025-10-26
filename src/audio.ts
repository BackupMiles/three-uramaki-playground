export const playAudio = () => {
  let done = false
  const audio = document.querySelector<HTMLAudioElement>('audio#music')
  const body = document.querySelector<HTMLAudioElement>('body')
  if (!audio || !body) return

  body.onclick = () => {
    if (done) return
    audio.volume = 0.2
    audio.play()
    done = true
    console.log("playing")
  }
}