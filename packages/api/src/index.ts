import { readdir, stat } from "node:fs/promises";
import { platform as getPlatform, homedir } from "node:os";
import { join as joinPath, resolve as resolvePath } from "node:path";
import { cors } from "@elysiajs/cors";
import { Database } from "bun:sqlite";
import { Elysia, t } from "elysia";

const platform = getPlatform();

const dbs: Record<string, Database> = {};

const db = (name: string, def: string) => {
	const found = dbs[name];
	if (found) {
		return found;
	} else {
		const db = new Database("./" + name + ".db");
		db.run(def);
		dbs[name] = db;
		return db;
	}
};

interface Fact {
	subject: string;
	predicate: string;
	object: string;
}

let textWorldJson: Fact[] | undefined;

const textWorldData = async () => {
	if (textWorldJson) return textWorldJson;
	try {
		const json: [string, string, string][] = await Bun.file("./text_world.json").json();
		textWorldJson = json.map(([subject, predicate, object]) => ({
			subject,
			predicate,
			object,
		}));
	} catch {
		textWorldJson = [];
	}
	return textWorldJson ?? [];
};

const saveTextWorldData = async () => {
	if (!textWorldJson) return;
	await Bun.write(
		Bun.file("./text_world.json"),
		JSON.stringify(
			textWorldJson.map(({ subject, predicate, object }) => [subject, predicate, object]),
		),
	);
};

export type App = typeof app;
const app = new Elysia()
	.use(cors())
	.post(
		"/api/fs/important_folders",
		() => {
			const home = homedir();
			if (platform == "win32") {
				return [
					{ name: "Home", path: home },
					{ name: "My Desktop", path: joinPath(home, "My Desktop") },
					{ name: "My Documents", path: joinPath(home, "My Documents") },
					{ name: "My Downloads", path: joinPath(home, "My Downloads") },
					{ name: "My Pictures", path: joinPath(home, "My Pictures") },
					{ name: "My Videos", path: joinPath(home, "My Videos") },
				];
			} else {
				// TODO: macOS variant including "Applications"
				return [
					{ name: "Home", path: home },
					{ name: "Desktop", path: joinPath(home, "Desktop") },
					{ name: "Documents", path: joinPath(home, "Documents") },
					{ name: "Downloads", path: joinPath(home, "Downloads") },
					{ name: "Pictures", path: joinPath(home, "Pictures") },
					{ name: "Videos", path: joinPath(home, "Videos") },
				];
			}
		},
		{ body: t.Literal("") },
	)
	.post(
		"/api/fs/list",
		({ body: { path } }) =>
			readdir(path, { withFileTypes: true }).then((entries) =>
				entries.map((entry) => ({
					type: entry.isDirectory() ? ("folder" as const) : ("file" as const),
					name: entry.name,
				})),
			),
		{
			body: t.Object({ path: t.String() }),
		},
	)
	.post("/api/fs/absolute_path", ({ body: { path } }) => resolvePath(path), {
		body: t.Object({ path: t.String() }),
	})
	.post(
		"/api/fs/stat",
		async ({ body: { path } }) => {
			const stats = await stat(path);
			return { type: stats.isDirectory() ? "folder" : "file" };
		},
		{
			body: t.Object({ path: t.String() }),
		},
	)
	// TODO: `.stream()` doesn't seem to work with elysia?
	.post("/api/fs/get", ({ body: { path } }) => Bun.file(path).text(), {
		body: t.Object({ path: t.String() }),
	})
	.post(
		"/api/fs/set",
		({ body: { path, contents } }) => Bun.write(Bun.file(path), contents).then(() => {}),
		{
			// FIXME: ideally this would be contents: blob (or readablestream)
			body: t.Object({ path: t.String(), contents: t.String() }),
		},
	)
	.post(
		"/api/fs/open",
		async ({ body: { path } }) => {
			// See https://github.com/oven-sh/bun/blob/3221bfeeb7036e76872c1a602aa5cd7c83ed3b4a/src/open.zig#L14-L18
			switch (platform) {
				case "win32": {
					await Bun.$`start ${path}`;
					break;
				}
				case "darwin": {
					await Bun.$`/usr/bin/open ${path}`;
					break;
				}
				default: {
					// Assume Linux.
					await Bun.$`xdg-open ${path}`;
				}
			}
		},
		{
			body: t.Object({ path: t.String() }),
		},
	)
	.post(
		"/api/text_world/list",
		async ({ body }) => {
			const { subject, predicate, object } = body || {};
			const data = await textWorldData();
			const filter: ((fact: Fact) => boolean) | undefined =
				subject !== undefined
					? predicate !== undefined
						? object !== undefined
							? (fact) =>
									fact.subject === subject && fact.predicate === predicate && fact.object === object
							: (fact) => fact.subject === subject && fact.predicate === predicate
						: object !== undefined
							? (fact) => fact.subject === subject && fact.object === object
							: (fact) => fact.subject === subject
					: predicate !== undefined
						? object !== undefined
							? (fact) => fact.predicate === predicate && fact.object === object
							: (fact) => fact.predicate === predicate
						: object !== undefined
							? (fact) => fact.object === object
							: undefined;
			return filter == undefined ? data : data.filter(filter);
		},
		{
			body: t.Partial(
				t.Object({
					subject: t.String(),
					predicate: t.String(),
					object: t.String(),
				}),
			),
		},
	)
	.listen(7809);
