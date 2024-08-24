import { FrameBuffer } from "./FrameBuffer";
import { GLContext } from "./GLContext";
import { GLResource } from "./GLResource";
import Shader from "./Shader";

export class NodeRenderPass extends GLResource {
  shader: Shader
  frameBuffer: FrameBuffer|undefined
  dependents: NodeRenderPass[] = []

  constructor(context: GLContext, shader: Shader, frameBuffer?: FrameBuffer) {
    super(context)
    this.shader = shader
    this.frameBuffer = frameBuffer
  }

  enqueueUpdate() {
    // Put self to the end of the queue
    this.context.renderQueue = this.context.renderQueue.filter(r => r !== this)
    this.context.renderQueue.push(this)

    this.dependents.forEach(d => {
      d.enqueueUpdate()
    })

    this.context.requestRerender()
  }

  processUpdate() {
    this.render()
  }

  render() {
    if (this.frameBuffer) {
      this.context.setTarget(this.frameBuffer)
    }

    this.context.clearColor()
    this.shader.use()
    this.shader.syncUniforms()
    this.context.draw()
    this.context.clearTarget()

    console.log("Rendered", this.shader.name)
  }

  dispose() {}
}