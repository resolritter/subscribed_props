# Purpose

Hook-based (and, therefore, function-based) components are the endorsed way to
use components in React. The "problem" is that, unlike class components, it
isn't directly possible to skip the rendering step with `componentDidUpdate` or
equivalent.

In this example, the parent `App` hosts children which depend on
non-correlational states; one children counts the "tock" hearbeats, while the
other counts the "tick". Since both are functional components, even though their
inherited state is updated independently, having it be set in the parent means
both would always be scheduled for an update regardless.

That does not lead into performance issues in the majority of situations, which
is to say, even though redefining values and triggering a whole tree render on
every parent update is wasteful, it greatly simplifies the way to interact with
the API and not having to care about separating every concern and data
dependency.

Although rendering everything many times is "good enough" for the usual
occasion, it sometimes isn't

- For example, when you have a component which interacts with live data coming
  at a fast rate from the outside; every time data streams in, even though the
  children might not care, they'd still re-render a lot

- For example, when some part of the UI needs to change in relation to another;
  think of having a Parent which hosts a Table and a Summary which changes
  according to the data in the table. If the Summary has to change due to some
  setting in the Parent, that means the Table also has to incur an update, which
  is potentially costly.

- It's also worth noting that, just be virtue of using a hook, the render
  functions will be triggered at least two times (this is related to the
  pre-commit phases, which you can read more at the **Linked Resources**).

Finally, for the sake of dealing with this incovenience of "render
wastefulness", the code here aims to show a way in which **functional** parent
and children components can still be communicated of changes through a simple
subscription model, which goes against the "update through props" philosophy of
React.

## Linked resources

- [React Hooks - Understanding Component Re-renders](https://medium.com/@guptagaruda/react-hooks-understanding-component-re-renders-9708ddee9928)
- [Unnecessary re-renders](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render#unnecessary-re-renders)
- [Flarnie Marchan - Ready for Concurrent Mode?](https://www.youtube.com/watch?v=V1Ly-8Z1wQA),
  more specifically at 15:00 time mark

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br /> Open
[http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br /> You will also see any lint errors
in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br /> See the section
about
[running tests](https://facebook.github.io/create-react-app/docs/running-tests)
for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br /> It correctly bundles
React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br /> Your app is
ready to be deployed!

See the section about
[deployment](https://facebook.github.io/create-react-app/docs/deployment) for
more information.
