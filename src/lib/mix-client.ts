/**
 * Mix SDK client singleton for server-side operations.
 * This module provides a configured Mix client instance.
 */

import { Mix } from "mix-typescript-sdk";

let mixClient: Mix | null = null;

/**
 * Get or create a Mix client instance.
 * Uses environment variables for configuration.
 */
export function getMixClient(): Mix {
	if (!mixClient) {
		const serverURL = process.env.MIX_SERVER_URL;

		if (!serverURL) {
			throw new Error("MIX_SERVER_URL environment variable is not set");
		}

		mixClient = new Mix({
			serverURL,
		});
	}

	return mixClient;
}

/**
 * Initialize Mix preferences with default settings.
 * Call this once at app startup or per-session.
 */
export async function initializeMixPreferences(mix: Mix) {
	await mix.preferences.update({
		preferredProvider: "anthropic",
		mainAgentModel: "claude-sonnet-4-5",
	});
}

export default getMixClient();
