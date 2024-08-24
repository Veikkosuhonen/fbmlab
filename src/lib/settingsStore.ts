import { createReaction, createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";

export type Setting = {
  name: string,
  value: number,
  min: number,
  max: number,
  step: number,
  shader: string
}

export const renderCB: { cb: null|(() => number)} = {
  cb: null
}

export const [settings, setSettings] = createStore<Setting[]>([
  {
    name: "Gamma",
    value: 1.0,
    min: 0.01,
    max: 10.0,
    step: 0.01,
    shader: "hdr"
  }
])

export const setValue = (name: string, newValue: number) => {
  setSettings(
    (setting) => setting.name === name,
    "value",
    newValue
  )

  if (renderCB.cb) requestAnimationFrame(renderCB.cb)
}

export const getValue = (name: string) => settings.filter(s => s.name === name)[0].value
