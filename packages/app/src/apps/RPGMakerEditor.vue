<script lang="ts">
v.registerAll(false);

const localStorage = newLocalStorage("tinkerbox/RPGMakerEditor", {
	path: v.newExtractor(t.string),
});
</script>

<script setup lang="ts">
import "@/components/Widget/widgetRegistry";
import api from "@/api";
import FileBrowser, { type FolderEntryInfo } from "@/apps/FileBrowser.vue";
import { newLocalStorage } from "@/utils/localStorage";
import * as t from "@/utils/runtimeType";
import * as v from "@/utils/runtimeType/validate";
import { computedAsync } from "@vueuse/core";
import { ref, watchEffect } from "vue";

const path = ref(localStorage.get("path") ?? ".");
watchEffect(() => localStorage.set("path", path.value));

watchEffect(() => {
	if (/^[.]/.test(path.value)) {
		api.fs.absolute_path.post({ path: path.value }).then((r) => (path.value = r.data!));
	}
});

const onFile = ref<(path: string) => void>();
const fileBrowserFilter = ref<(entry: FolderEntryInfo) => void>();

const www = computedAsync(() => {
	const candidatePath = path.value + "/www";
	// TODO: why does this throw an error...
	return api.fs.stat.post({ path: candidatePath }).then(
		(r) => (r.data?.type === "folder" ? candidatePath : path.value),
		() => path.value,
	);
});

// TODO: functionality for changing folder
// - avoid clutter - the button should not always be visible
// - avoid tedium - the button should not be hard to reach
</script>

<template>
	<div v-show="!onFile">
		<div class="titlebar">
			Project folder:
			<button
				@click="
					{
						onFile = (newPath) => (path = newPath);
						fileBrowserFilter = (entry) => entry.type === 'folder';
					}
				"
			>
				{{ path }}
			</button>
		</div>
	</div>
	<div v-if="onFile" class="select-file-dialog">
		Select new root folder
		<FileBrowser
			input
			:filter="fileBrowserFilter"
			@submit="onFile($event[0]?.path ?? '.')"
			@cancel="onFile = fileBrowserFilter = undefined"
		/>
	</div>
</template>

<style scoped>
.titlebar {
	display: flex;
	place-items: center;
	gap: 0.5em;
}

.select-file-dialog {
	display: flex;
	flex-flow: column;
	gap: 0.5em;
}
</style>
