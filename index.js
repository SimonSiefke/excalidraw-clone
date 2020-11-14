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

const handleMessage = ({ data }) => {
  switch (data.command) {
    case 'move':
      commandMove(data)
      break
    case 'backgroundChange':
      commandBackgroundChange(data)
      break
    default:
      throw new Error('unknown command')
  }
}

worker.onmessage = handleMessage

const sendWorker = (messages) => worker.postMessage(messages)

// Canvas

const $Canvas = document.getElementById('Canvas')

const objects = Object.create(null)

objects[1] = document.querySelector('[data-object-id="1"]')
objects[2] = document.querySelector('[data-object-id="2"]')
objects[3] = document.querySelector('[data-object-id="3"]')

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
  const id = target.dataset.objectId
  if (!id) {
    return
  }
  sendWorker({
    event: 'pointerDown',
    x,
    y,
    id,
  })
}

window.addEventListener('pointerdown', canvasHandlePointerDown)

// Color Picker

const $ColorPicker = document.getElementById('ColorPicker')

const colorPickerHandleChange = (event) =>
  sendWorker({ event: 'colorChange', value: event.target.value })

$ColorPicker.oninput = colorPickerHandleChange
