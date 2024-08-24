import { GLContext } from "./GLContext"
import { createFrameBuffer, TextureFormats } from "./glUtils"
import { GLResource } from "./GLResource"

export class FrameBuffer extends GLResource {
  frameBuffer: WebGLFramebuffer
  texture: WebGLTexture

  constructor(context: GLContext, w: number, h: number, format = TextureFormats.Byte) {
    super(context);
  
    const {
      texture,
      frameBuffer
    } = createFrameBuffer(context.gl, w, h, format)

    if (!frameBuffer || !texture) {
      throw new Error("Failed to create framebuffer")
    }

    this.frameBuffer = frameBuffer
    this.texture = texture
  }

  dispose() {
    if (this.isDisposed) return

    this.isDisposed = true
    const { gl } = this.context
    gl.deleteFramebuffer(this.frameBuffer)
    gl.deleteTexture(this.texture)
  }
}