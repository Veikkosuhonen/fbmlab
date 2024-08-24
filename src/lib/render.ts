import { createSignal } from "solid-js"
import { toast } from "~/components/Toasts"
import { TextureFormats } from "./glUtils"
import basicFragment from "../glsl/basic.frag"
import hdrFragment from "../glsl/hdr.frag"
import Shader, { Uniform, Uniform1f, Uniform1i, Uniform2f, UniformKind } from "./Shader"
import { GLContext } from "./GLContext"
import { FrameBuffer } from "./FrameBuffer"
import { NodeRenderPass } from "./NodeRenderPass"
import { createStore } from "solid-js/store"

export const [canvasSize, setCanvasSize] = createSignal<[number, number]>([1280, 1080])
export const [drawBufferSize, setDrawBufferSize] = createSignal<[number, number]>([1080, 1080])

export const [
  renderPasses,
  setRenderPasses
] = createStore<Record<string, NodeRenderPass>>({})

interface UniformUpdater {
  uniform: Uniform<keyof UniformKind>,
  update: () => void
}

const internalUniforms: UniformUpdater[] = []

const initRender = (canvas: HTMLCanvasElement) => {
  const gl: WebGL2RenderingContext|null = canvas.getContext("webgl2")
  if (!gl) throw new Error("WebGL2 not supported")
  gl.getExtension("EXT_color_buffer_float")

  const context = new GLContext(canvas)

  const start = Date.now()
  setCanvasSize([canvas.width, canvas.height])
  setDrawBufferSize([canvas.width, canvas.height])

  const program = Shader.fromFragment(context, basicFragment, "Basic fragment")
  const u_resolution = program.uniforms["u_resolution"] as Uniform2f
  const u_time = program.uniforms["u_time"] as Uniform1f
  internalUniforms.push({ uniform: u_resolution, update: () => u_resolution.setValue(canvasSize()) })
  internalUniforms.push({ uniform: u_time, update: () => u_time.setValue((Date.now() - start) / 1000.0) })

  const hdrFb = new FrameBuffer(context, canvas.width, canvas.height, TextureFormats.HalfFloat)
  const mainPass = new NodeRenderPass(context, program, hdrFb)

  const hdrProgram = Shader.fromFragment(context, hdrFragment, "HDR")
  const u_resolution_hdr = hdrProgram.uniforms["u_resolution"] as Uniform2f
  const u_texture = hdrProgram.uniforms["u_texture"] as Uniform1i
  internalUniforms.push({ uniform: u_resolution_hdr, update: () => u_resolution_hdr.setValue(canvasSize()) })
  internalUniforms.push({ uniform: u_texture, update: () => u_texture.setValue(0) })

  const hdrPass = new NodeRenderPass(context, hdrProgram)
  mainPass.dependents.push(hdrPass)

  setRenderPasses({
    mainPass,
    hdrPass
  })

  // Fix later xd
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, hdrFb.texture)

  internalUniforms.forEach(({ update }) => update())

  toast("Graphics initialised")

  mainPass.enqueueUpdate()

  return context
}

export default initRender