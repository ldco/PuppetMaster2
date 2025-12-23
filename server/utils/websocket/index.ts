/**
 * WebSocket Utilities
 *
 * Export all WebSocket-related utilities for easy import.
 *
 * Usage:
 *   import { wsHub, authenticateWebSocket } from '../utils/websocket'
 */

export { wsHub } from './_hub'
export { authenticateWebSocket, requireWSRole } from './_auth'
export * from './_types'
