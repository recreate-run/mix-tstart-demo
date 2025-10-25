/**
 * Mix streaming utilities for handling SSE events.
 * Adapted from mix-cookbooks helpers.ts for web usage.
 */

import type { Mix } from "mix-typescript-sdk";

export interface StreamEvent {
	event: string;
	data: unknown;
}

export interface StreamCallbacks {
	onThinking?: (text: string) => void;
	onContent?: (text: string) => void;
	onTool?: (tool: unknown) => void;
	onToolExecutionStart?: (data: unknown) => void;
	onToolExecutionComplete?: (data: unknown) => void;
	onError?: (error: string) => void;
	onPermission?: (data: unknown) => void;
	onComplete?: () => void;
	// New v0.8.x event handlers
	onUserMessageCreated?: (data: unknown) => void;
	onSessionCreated?: (data: unknown) => void;
	onSessionDeleted?: (data: unknown) => void;
	onToolParameterDelta?: (data: unknown) => void;
	onHeartbeat?: () => void;
	onConnected?: () => void;
}

/**
 * Send a message via streaming with callbacks for different event types.
 * This is the TypeScript equivalent of the Python send_with_callbacks helper.
 */
export async function sendWithCallbacks(
	mix: Mix,
	sessionId: string,
	message: string,
	callbacks: StreamCallbacks = {},
	planMode = false,
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
		onUserMessageCreated,
		onSessionCreated,
		onSessionDeleted,
		onToolParameterDelta,
		onHeartbeat,
		onConnected,
	} = callbacks;

	// Start the event stream
	const streamResponse = await mix.streaming.streamEvents({
		sessionId,
	});

	// Allow stream connection to establish
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Start sending the message in parallel with stream processing
	const sendPromise = mix.messages.send({
		id: sessionId,
		requestBody: {
			text: message,
			planMode,
		},
	});

	try {
		// Process events from the stream
		for await (const event of streamResponse.result) {
			if (!event.data) continue;

			const eventType = event.event;
			const eventData = event.data;

			switch (eventType) {
				case "thinking":
					if (onThinking && "content" in eventData && eventData.content) {
						onThinking(eventData.content);
					}
					break;

				case "content":
					if (onContent && "content" in eventData && eventData.content) {
						onContent(eventData.content);
					}
					break;

				case "tool":
					if (onTool) {
						onTool(eventData);
					}
					break;

				case "tool_execution_start":
					if (onToolExecutionStart) {
						onToolExecutionStart(eventData);
					}
					break;

				case "tool_execution_complete":
					if (onToolExecutionComplete) {
						onToolExecutionComplete(eventData);
					}
					break;

				case "error":
					if (onError && "error" in eventData && eventData.error) {
						onError(eventData.error);
					}
					break;

				case "permission":
					if (onPermission) {
						onPermission(eventData);
					}
					break;

				case "user_message_created":
					if (onUserMessageCreated) {
						onUserMessageCreated(eventData);
					}
					break;

				case "session_created":
					if (onSessionCreated) {
						onSessionCreated(eventData);
					}
					break;

				case "session_deleted":
					if (onSessionDeleted) {
						onSessionDeleted(eventData);
					}
					break;

				case "tool_parameter_delta":
					if (onToolParameterDelta) {
						onToolParameterDelta(eventData);
					}
					break;

				case "heartbeat":
					if (onHeartbeat) {
						onHeartbeat();
					}
					break;

				case "connected":
					if (onConnected) {
						onConnected();
					}
					break;

				case "complete":
					if (onComplete) {
						onComplete();
					}
					// Wait for send to complete before exiting
					await sendPromise;
					return;
			}
		}

		// If stream ends without complete event, wait for send
		await sendPromise;
	} catch (error: unknown) {
		if (onError) {
			onError(error instanceof Error ? error.message : String(error));
		} else {
			throw error;
		}
	}
}

/**
 * Parse tool output for ShowMedia events to extract chart/plot information.
 * Note: In SDK v0.8.x, the tool name changed from 'show_media' to 'ShowMedia' (PascalCase)
 */
export function parseShowMediaTool(tool: unknown): Array<{
	title: string;
	description?: string;
	path?: string;
}> {
	if (
		!tool ||
		typeof tool !== "object" ||
		!("name" in tool) ||
		tool.name !== "ShowMedia" ||
		!("input" in tool) ||
		!tool.input
	)
		return [];

	try {
		const input =
			typeof tool.input === "string" ? JSON.parse(tool.input) : tool.input;
		return input.outputs || [];
	} catch (_e) {
		return [];
	}
}
