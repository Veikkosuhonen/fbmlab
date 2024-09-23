import { Component, createSignal, For, onMount } from "solid-js";
import { clientOnly } from "@solidjs/start"
import initRender, { renderPasses } from "~/lib/render";
import { Slider } from '@ark-ui/solid'
import { Uniform, Uniform1f, Uniform2f, Uniform3f } from "~/lib/Shader";
import { NodeRenderPass } from "~/lib/NodeRenderPass";
import { setupCanvasEventHandlers } from "~/lib/canvasEvents";
import { Toolbar } from "~/components/Toolbar";
import { applyShareLink } from "~/lib/urlParams";
const ColorPicker = clientOnly(() => import("../components/ColorPicker"))

export default function Home() {
  let canvas: HTMLCanvasElement|undefined;

  onMount(() => {
    if (canvas) {
      canvas.width = window.innerWidth * 0.8;
      canvas.height = window.innerHeight;
      initRender(canvas)
      setupCanvasEventHandlers(canvas)
      applyShareLink()
    }
  })

  return (
    <main class="w-[100vw] min-h-[100vh]">
      <Toolbar />
      <div class="flex">
        <div class="w-[20vw] p-1 border-r-2 border-slate-100 dark:border-slate-700">
          <For each={Object.entries(renderPasses)}>{([name, pass]) => (
            <div class="p-1 m-1 mt-3">
              <h2 class="mb-2 font-medium">{name}</h2>
              <For each={pass.shader.getExternalUniforms()}>{(uniform) => (
                <div class="mb-2 p-2 bg-slate-200 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-md">
                  <UniformControl uniform={uniform} renderPass={pass} />
                </div>
              )}</For>
            </div>
          )}</For>
        </div>
        <div class="w-[80vw] h-[100vh]">
          <canvas ref={canvas} width={1280} height={500} class="cursor-grab" />
        </div>
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
        step={(props.uniform.max - props.uniform.min) / 200.0}
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
        min={-2}
        max={2}
        step={(props.uniform.max - props.uniform.min) / 200.0}
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
  let knob: HTMLDivElement | undefined;
  let dragZone: HTMLDivElement | undefined;
  const [isDragging, setIsDragging] = createSignal(false)

  onMount(() => {
    document.addEventListener('mouseup', () => setIsDragging(false))
    document.addEventListener('mousemove', (e) => {
      if (!isDragging() || !knob || !dragZone) return
      const rect = dragZone.getBoundingClientRect()
      const x = Math.min(Math.max(0, e.clientX - 8 - rect.left), rect.width - 16)
      const y = Math.min(Math.max(0, e.clientY - 8 - rect.top), rect.height - 16)
      const nx = (x / rect.width) * (props.max - props.min) + props.min
      const ny = (y / rect.height) * (props.max - props.min) + props.min
      props.setValue([nx, -ny])
      knob.style.left = `${x}px`
      knob.style.top = `${y}px`
    })
  })

  return (
    <div>
      <label>{props.label}</label>
      <div ref={dragZone} class="bg-slate-200 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 shadow-inner w-32 h-32 rounded relative">
        <div ref={knob} class="rounded-sm shadow-sm w-4 h-4 bg-slate-50 cursor-pointer absolute left-[3.5rem] top-[3.5rem]"
          onMouseDown={() => setIsDragging(true)}
        />
      </div>
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
