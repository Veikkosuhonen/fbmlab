import { Component, For, onMount } from "solid-js";
import { clientOnly } from "@solidjs/start"
import initRender, { renderPasses } from "~/lib/render";
import { Slider } from '@ark-ui/solid'
import { Uniform, Uniform1f, Uniform2f, Uniform3f } from "~/lib/Shader";
import { NodeRenderPass } from "~/lib/NodeRenderPass";
const ColorPicker = clientOnly(() => import("./ColorPicker"))

export default function Home() {
  let canvas: HTMLCanvasElement|undefined;

  onMount(() => {
    if (canvas) {
      canvas.width = window.innerWidth * 0.8;
      canvas.height = window.innerHeight;
      initRender(canvas)
    }
  })

  return (
    <main class="w-[100vw] h-[100vh] flex">
      <div class="w-[20vw] p-1">
        <For each={Object.entries(renderPasses)}>{([name, pass]) => (
          <div class="p-1 m-1">
            <h2 class="mb-2 font-medium">{name}</h2>
            <For each={pass.shader.getExternalUniforms()}>{(uniform) => (
              <div class="mb-2">
                <UniformControl uniform={uniform} renderPass={pass} />
              </div>
            )}</For>
          </div>
        )}</For>
      </div>
      <div class="w-[80vw] h-[100vh]">
        <canvas ref={canvas} width={1280} height={500} />
      </div>
    </main>
  );
}

const UniformControl: Component<{
  uniform: Uniform<any>,
  renderPass: NodeRenderPass,
}> = (props) => {

  if (props.uniform instanceof Uniform1f) {
    return (
      <FloatSlider
        label={props.uniform.name}
        value={props.uniform._value}
        setValue={v => {
          props.uniform.setValue(v)
          props.renderPass.enqueueUpdate()
        }}
        min={props.uniform.min}
        max={props.uniform.max}
        step={(props.uniform.max - props.uniform.min) / 100.0}
      />
    )
  }

  if (props.uniform instanceof Uniform2f) {
    return (
      <Vec2Slider
        label={props.uniform.name}
        value={props.uniform._value}
        setValue={v => {
          props.uniform.setValue(v)
          props.renderPass.enqueueUpdate()
        }}
        min={props.uniform.min}
        max={props.uniform.max}
        step={(props.uniform.max - props.uniform.min) / 100.0}
      />
    )
  }

  if (props.uniform instanceof Uniform3f) {
    return <ColorPicker
      value={props.uniform._value}
      setValue={v => {
        console.log(props.uniform.name, v)
        props.uniform.setValue(v)
        props.renderPass.enqueueUpdate()
      }}
    />
  }
}

const FloatSlider: Component<{
  label: string,
  value: number,
  setValue: (value: number) => void,
  min: number,
  max: number,
  step: number
}> = (props) => {
  return (
    <StyledSlider
      label={props.label}
      value={[props.value]}
      onValueChange={e => props.setValue(e.value[0])}
      min={props.min}
      max={props.max}
      step={props.step}
    />
  )
}

const Vec2Slider: Component<{
  label: string,
  value: [number, number],
  setValue: (value: [number, number]) => void,
  min: number,
  max: number,
  step: number
}> = (props) => {
  return (
    <div>
      <label>{props.label}</label>
      <StyledSlider
        label="x"
        value={[props.value[0]]}
        onValueChange={e => props.setValue([e.value[0], props.value[1]])}
        min={props.min}
        max={props.max}
        step={props.step}
      />
      <StyledSlider
        label="y"
        value={[props.value[1]]}
        onValueChange={e => props.setValue([props.value[0], e.value[0]])}
        min={props.min}
        max={props.max}
        step={props.step}
      />
    </div>
  )
}

const StyledSlider: Component<{
  label: string,
  value: number[],
  onValueChange: (value: Slider.ValueChangeDetails) => void,
  min: number,
  max: number,
  step: number
}> = (props) => {
  return (
    <Slider.Root
      value={props.value}
      onValueChange={props.onValueChange}
      min={props.min}
      max={props.max}
      step={props.step}
      class="w-60"
    >
      <div class="flex">
        <Slider.Label>{props.label}</Slider.Label>
        <Slider.ValueText class="font-mono ml-auto" />
      </div>
      <Slider.Control class="relative">
        <Slider.Track class="bg-slate-600 h-2">
          <Slider.Range class="h-2 bg-slate-400" />
        </Slider.Track>
        <Slider.Thumb index={0} class="absolute -top-1 rounded-sm shadow-sm w-4 h-4 bg-slate-50 cursor-pointer">
          <Slider.HiddenInput />
        </Slider.Thumb>
      </Slider.Control>
    </Slider.Root>
  )
}
