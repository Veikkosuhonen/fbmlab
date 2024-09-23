import { createSignal, onMount, Show } from "solid-js"
import { getShareLink } from "~/lib/urlParams"

export const Toolbar = () => {
  const [isOpen, setIsOpen] = createSignal(false)
  const [shareButtonText, setShareButtonText] = createSignal("Share current image")

  // First visit? Show help
  onMount(() => {
    const visited = localStorage.getItem("visited")
    if (!visited) {
      setIsOpen(true)
      localStorage.setItem("visited", "true")
    }
  })

  return (
    <div class="px-4 border-b border-slate-600">
      <Show when={isOpen()}>
        <div class="flex p-4">
          <div class="mx-auto text-slate-200 flex flex-col gap-4 w-[40vw]">
            <h1 class="font-bold">Welcome to fbmlab!</h1>
            <p>
              This is a little experimental FBM (Fractal Brownian Motion) -based image generator.
              At this stage it is very unintuitive and the controls can behave strangely, 
              its all based on some weird math I wrote and most of it makes little sense.
              Once you get used to what the different mysterious sliders do though, you can create some interesting images.
            </p>
            <p>
              Start by adding some color from one of the color pickers. (Do not touch alpha, the last slider in the picker). 
              To increase the "contrast" (sort of) of that color, bump up the pow slider below a color picker.
            </p>
            <p>
              You can move the viewport by dragging the image to see different parts of the fractal.
            </p>
            <p>
              The two sliders at the bottom can improve the look of the whole image. For example to increase the overall contrast,
              reduce gamma and increase exposure.
            </p>
            <p>
              If you want to save the image, right click and save as. The image is rendered at the resolution of the canvas.
            </p>
          </div>
        </div>
      </Show>
      <div class="flex justify-between">
        <button onClick={() => setIsOpen(!isOpen())}>{isOpen() ? "Close help" : "Help"}</button>
        <button onClick={() => {
          const shareLink = getShareLink()
          console.log(shareLink)
          navigator.clipboard.writeText(shareLink)
          setShareButtonText("Link copied to clipboard!")
          setTimeout(() => setShareButtonText("Share current image"), 1500)
        }}>{shareButtonText()}</button>
        <a href="https://github.com/Veikkosuhonen/fbmlab" target="_blank" class="underline">Source code</a>
      </div>
    </div>
  )
}