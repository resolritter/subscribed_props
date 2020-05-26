import React, { useRef, useState, useEffect } from "react"
import "./App.css"

const renderCounter = new Map()

function bindOf(HookedComponent) {
  return React.memo(
    function(props) {
      const [value, setValue] = useState(props.initialValue)
      props.binder(props.uniqueId, setValue)

      return <HookedComponent value={value} uniqueId={props.uniqueId} />
    },
    function() {
      return true
    },
  )
}

function useRenderCounter(uniqueId) {
  const renderCount = (renderCounter.get(uniqueId) || 0) + 1
  renderCounter.set(uniqueId, renderCount)
  return renderCount
}

const Tock = bindOf(function({ value, uniqueId }) {
  const renderCount = useRenderCounter(uniqueId)
  return (
    <div>
      <div>{`Tock #${value} received. I've been called ${renderCount} times.`}</div>
    </div>
  )
})

const Tick = bindOf(function({ value, uniqueId }) {
  const renderCount = useRenderCounter(uniqueId)
  return (
    <div>
      <div>{`Tick #${value} received. I've been called ${renderCount} times.`}</div>
    </div>
  )
})

function useBind(initialValue) {
  const [value, setValue] = useState(initialValue)
  const subscribers = useRef(new Map())
  const bind = useRef(function(key, subscription) {
    subscribers.current.set(key, subscription)
  })

  return [
    value,
    function notifyAndSet(newValue) {
      subscribers.current.forEach(function(notify) {
        notify(newValue)
      })
      setValue(newValue)
    },
    bind.current,
  ]
}

let tickTock = 0
function App() {
  const [tick, setTick, bindTick] = useBind(0)
  const [tock, setTock, bindTock] = useBind(0)
  const renderCount = useRenderCounter("app")

  useEffect(
    function() {
      setTimeout(function() {
        tickTock++
        if (tickTock % 2) {
          setTock(tock + 1)
        } else {
          setTick(tick + 1)
        }
      }, 2000)
    },
    [tick, tock, setTick, setTock],
  )

  return (
    <div className="App">
      <b>Ticker (Child)</b>
      <Tick binder={bindTick} initialValue={tick} uniqueId={1} />
      <b>Ticker (Child 2)</b>
      <Tick binder={bindTick} initialValue={tick} uniqueId={2} />
      <b>Tocker (Child)</b>
      <Tock binder={bindTock} initialValue={tick} uniqueId={3} />
      <b>Parent</b>
      <br />
      {`I've been called ${renderCount} times.`}
    </div>
  )
}

export default App
