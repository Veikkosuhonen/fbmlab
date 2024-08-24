import { FrameBuffer } from "./FrameBuffer";
import { GLResource } from "./GLResource";
import { createQuad } from "./glUtils";
import { NodeRenderPass } from "./NodeRenderPass";

export class GLContext {
  gl: WebGL2RenderingContext
  renderQueue: NodeRenderPass[] = []
  resources: GLResource[] = []
  requestedFrameId?: number

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2")

    if (!gl) {
      throw new Error("Failed to create WebGL2 context")
    }

    this.gl = gl

    createQuad(gl)
  }

  requestRerender() {
    if (this.requestedFrameId) {
      cancelAnimationFrame(this.requestedFrameId)
    }
    this.requestedFrameId = requestAnimationFrame(() => this.processQueue())
  }

  processQueue() {
    this.renderQueue.forEach(r => r.processUpdate())
    this.renderQueue = []
    this.requestedFrameId = undefined
  }

  setTarget(frameBuffer: FrameBuffer) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer.frameBuffer)
  }

  clearTarget() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
  }

  clearColor() {
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  draw() {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)
  }

  dispose() {
    this.resources.forEach(r => r.dispose())

    this.gl.getExtension("WEBGL_lose_context")?.loseContext()
  }
}
