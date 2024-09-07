<script setup lang="ts">
import api from "@/api";
import FileIcon from "@/assets/icons/file.svg";
import FolderIcon from "@/assets/icons/folder.svg";
import { computedAsync } from "@vueuse/core";
import { computed, watch } from "vue";

// TODO: list view, details view, drag, select (+ multi-select), disable user-select
// also cut and paste and clipboard view.
const props = defineProps<{
	input?: boolean;
	multiple?: boolean;
	filter?: (entry: FolderEntryInfo) => void;
}>();
const emit = defineEmits<{ submit: [] }>();
const path = defineModel<string>("path", { required: true });
const selection = defineModel<readonly FolderEntryInfo[]>("selection");
const selectedNames = computed(() => new Set(selection.value?.map((entry) => entry.name)));

watch(path, () => (selection.value = []));

export interface FolderEntryInfo {
	type: "folder" | "file";
	name: string;
	path: string;
}

const unsortedEntries = computedAsync(() =>
	api.fs.list
		.post({ path: path.value })
		.then((r) => r.data!.map((entry) => ({ ...entry, path: `${path.value}/${entry.name}` }))),
);
// TODO: sort i guess
const entries = computed(() => unsortedEntries.value);
const filteredEntries = computed(() =>
	props.filter === undefined ? entries.value : entries.value.filter(props.filter),
);

const onEntryClick = (entry: FolderEntryInfo, index: number, event: MouseEvent) => {
	switch (event.detail) {
		case 1: {
			// TODO: multi select
			selection.value = [entry];
			break;
		}
		case 2: {
			// Open entry
			if (props.input) {
				emit("submit");
				break;
			}
			switch (entry.type) {
				case "folder": {
					// FIXME: how to select a folder...
					path.value = entry.path;
					break;
				}
				case "file": {
					api.fs.open.post({ path: entry.path });
					break;
				}
			}
			break;
		}
	}
};

const onEntryDragStart = (entry: FolderEntryInfo, event: DragEvent) => {
	event.dataTransfer?.items.add(new File([], entry.name));
};
</script>

<template>
	<div class="folder-entries">
		<div
			v-for="(entry, index) in filteredEntries"
			class="folder-entry"
			:class="{ selected: selectedNames.has(entry.name) }"
			:draggable="true"
			:key="entry.name"
			@click="onEntryClick(entry, index, $event)"
			@dragstart="onEntryDragStart(entry, $event)"
		>
			<img class="icon" :src="entry.type === 'folder' ? FolderIcon : FileIcon" />
			<span class="folder-entry-name">{{ entry.name }}</span>
		</div>
	</div>
</template>

<style scoped>
.folder-entries {
	display: grid;
	gap: 4px;
	--size: 84px;
	grid-template-columns: repeat(auto-fill, minmax(var(--size), 1fr));
	grid-template-rows: repeat(auto-fill, minmax(var(--size), 1fr));
}

.folder-entry {
	cursor: default;
	display: flex;
	flex-flow: column;
	align-items: center;
	border-radius: var(--radius-small);
	padding: 4px;
	user-select: none;

	&:hover {
		background: var(--hover-bg);
	}
}

.folder-entry-name {
	max-width: 100%;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.icon {
	pointer-events: none;
	--icon-size: 64px;
	height: var(--icon-size);
	width: var(--icon-size);
}
</style>
