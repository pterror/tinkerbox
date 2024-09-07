<script setup lang="ts">
import api from "@/api";
import FolderIcon from "@/assets/icons/folder.svg";
import { computedAsync } from "@vueuse/core";

const path = defineModel<string>("path", { required: true });

interface ImportantFolder {
	name: string;
	path: string;
}

const folders = computedAsync(() => api.fs.important_folders.post("").then((r) => r.data!));

// TODO: highlight selected folder
const goTo = (folder: ImportantFolder) => {
	path.value = folder.path;
};
</script>

<template>
	<ul class="important-folders">
		<li v-for="folder in folders">
			<button class="important-folder" @click="goTo(folder)">
				<img class="icon" :src="FolderIcon" />
				{{ folder.name }}
			</button>
		</li>
	</ul>
</template>

<style scoped>
.important-folder {
	width: 100%;
	padding: 4px 8px;
}

.icon {
	--size: 16px;
	height: var(--size);
	width: var(--size);
}
</style>
