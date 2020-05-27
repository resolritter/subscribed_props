import React, { useRef, useState, useEffect } from "react"
import "./App.css"

function counterMessageOf(renderCount, prepend = "") {
  return `${prepend}I've been called ${renderCount} times.`
}

class Subscriber extends React.Component {
  constructor(props) {
    super(props)
    const { subscribe, initialValue, uniqueId } = props
    this.forwardedProps = {
      value: initialValue,
      uniqueId,
    }
    subscribe(uniqueId, (value) => {
      this.forwardedProps = { value, uniqueId }
      this.forceUpdate()
    })
  }
  shouldComponentUpdate() {
    return false
  }
  render() {
    const { Component } = this.props
    return <Component {...this.forwardedProps} />
  }
}

const renderCounter = new Map()
function useRenderCounter(uniqueId) {
  const renderCount = (renderCounter.get(uniqueId) || 0) + 1
  renderCounter.set(uniqueId, renderCount)
  return renderCount
}

function useBind(initialValue) {
  const [value, setValue] = useState(initialValue)
  // `Map` is used instead of an object because it provides dynamic lookup _on
  // demand_, as opposed to an object, where its value would be captured by the
  // returned closure. Map's dynamicness also allows the children's setters to
  // easily be refreshed without needing to resubscribe - their value is always
  // looked up dynamically, thus it can be updated at any point.
  const listeners = useRef(new Map())
  const bind = useRef(function(key, notificationCallback) {
    listeners.current.set(key, notificationCallback)
  })

  return [
    value,
    function notifyAndSet(newValue) {
      listeners.current.forEach(function(notify) {
        notify(newValue)
      })
      setValue(newValue)
    },
    bind.current,
  ]
}

const Tock = function({ value, uniqueId }) {
  const renderCount = useRenderCounter(uniqueId)
  return (
    <div>
      <div>{counterMessageOf(renderCount, `Tock #${value} received. `)}</div>
    </div>
  )
}

const Tick = function({ value, uniqueId }) {
  const renderCount = useRenderCounter(uniqueId)
  return (
    <div>
      <div>{counterMessageOf(renderCount, `Tick #${value} received. `)}</div>
    </div>
  )
}

let tickTock = 0
function App() {
  const [tick, setTick, subscribeToTick] = useBind(0)
  const [tock, setTock, subscribeToTock] = useBind(0)
  const renderCount = useRenderCounter("app")

  // `setTock` and `setTick` will trigger an update every two seconds;
  // This would otherwise cause the whole tree to be re-rendered, but
  // since tick and tock are totally disconnected, that isn't very convenient.
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

  // It is relevant for each children have their own key, so that
  // the notification can always reach only the affected components.
  return (
    <div className="App">
      <b>Ticker (Child)</b>
      <Subscriber
        subscribe={subscribeToTick}
        initialValue={tick}
        uniqueId={1}
        Component={Tick}
      />
      <b>Ticker (Child 2)</b>
      <Subscriber
        subscribe={subscribeToTick}
        initialValue={tick}
        uniqueId={2}
        Component={Tick}
      />
      <b>Tocker (Child)</b>
      <Subscriber
        subscribe={subscribeToTock}
        initialValue={tock}
        uniqueId={3}
        Component={Tock}
      />
      <b>Parent</b>
      <br />
      {counterMessageOf(renderCount)}
      <hr />
      <p style={{ marginBottom: 0 }}>The example above showcases:</p>
      <ul style={{ listStyle: "inside", margin: 0 }}>
        <li>
          How a re-render on a parent component is <b>not</b> triggering updates
          on all the children.
        </li>
        <li>Multiple children depending on the same "prop".</li>
      </ul>
    </div>
  )
}

export default App
