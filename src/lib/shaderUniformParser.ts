import { Uniform, Uniform1f, Uniform1i, Uniform2f, Uniform3f, UniformKind } from "./Shader";

export const parseShaderUniforms = (shaderSource: string): Uniform<keyof UniformKind>[] => {
  const uniforms: Uniform<keyof UniformKind>[] = []
  const lines = shaderSource.split("\n")
  for (const line of lines) {
    const match = line.match(
      /uniform\s+(\w+)\s+(\w+)\s*;(\s*\/\/\/\s*default\s+(.+)\s+min\s+(.+)\s+max\s+(.+))?/
    )

    if (match) {
      const [, type, name, _defaultStr, defaultValue, minValue, maxValue] = match
    
      switch (type) {
        case "float":
          uniforms.push(new Uniform1f(name, parseFloat(defaultValue || "0.0"), parseFloat(minValue), parseFloat(maxValue)))
          break
        case "vec2":
          uniforms.push(new Uniform2f(name, [0.0, 0.0]))
          break
        case "vec3":
          uniforms.push(new Uniform3f(name, [0.0, 0.0, 0.0]))
          break
        case "int":
          uniforms.push(new Uniform1i(name, 0))
          break
        case "sampler2D":
          uniforms.push(new Uniform1i(name, 0))
          break
      }
    }
  }
  return uniforms
}
