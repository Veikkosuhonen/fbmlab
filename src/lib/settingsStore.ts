import { createStore, produce } from "solid-js/store";

export type Setting = {
  name: string,
  value: number,
  min: number,
  max: number,
  step: number,
}

export const [settings, setSettings] = createStore<Setting[]>([
  
])

export const setValue = (name: string, newValue: number) => {
  setSettings(
    (setting) => setting.name === name,
    "value",
    newValue
  )
}

export const getValue = (name: string) => settings.filter(s => s.name === name)[0].value
