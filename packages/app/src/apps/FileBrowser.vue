<script setup lang="ts">
import api from "@/api";
import FolderEntries, { type FolderEntryInfo } from "@/apps/FileBrowser/FolderEntries.vue";
import ImportantFolders from "@/apps/FileBrowser/ImportantFolders.vue";
import PathBreadcrumbs from "@/apps/FileBrowser/PathBreadcrumbs.vue";
import { computed, ref, watchEffect } from "vue";

export type { FolderEntryInfo };

const props = defineProps<{
	input?: boolean;
	multiple?: boolean;
	showImportantFolders?: boolean;
	filter?: (entry: FolderEntryInfo) => void;
}>();
const emit = defineEmits<{ submit: [paths: readonly FolderEntryInfo[]]; cancel: [] }>();

// TODO: Ctrl+L to enter path

const outerPath = defineModel<string>("path");
const fallbackPath = ref(".");
const path = computed({
	get() {
		return outerPath.value ?? fallbackPath.value;
	},
	set(value) {
		outerPath ? (outerPath.value = value) : (fallbackPath.value = value);
	},
});
const selection = ref<readonly FolderEntryInfo[]>([]);

watchEffect(() => {
	if (/^[.]/.test(path.value)) {
		api.fs.absolute_path.post({ path: path.value }).then((r) => (path.value = r.data!));
	}
});
</script>

<template>
	<div class="vertical-container">
		<div v-if="input" class="buttons">
			<button class="default-width-button" @click="emit('submit', selection)">Ok</button>
			<button class="default-width-button" @click="emit('cancel')">Cancel</button>
		</div>
		<div class="root">
			<ImportantFolders v-if="props.showImportantFolders ?? true" v-model:path="path" />
			<div class="folder-entries-container">
				<PathBreadcrumbs v-model:path="path" />
				<FolderEntries
					v-model:path="path"
					v-model:selection="selection"
					:input="input"
					:multiple="multiple"
					:filter="filter"
					@submit="emit('submit', selection)"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped>
.vertical-container {
	display: flex;
	flex-flow: column;
}

.root {
	display: flex;
	gap: 16px;
}

.folder-entries-container {
	flex: 1 0 auto;
}
</style>
