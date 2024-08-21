import { JSXElement, onMount } from "solid-js";
import initRender from "~/lib/render";

export default function Home() {
  let canvas: HTMLCanvasElement|undefined;

  onMount(() => {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.8;
      const { render } = initRender(canvas)
      render();
    }
  })

  return (
    <main class="w-[100vw] h-[100vh]">
      <div class="w-[100vw] h-[80vh]">
        <canvas ref={canvas} width={1280} height={500} />
      </div>
    </main>
  );
}
