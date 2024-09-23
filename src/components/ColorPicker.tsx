import { DefaultColorPicker } from "@thednp/solid-color-picker"
import { Component, createComputed, createMemo } from "solid-js"
import '@thednp/solid-color-picker/style.css'

const ColorPicker: Component<{
  value: [number, number, number],
  setValue: (value: [number, number, number]) => void
}> = (props) => {

  const value = () => {
    return `rgb(${props.value[0] * 255}, ${props.value[1] * 255}, ${props.value[2] * 255})`
  }

  return (
    <DefaultColorPicker
      value={value()}
      onChange={(e) => {
        const parts = e.split(",")
        console.log("COLOR CHANGED", parts)
        props.setValue([
          parseFloat(parts[0].slice(4)) / 255,
          parseFloat(parts[1]) / 255,
          parseFloat(parts[2].slice(0, -1)) / 255,
        ])
      }}
    />
  )
}

export default ColorPicker