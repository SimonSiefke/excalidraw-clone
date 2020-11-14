const worker = new Worker('dist/rendererWorkerMain.js', {
  type: 'module',
})

const commandMove = (command) => {
  const $Object = objects[command.id]
  $Object.style.transform = `translate(${command.x}px, ${command.y}px)`
}

const commandBackgroundChange = (command) => {
  const $Object = objects[command.id]
  $Object.style.background = command.background
}

const commandCursorModeChange = (command) => {
  $Canvas.dataset.cursorMode = command.cursorMode
}

const createShapeRectangle = (rectangle) => {
  const $Rectangle = document.createElement('div')
  $Rectangle.dataset.objectType = 'rectangle'
  $Rectangle.style.transform = `translate(${rectangle.x}px, ${rectangle.y}px)`
  $Rectangle.style.width = rectangle.width + 'px'
  $Rectangle.style.height = rectangle.height + 'px'
  return $Rectangle
}

const createShapeEllipsis = (ellipsis) => {
  const $Ellipsis = document.createElement('div')
  $Ellipsis.dataset.objectType = 'ellipsis'
  $Ellipsis.style.transform = `translate(${ellipsis.x}px, ${ellipsis.y}px)`
  return $Ellipsis
}

const createShapeDiamond = (diamond) => {
  const $Diamond = document.createElement('div')
  $Diamond.dataset.objectType = 'diamond'
  $Diamond.style.transform = `translate(${diamond.x}px, ${diamond.y}px)`
  return $Diamond
}

const renderers = Object.create(null)

renderers['rectangle'] = createShapeRectangle
renderers['ellipsis'] = createShapeEllipsis
renderers['diamond'] = createShapeDiamond

const commandCreateShape = (command) => {
  const $Shape = renderers[command.shape.type](command.shape)
  $Shape.dataset.objectId = command.id
  objects[command.id] = $Shape
  $Canvas.append($Shape)
}

const handleMessage = ({ data }) => {
  switch (data.command) {
    case 'move':
      commandMove(data)
      break
    case 'backgroundChange':
      commandBackgroundChange(data)
      break
    case 'cursorModeChange':
      commandCursorModeChange(data)
      break
    case 'createShape':
      commandCreateShape(data)
      break
    default:
      throw new Error(`unknown command ${data.command}`)
  }
}

worker.onmessage = handleMessage

const sendWorker = (messages) => worker.postMessage(messages)

// Canvas

const $Canvas = document.getElementById('Canvas')

const objects = Object.create(null)

const handlePointerMove = ({ clientX: x, clientY: y, target }) => {
  sendWorker({
    event: 'pointerMove',
    x,
    y,
  })
}

window.addEventListener('pointermove', handlePointerMove, {
  passive: true,
})

const canvasHandlePointerUp = () => sendWorker({ event: 'pointerUp' })

window.addEventListener('pointerup', canvasHandlePointerUp)

const canvasHandlePointerDown = ({ clientX: x, clientY: y, target }) => {
  console.log(target)
  const id = target.dataset.objectId
  sendWorker({
    event: 'pointerDown',
    x,
    y,
    id,
  })
}

$Canvas.addEventListener('pointerdown', canvasHandlePointerDown)

// Color Picker

const $ColorPicker = document.getElementById('ColorPicker')

const colorPickerHandleChange = (event) =>
  sendWorker({ event: 'colorChange', value: event.target.value })

$ColorPicker.oninput = colorPickerHandleChange

// TopBar

const $TopBar = document.getElementById('TopBar')

const topBarHandleClick = (event) => {
  const $Target = event.target
  if ($Target === $TopBar) {
    return
  }
  sendWorker({
    event: 'toolBarClick',
    value: event.target.value,
  })
}

$TopBar.addEventListener('click', topBarHandleClick)
