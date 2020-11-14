import type {
  Event,
  EventColorChange,
  EventToolBarClick,
  EventPointerDown,
  EventPointerMove,
  EventPointerUp,
} from './messages'

const sendRendererProcess = (message: any) => postMessage(message)

const offsetLeft = 150
const offsetTop = 50
let isPointerDown = false
let background = 'white'
let currentId: string | undefined
let mode: 'mouse' | 'rectangle' | 'diamond' | 'ellipsis' | 'arrow' = 'mouse'

interface ShapeObjectEllipsis {
  readonly type: 'ellipsis'
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

interface ShapeObjectRectangle {
  readonly type: 'rectangle'
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

interface ShapeObjectDiamond {
  readonly type: 'diamond'
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

type ShapeObject =
  | ShapeObjectRectangle
  | ShapeObjectEllipsis
  | ShapeObjectDiamond

const objects: { [id: number]: ShapeObject } = Object.create(null)

const nextId = (() => {
  let id = 3
  return () => id++
})()

const onDidCreateShape = (shape: ShapeObject) => {
  const id = nextId()
  objects[id] = shape
  sendRendererProcess({
    command: 'createShape',
    id,
    shape,
  })
}

const handleEventPointerDown = (event: EventPointerDown) => {
  switch (mode) {
    case 'mouse':
      isPointerDown = true
      currentId = event.id
      sendRendererProcess({
        command: 'move',
        x: event.x - offsetLeft,
        y: event.y - offsetTop,
        id: currentId,
      })
      break
    case 'rectangle':
      const rectangle: ShapeObjectRectangle = {
        type: 'rectangle',
        x: event.x - offsetLeft,
        y: event.y - offsetTop,
        width: 150,
        height: 50,
      }
      onDidCreateShape(rectangle)
      break
    case 'ellipsis':
      const ellipsis: ShapeObjectEllipsis = {
        type: 'ellipsis',
        x: event.x - offsetLeft - 25,
        y: event.y - offsetTop - 25,
        width: 50,
        height: 50,
      }
      onDidCreateShape(ellipsis)
      break
    case 'diamond':
      const diamond: ShapeObjectDiamond = {
        type: 'diamond',
        x: event.x - offsetLeft - 50,
        y: event.y - offsetTop - 50,
        width: 100,
        height: 100,
      }
      onDidCreateShape(diamond)
      break
    default:
      throw new Error(`unknown ${mode}`)
  }
}

const handleEventPointerMove = (event: EventPointerMove) => {
  if (!isPointerDown) {
    return
  }
  sendRendererProcess({
    command: 'move',
    x: event.x - offsetLeft,
    y: event.y - offsetTop,
    id: currentId,
  })
}

const handleEventPointerUp = (event: EventPointerUp) => {
  switch (mode) {
    case 'rectangle':
    case 'ellipsis':
    case 'diamond':
      mode = 'mouse'
      sendRendererProcess({
        command: 'cursorModeChange',
        cursorMode: 'mouse',
      })
      break
    case 'mouse':
      mode = 'mouse'
      sendRendererProcess({
        command: 'cursorModeChange',
        cursorMode: 'mouse',
      })
      break
    default:
      throw new Error('unknown state')
  }
  isPointerDown = false
}

const handleEventColorChange = (event: EventColorChange) => {
  background = event.value
  sendRendererProcess({
    command: 'backgroundChange',
    background,
    id: currentId,
  })
}

const handleEventToolBarClick = (event: EventToolBarClick) => {
  mode = event.value
  switch (event.value) {
    case 'rectangle':
    case 'ellipsis':
    case 'diamond':
      sendRendererProcess({
        command: 'cursorModeChange',
        cursorMode: 'crosshair',
      })
      break
    case 'mouse':
      sendRendererProcess({
        command: 'cursorModeChange',
        cursorMode: 'mouse',
      })
      break
    default:
      throw new Error(`unknown ${mode}`)
  }
}

const handleMessage = ({ data }: MessageEvent<Event>) => {
  switch (data.event) {
    case 'pointerDown':
      handleEventPointerDown(data)
      break
    case 'pointerMove':
      handleEventPointerMove(data)
      break
    case 'pointerUp':
      handleEventPointerUp(data)
      break
    case 'colorChange':
      handleEventColorChange(data)
      break
    case 'toolBarClick':
      handleEventToolBarClick(data)
      break
    default:
      throw new Error(`unknown event ${JSON.stringify(data)}`)
  }
}

onmessage = handleMessage
