/**
 * WebSocket Utilities
 *
 * Export all WebSocket-related utilities for easy import.
 *
 * Usage:
 *   import { wsHub, authenticateWebSocket } from '../utils/websocket'
 */

export { wsHub } from './hub'
export { authenticateWebSocket, requireWSRole } from './auth'
export * from './types'
