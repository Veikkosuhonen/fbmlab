import { createProgram } from "./glUtils";
import basic from "../glsl/basic.vert";
import { GLResource } from "./GLResource";
import { GLContext } from "./GLContext";
import { parseShaderUniforms } from "./shaderUniformParser";

const internalUniforms = ["u_resolution", "u_texture", "u_position"]
const urlIncludedUniforms = ["u_position"]

class Shader extends GLResource {
  program: WebGLProgram;
  uniforms: Record<string, Uniform<keyof UniformKind>> = {};
  internalUniforms: Record<string, boolean> = {};
  name: string;

  static fromFragment(context: GLContext, source: string, name: string) {
    const vertexShaderSource = basic
    return new Shader(context, vertexShaderSource, source, name)
  }

  constructor(context: GLContext, vertexShaderSource: string, fragmentShaderSource: string, name: string) {
    super(context)

    this.program = createProgram(context.gl, vertexShaderSource, fragmentShaderSource)

    const allUniforms = parseShaderUniforms(vertexShaderSource).concat(parseShaderUniforms(fragmentShaderSource))
    const uniqueUniforms = allUniforms.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i)
    uniqueUniforms.forEach(u => this.addUniform(u, internalUniforms.includes(u.name)))
    console.log("Shader uniforms for", name, this.getExternalUniforms().map(u => u.name))

    this.name = name
    this.enableVab()
  }

  private addUniform(uniform: Uniform<keyof UniformKind>, internal = false) {
    this.uniforms[uniform.name] = uniform
    uniform.setShader(this)
    if (internal) {
      this.internalUniforms[uniform.name] = true
    }
  }

  getExternalUniforms() {
    return Object.keys(this.uniforms).filter(k => !this.internalUniforms[k]).map(k => this.uniforms[k])
  }

  getUrlIncludedUniforms() {
    return Object.keys(this.uniforms).filter(k => !this.internalUniforms[k] || urlIncludedUniforms.includes(k)).map(k => this.uniforms[k])
  }

  syncUniforms() {
    for (const name in this.uniforms) {
      this.uniforms[name].sync()
    }
  }

  use() {
    this.context.gl.useProgram(this.program)
  }

  dispose() {
    if (this.isDisposed) return
    this.isDisposed = true
    this.context.gl.deleteProgram(this.program)
  }

  private enableVab() {
    const positionAttribute = this.context.gl.getAttribLocation(this.program, "position")
    this.context.gl.enableVertexAttribArray(positionAttribute)
    this.context.gl.vertexAttribPointer(positionAttribute, 2, this.context.gl.FLOAT, false, 0, 0)
  }
}

export default Shader

export type UniformKind = {
  "1f": number, 
  "2f": [number, number],
  "3f": [number, number, number],
  "1i": number, 
}

export abstract class Uniform<T extends keyof UniformKind> {
  location?: WebGLUniformLocation
  shader?: Shader
  name: string
  _isChanged: boolean = true
  _value: UniformKind[T]
  min: number
  max: number

  constructor(name: string, initialValue: UniformKind[T], min?: number, max?: number) {
    this._value = initialValue
    this.name = name
    if (min && !Number.isNaN(min)) { this.min = min } else { this.min = 0 }
    if (max && !Number.isNaN(max)) { this.max = max } else { this.max = 1 }
  }

  setShader(shader: Shader) {
    this.shader = shader
    const location = shader.context.gl.getUniformLocation(shader.program, this.name)
    if (!location) {
      throw new Error(`Uniform ${name} not found in shader ${shader.name}`)
    }
    this.location = location
  }

  setValue(v: UniformKind[T]) {
    this._value = v
    this._isChanged = true
  }

  sync() {
    if (!this._isChanged || !this.shader || !this.location) return
    this._isChanged = false
    this._glSet(this.shader.context.gl, this.location)
  }

  abstract _glSet(gl: WebGLRenderingContext, location: WebGLUniformLocation): void
}

export class Uniform1f extends Uniform<"1f"> {
  _glSet(gl: WebGLRenderingContext, location: WebGLUniformLocation) {
    gl.uniform1f(location, this._value)
  }
}

export class Uniform2f extends Uniform<"2f"> {
  _glSet(gl: WebGLRenderingContext, location: WebGLUniformLocation) {
    gl.uniform2f(location, this._value[0], this._value[1])
  }
}

export class Uniform3f extends Uniform<"3f"> {
  _glSet(gl: WebGLRenderingContext, location: WebGLUniformLocation) {
    gl.uniform3f(location, this._value[0], this._value[1], this._value[2])
  }
}

export class Uniform1i extends Uniform<"1i"> {
  _glSet(gl: WebGLRenderingContext, location: WebGLUniformLocation) {
    gl.uniform1i(location, this._value)
  }
}