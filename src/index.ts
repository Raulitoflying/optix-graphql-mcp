#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { parse } from "graphql";
import { z } from "zod";
import { checkDeprecatedArguments } from "./helpers/deprecation.js";
import {
	introspectEndpoint,
	introspectLocalSchema,
	introspectSchemaFromUrl,
} from "./helpers/introspection.js";
import { getVersion } from "./helpers/package.js";

// Import Optix business tools
import { createOptixTools } from "./optix/tools.js";

// Check for deprecated command line arguments
checkDeprecatedArguments();

const EnvSchema = z.object({
	NAME: z.string().default("mcp-graphql"),
	ENDPOINT: z.string().url().default("http://localhost:4000/graphql"),
	ALLOW_MUTATIONS: z
		.enum(["true", "false"])
		.transform((value) => value === "true")
		.default("false"),
	HEADERS: z
		.string()
		.default("{}")
		.transform((val) => {
			try {
				return JSON.parse(val);
			} catch (e) {
				throw new Error("HEADERS must be a valid JSON string");
			}
		}),
	SCHEMA: z.string().optional(),
});

const env = EnvSchema.parse(process.env);

// Detect if this is an Optix API endpoint
const IS_OPTIX = env.ENDPOINT.includes("optixapp.com") || env.ENDPOINT.includes("optix");

const server = new McpServer({
	name: env.NAME,
	version: getVersion(),
	description: `GraphQL MCP server for ${env.ENDPOINT}${IS_OPTIX ? " (with Optix business tools)" : ""}`,
});

server.resource("graphql-schema", new URL(env.ENDPOINT).href, async (uri) => {
	try {
		let schema: string;
		if (env.SCHEMA) {
			if (
				env.SCHEMA.startsWith("http://") ||
				env.SCHEMA.startsWith("https://")
			) {
				schema = await introspectSchemaFromUrl(env.SCHEMA);
			} else {
				schema = await introspectLocalSchema(env.SCHEMA);
			}
		} else {
			schema = await introspectEndpoint(env.ENDPOINT, env.HEADERS);
		}

		return {
			contents: [
				{
					uri: uri.href,
					text: schema,
				},
			],
		};
	} catch (error) {
		throw new Error(`Failed to get GraphQL schema: ${error}`);
	}
});

server.tool(
	"introspect-schema",
	"Introspect the GraphQL schema, use this tool before doing a query to get the schema information if you do not have it available as a resource already.",
	{
		// This is a workaround to help clients that can't handle an empty object as an argument
		// They will often send undefined instead of an empty object which is not allowed by the schema
		__ignore__: z
			.boolean()
			.default(false)
			.describe("This does not do anything"),
	},
	async () => {
		try {
			let schema: string;
			if (env.SCHEMA) {
				schema = await introspectLocalSchema(env.SCHEMA);
			} else {
				schema = await introspectEndpoint(env.ENDPOINT, env.HEADERS);
			}

			return {
				content: [
					{
						type: "text",
						text: schema,
					},
				],
			};
		} catch (error) {
			return {
				isError: true,
				content: [
					{
						type: "text",
						text: `Failed to introspect schema: ${error}`,
					},
				],
			};
		}
	},
);

server.tool(
	"query-graphql",
	"Query a GraphQL endpoint with the given query and variables",
	{
		query: z.string(),
		variables: z.string().optional(),
	},
	async ({ query, variables }) => {
		try {
			const parsedQuery = parse(query);

			// Check if the query is a mutation
			const isMutation = parsedQuery.definitions.some(
				(def) =>
					def.kind === "OperationDefinition" && def.operation === "mutation",
			);

			if (isMutation && !env.ALLOW_MUTATIONS) {
				return {
					isError: true,
					content: [
						{
							type: "text",
							text: "Mutations are not allowed unless you enable them in the configuration. Please use a query operation instead.",
						},
					],
				};
			}
		} catch (error) {
			return {
				isError: true,
				content: [
					{
						type: "text",
						text: `Invalid GraphQL query: ${error}`,
					},
				],
			};
		}

		try {
			const response = await fetch(env.ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...env.HEADERS,
				},
				body: JSON.stringify({
					query,
					variables,
				}),
			});

			if (!response.ok) {
				const responseText = await response.text();

				return {
					isError: true,
					content: [
						{
							type: "text",
							text: `GraphQL request failed: ${response.statusText}\n${responseText}`,
						},
					],
				};
			}

			const data = await response.json();

			if (data.errors && data.errors.length > 0) {
				// Contains GraphQL errors
				return {
					isError: true,
					content: [
						{
							type: "text",
							text: `The GraphQL response has errors, please fix the query: ${JSON.stringify(
								data,
								null,
								2,
							)}`,
						},
					],
				};
			}

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		} catch (error) {
			throw new Error(`Failed to execute GraphQL query: ${error}`);
		}
	},
);

// ==================== Register Optix Business Tools ====================

if (IS_OPTIX) {
	console.error("Detected Optix API - enabling business tools");
	
	const optixTools = createOptixTools();
	
	// Register each Optix tool
	for (const [toolName, tool] of optixTools) {
		server.tool(
			toolName,
			tool.description,
			tool.inputSchema.shape, // Extract the shape from ZodObject
			async (args: any) => {
				try {
					const result = await tool.execute(args, env.ENDPOINT, env.HEADERS);
					return {
						content: [
							{
								type: "text" as const,
								text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error: any) {
					return {
						isError: true,
						content: [
							{
								type: "text" as const,
								text: `Optix tool error: ${error.message}`,
							},
						],
					};
				}
			},
		);
	}
	
	console.error(`Registered ${optixTools.size} Optix business tools`);
}

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error(
		`Started graphql mcp server ${env.NAME} for endpoint: ${env.ENDPOINT}`,
	);
	
	if (IS_OPTIX) {
		console.error("🎯 Optix business tools are active!");
		console.error("Available Optix tools:");
		console.error("  • optix_list_bookings - List and filter bookings");
		console.error("  • optix_check_availability - Check resource availability");
		console.error("  • optix_create_booking - Create new bookings");
		console.error("  • optix_list_members - Find and manage members");
		console.error("  • optix_list_resources - Browse meeting rooms and spaces");
		console.error("  • optix_get_booking_stats - Analytics and reports");
		console.error("  • And many more business-specific tools!");
	}
}

main().catch((error) => {
	console.error(`Fatal error in main(): ${error}`);
	process.exit(1);
});
