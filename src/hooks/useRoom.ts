import { useCallback, useState } from 'react'
import { useKeyboardRotation } from './room/useKeyboardRotation'
import { usePointerRotation } from './room/usePointerRotation'
import { useRotationState } from './room/useRotationState'
import { useWheelRotation } from './room/useWheelRotation'

type Options = {
  count: number
  /** 벽 한 면을 도는 데 걸리는 시간 ms — CSS 의 --turn 과 같은 값이어야 한다 */
  turnMs: number
  /** 상세 화면 등이 열려 있으면 조작을 막는다 */
  locked?: boolean
}

/**
 * 전시관을 좌우로 돌리는 조작계.
 * 회전 상태(useRotationState) + 세 가지 입력 방식(드래그·휠·키보드)을 합친다.
 */
export function useRoom({ count, turnMs, locked = false }: Options) {
  const engine = useRotationState(count, turnMs)
  const [dragging, setDragging] = useState(false)
  const [touched, setTouched] = useState(false)
  const markTouched = useCallback(() => setTouched(true), [])

  usePointerRotation(engine, { locked, onDragChange: setDragging, onTouch: markTouched })
  useWheelRotation(engine.turn, { locked, onTouch: markTouched })
  useKeyboardRotation({ locked, count, turn: engine.turn, goTo: engine.goTo, onTouch: markTouched })

  return {
    roomRef: engine.roomRef,
    index: engine.index,
    turn: engine.turn,
    goTo: engine.goTo,
    dragging,
    touched,
  }
}
