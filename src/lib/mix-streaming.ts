/**
 * Mix streaming utilities for handling SSE events.
 * Adapted from mix-cookbooks helpers.ts for web usage.
 */

import type { Mix } from 'mix-typescript-sdk'

export interface StreamEvent {
  event: string
  data: any
}

export interface StreamCallbacks {
  onThinking?: (text: string) => void
  onContent?: (text: string) => void
  onTool?: (tool: any) => void
  onToolExecutionStart?: (data: any) => void
  onToolExecutionComplete?: (data: any) => void
  onError?: (error: string) => void
  onPermission?: (data: any) => void
  onComplete?: () => void
}

/**
 * Send a message via streaming with callbacks for different event types.
 * This is the TypeScript equivalent of the Python send_with_callbacks helper.
 */
export async function sendWithCallbacks(
  mix: Mix,
  sessionId: string,
  message: string,
  callbacks: StreamCallbacks = {}
): Promise<void> {
  const {
    onThinking,
    onContent,
    onTool,
    onToolExecutionStart,
    onToolExecutionComplete,
    onError,
    onPermission,
    onComplete,
  } = callbacks

  // Start the event stream
  const streamResponse = await mix.streaming.streamEvents({
    sessionId,
  })

  // Allow stream connection to establish
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Start sending the message in parallel with stream processing
  const sendPromise = mix.messages.send({
    id: sessionId,
    requestBody: {
      text: message,
    },
  })

  try {
    // Process events from the stream
    for await (const event of streamResponse.result) {
      if (!event.data) continue

      const eventType = event.event
      const eventData = event.data

      switch (eventType) {
        case 'thinking':
          if (onThinking && eventData.content) {
            onThinking(eventData.content)
          }
          break

        case 'content':
          if (onContent && eventData.content) {
            onContent(eventData.content)
          }
          break

        case 'tool':
          if (onTool) {
            onTool(eventData)
          }
          break

        case 'tool_execution_start':
          if (onToolExecutionStart) {
            onToolExecutionStart(eventData)
          }
          break

        case 'tool_execution_complete':
          if (onToolExecutionComplete) {
            onToolExecutionComplete(eventData)
          }
          break

        case 'error':
          if (onError && eventData.error) {
            onError(eventData.error)
          }
          break

        case 'permission':
          if (onPermission) {
            onPermission(eventData)
          }
          break

        case 'complete':
          if (onComplete) {
            onComplete()
          }
          // Wait for send to complete before exiting
          await sendPromise
          return
      }
    }

    // If stream ends without complete event, wait for send
    await sendPromise
  } catch (error: any) {
    if (onError) {
      onError(error.message || String(error))
    } else {
      throw error
    }
  }
}

/**
 * Parse tool output for show_media events to extract chart/plot information.
 */
export function parseShowMediaTool(tool: any): Array<{
  title: string
  description?: string
  path?: string
}> {
  if (tool.name !== 'show_media' || !tool.input) return []

  try {
    const input = typeof tool.input === 'string' ? JSON.parse(tool.input) : tool.input
    return input.outputs || []
  } catch (e) {
    return []
  }
}
