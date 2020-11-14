import type {
  Event,
  EventColorChange,
  EventPointerDown,
  EventPointerMove,
  EventPointerUp,
} from './messages'

const sendRendererProcess = (message: any) => postMessage(message)

const offsetLeft = 150
let isPointerDown = false
let background = 'white'
let currentId: string | undefined

const handleEventPointerDown = (event: EventPointerDown) => {
  isPointerDown = true
  currentId = event.id
  sendRendererProcess({
    command: 'move',
    x: event.x - offsetLeft,
    y: event.y,
    id: currentId,
  })
}

const handleEventPointerMove = (event: EventPointerMove) => {
  if (!isPointerDown) {
    return
  }
  sendRendererProcess({
    command: 'move',
    x: event.x - offsetLeft,
    y: event.y,
    id: currentId,
  })
}

const handleEventPointerUp = (event: EventPointerUp) => {
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
    default:
      throw new Error(`unknown event ${data}`)
  }
}

onmessage = handleMessage
