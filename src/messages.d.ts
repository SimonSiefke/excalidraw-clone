export interface EventPointerMove {
  readonly event: 'pointerMove'
  readonly x: number
  readonly y: number
}

export interface EventPointerDown {
  readonly event: 'pointerDown'
  readonly x: number
  readonly y: number
  readonly id: string
}

export interface EventPointerUp {
  readonly event: 'pointerUp'
}

export interface EventColorChange {
  readonly event: 'colorChange'
  readonly value: string
  readonly id: string
}

export type Event =
  | EventPointerMove
  | EventPointerDown
  | EventPointerUp
  | EventColorChange
