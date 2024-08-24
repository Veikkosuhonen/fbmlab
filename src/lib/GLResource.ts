import { GLContext } from "./GLContext"

export abstract class GLResource {
  isDisposed: boolean = false
  context: GLContext

  constructor(context: GLContext) {
    this.context = context
    context.resources.push(this)
  }

  abstract dispose(): void
}
