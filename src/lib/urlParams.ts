import { renderPasses } from "./render"
import { Uniform, Uniform1f, Uniform1i, Uniform2f, Uniform3f } from "./Shader"


const valueKeys = ["x", "y", "z"]

// Get individual values from a uniform as an array of key value objects
const getUniformValues = (uniform: Uniform<any>) => {
  if (uniform instanceof Uniform1i || uniform instanceof Uniform1f) {
    return [{ key: "x", value: uniform._value }]
  }
  if (uniform instanceof Uniform2f) {
    return uniform._value.map((v, i) => ({ key: valueKeys[i], value: v }))
  }
  if (uniform instanceof Uniform3f) {
    return uniform._value.map((v, i) => ({ key: valueKeys[i], value: v }))
  }
  return []
}

// Set uniform individual values from url search params
const setUniformValues = (uniform: Uniform<any>, urlSearchParams: URLSearchParams) => {
  const value = getUniformValues(uniform).map(({ key }) => {
    const value = urlSearchParams.get(`${uniform.name}_${key}`)
    return value ? JSON.parse(value) : undefined
  })

  // Only set the uniform if all values are defined
  if (value.every(v => v !== undefined)) {
    console.log("Setting", uniform.name, value)
    if (value.length > 1) {
      uniform.setValue(value)
    } else {
      uniform.setValue(value[0])
    }
  }
}

export const getShareLink = () => {
  const url = new URL(window.location.href)
  Object.values(renderPasses).forEach(pass => {
    pass.shader.getUrlIncludedUniforms().forEach(uniform => {
      getUniformValues(uniform).forEach(({ key, value }) => {
        url.searchParams.set(`${uniform.name}_${key}`, JSON.stringify(value))
      })
    })
  })
  return url.toString()
}

export const applyShareLink = () => {
  const url = new URL(window.location.href)
  Object.values(renderPasses).forEach(pass => {
    pass.shader.getUrlIncludedUniforms().forEach(uniform => {
      setUniformValues(uniform, url.searchParams)
      pass.enqueueUpdate()
    })
  })
}