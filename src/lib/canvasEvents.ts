import { NodeRenderPass } from "./NodeRenderPass";
import { renderPasses } from "./render";

export const setupCanvasEventHandlers = (canvas: HTMLCanvasElement) => {
  const mainPass = renderPasses.mainPass as NodeRenderPass

  let isDragging = false
  let offsetX = 0
  let offsetY = 0

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true
    canvas.style.cursor = "grabbing"
  })
  window.addEventListener("mouseup", (e) => {
    isDragging = false
    canvas.style.cursor = "grab"
  })
  window.addEventListener("mousemove", (e) => {
    if (isDragging) {
      offsetX -= e.movementX / window.innerHeight
      offsetY += e.movementY / window.innerHeight
      mainPass.shader.uniforms.u_position.setValue([offsetX, offsetY])
      mainPass.enqueueUpdate()
    }
  })
}