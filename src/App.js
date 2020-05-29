import React, { useRef, useState, useEffect } from "react"
import "./App.css"

function makeCounterMessage(renderCount, prepend = "") {
  return `${prepend}I've been called ${renderCount} times.`
}

let subscriptionCount = 0
// High-order component which sets up the subscription on behalf it child
function makeSubscriber(PureComponent) {
  return React.memo(
    function ({ subscribe, initialValue }) {
      const [uniqueId, setUniqueId] = useState()
      const [value, setValue] = useState(initialValue)
      useEffect(
        function () {
          const uniqueId = ++subscriptionCount
          setUniqueId(uniqueId)
          return subscribe(uniqueId, setValue)
        },
        // `useSubscriber` guarantees `subscribe` doesn't ever change
        [subscribe],
      )

      // `PureComponent` doesn't need to be memoized because the current set of
      // hooks makes the props only be updated when relevant already; this
      // invariant should be maintained
      return uniqueId
        ? (
          <PureComponent value={value} uniqueId={uniqueId} />
        )
        : null
    },
    function alwaysSkipRenderFromProps() {
      return true
    },
  )
}

const renderCounter = new Map()
function bumpRenderCount(uniqueId) {
  const renderCount = (renderCounter.get(uniqueId) || 0) + 1
  renderCounter.set(uniqueId, renderCount)
  return renderCount
}

function useSubscription(initialValue) {
  // instead of useState, if the parent only hosts the values but doesn't need
  // to read it, this could be useRef as well
  const [value, setValue] = useState(initialValue)
  // `Map` is used instead of an object because it provides dynamic lookup _on
  // demand_, as opposed to an object, where its value would be captured by the
  // returned closure. Map's dynamicness also allows the children's setters to
  // easily be refreshed without needing to resubscribe - their value is always
  // looked up dynamically, thus it can be updated at any point.
  const listeners = useRef(new Map())
  // This is wrapped in useRef so that children can depend on its value without
  // triggering the subscription effect, which should only happen once
  const subscribe = useRef(function (key, notificationCallback) {
    listeners.current.set(key, notificationCallback)

    return function unsubscribe() {
      listeners.current.remove(key)
    }
  })

  return [
    value,
    function notifyAndSet(newValue) {
      listeners.current.forEach(function (notify) {
        notify(newValue)
      })
      setValue(newValue)
    },
    subscribe.current,
  ]
}

const Tock = makeSubscriber(function ({ value, uniqueId }) {
  return (
    <div>
      <div>{makeCounterMessage(bumpRenderCount(uniqueId), `Tock #${value} received. `)}</div>
    </div>
  )
})

const Tick = makeSubscriber(function ({ value, uniqueId }) {
  return (
    <div>
      <div>{makeCounterMessage(bumpRenderCount(uniqueId), `Tick #${value} received. `)}</div>
    </div>
  )
})

let tickTock = 0
function App() {
  const [tick, setTick, subscribeToTick] = useSubscription(0)
  const [tock, setTock, subscribeToTock] = useSubscription(0)
  const renderCount = bumpRenderCount("app")

  // `setTock` and `setTick` will trigger an update every two seconds;
  // This would otherwise cause the whole tree to be re-rendered, but
  // since tick and tock are totally disconnected, that isn't very convenient.
  useEffect(
    function () {
      setTimeout(function () {
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
      <Tick subscribe={subscribeToTick} initialValue={tick} />
      <b>Ticker (Child 2)</b>
      <Tick subscribe={subscribeToTick} initialValue={tick} />
      <b>Tocker (Child)</b>
      <Tock subscribe={subscribeToTock} initialValue={tock} />
      <b>Parent</b>
      <br />
      {makeCounterMessage(renderCount)}
      <hr />
      <p style={{ marginBottom: 0 }}>The example above showcases:</p>
      <ul style={{ listStyle: "inside", margin: 0 }}>
        <li>
          How a re-render on a parent component is <b>not</b> triggering updates on all the children.
        </li>
        <li>Multiple children depending on the same "prop".</li>
        <li>
          Although skipping renders is also possible with{" "}
          <code>componentDidUpdate</code>
          on class components, it'd mean losing the ability to use hooks directly in the child.
        </li>
      </ul>
    </div>
  )
}

export default App
