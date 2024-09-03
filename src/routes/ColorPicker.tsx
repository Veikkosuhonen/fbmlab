import { DefaultColorPicker } from "@thednp/solid-color-picker"
import { Component } from "solid-js"
import '@thednp/solid-color-picker/style.css'

const ColorPicker: Component<{
  value: [number, number, number],
  setValue: (value: [number, number, number]) => void
}> = (props) => {

  return (
    <DefaultColorPicker
      value={`rgb(${props.value[0]}, ${props.value[1]}, ${props.value[2]})`}
      onChange={(e) => {
        const parts = e.split(",")
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