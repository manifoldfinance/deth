import { ExecutionContext } from '../ExecutionContext'
import { InvalidOpcode, UnreachableInstruction } from '../errors'

export function invalidOpcode (opcode: number) {
  return function (ctx: ExecutionContext) {
    throw new InvalidOpcode(opcode)
  }
}

export function opUnreachable (ctx: ExecutionContext) {
  throw new UnreachableInstruction()
}
