import { createSignal } from "solid-js"
import { toast } from "~/components/Toasts"
import { createFrameBuffer, createQuad, TextureFormats } from "./glUtils"
import { Setting, settings } from "./settingsStore"
import basicFragment from "../glsl/basic.frag"
import hdrFragment from "../glsl/hdr.frag"
import Shader from "./Shader"

export const [canvasSize, setCanvasSize] = createSignal<number[]>([1280, 1080])
export const [drawBufferSize, setDrawBufferSize] = createSignal<number[]>([1080, 1080])

const initRender = (canvas: HTMLCanvasElement) => {
  const gl: WebGL2RenderingContext|null = canvas.getContext("webgl2")
  if (!gl) throw new Error("WebGL2 not supported")
  gl.getExtension("EXT_color_buffer_float")

  setCanvasSize([canvas.width, canvas.height])
  setDrawBufferSize([canvas.width, canvas.height])

  const program = Shader.fromFragment(gl, basicFragment, "Basic fragment")
  const postProgram = Shader.fromFragment(gl, hdrFragment, "HDR")

  program.use();
  createQuad(gl, program.program)


  /**
   * Hdr framebuffer setup
   */
  const {
    texture: hdrTexture,
    frameBuffer: hdrFbo
  } = createFrameBuffer(gl, canvas.width, canvas.height, TextureFormats.HalfFloat)

  const start = Date.now()

  const render = () => {
    
    /**
     * Render to buffer
     */
    program.use();
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, hdrFbo)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    
    const [w, h] = canvasSize()
    const [dbw, dbh] = drawBufferSize()
    
    program.setUniform2f("u_resolution", dbw, dbh);
    // program.setUniform2f("u_canvasSize", w, h);
    program.setUniform1f("u_time", (Date.now() - start) / 1000.0);
  
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    
    /**
     * Render to screen from buffer
     */
    postProgram.use();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    
    
    postProgram.setUniform2f("u_resolution", dbw, dbh);
    

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, hdrTexture)
    postProgram.setUniform1i("u_texture", 0);
    postProgram.setUniform1f("u_gamma", 1.0);
    postProgram.setUniform1f("u_exposure", 2.0);
  
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  toast("Graphics initialised")


  return {
    render: () => requestAnimationFrame(render)
  }
}

export default initRender