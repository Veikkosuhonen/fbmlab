import { Component, For, onMount } from "solid-js";
import initRender, { renderPasses } from "~/lib/render";
import { Slider } from '@ark-ui/solid'
import { Uniform, Uniform1f, Uniform2f } from "~/lib/Shader";
import { NodeRenderPass } from "~/lib/NodeRenderPass";

export default function Home() {
  let canvas: HTMLCanvasElement|undefined;

  onMount(() => {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.8;
      initRender(canvas)
    }
  })

  return (
    <main class="w-[100vw] h-[100vh]">
      <div class="w-[100vw] h-[80vh]">
        <canvas ref={canvas} width={1280} height={500} />
      </div>
      <div class="p-1 flex">
        <For each={Object.entries(renderPasses)}>{([name, pass]) => (
          <div class="p-1">
            <h2>{name}</h2>
            <For each={pass.shader.getExternalUniforms()}>{(uniform) => (
              <UniformControl uniform={uniform} renderPass={pass} />
            )}</For>
          </div>
        )}</For>
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
    <Slider.Root
      value={[props.value]}
      onValueChange={e => props.setValue(e.value[0])}
      min={props.min}
      max={props.max}
      step={props.step}
      class="w-60"
    >
      <Slider.Label>{props.label}</Slider.Label>
      <Slider.ValueText />
      <Slider.Control>
        <Slider.Track class="bg-slate-600 h-2 absolute">
          <Slider.Range class="h-2 bg-indigo-600 absolute" />
        </Slider.Track>
        <Slider.Thumb index={0} class="rounded-full w-4 h-4 bg-slate-100">
          <Slider.HiddenInput />
        </Slider.Thumb>
      </Slider.Control>
    </Slider.Root>
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
      <Slider.Root
        value={[props.value[0]]}
        onValueChange={e => props.setValue([e.value[0], props.value[1]])}
        min={props.min}
        max={props.max}
        step={props.step}
        class="w-60"
      >
        <Slider.Label>x</Slider.Label>
        <Slider.ValueText />
        <Slider.Control>
          <Slider.Track class="bg-slate-600 h-2 absolute">
            <Slider.Range class="h-2 bg-indigo-600 absolute" />
          </Slider.Track>
          <Slider.Thumb index={0} class="rounded-full w-4 h-4 bg-slate-100">
            <Slider.HiddenInput />
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>
      <Slider.Root
        value={[props.value[1]]}
        onValueChange={e => props.setValue([props.value[0], e.value[1]])}
        min={props.min}
        max={props.max}
        step={props.step}
      >
        <Slider.Label>y</Slider.Label>
        <Slider.ValueText />
        <Slider.Control>
          <Slider.Track class="bg-slate-600 h-2 absolute">
            <Slider.Range class="h-2 bg-indigo-600 absolute" />
          </Slider.Track>
          <Slider.Thumb index={0} class="rounded-full w-4 h-4 bg-slate-100">
            <Slider.HiddenInput />
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>
    </div>
  )
}
