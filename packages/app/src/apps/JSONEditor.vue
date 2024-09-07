<script lang="ts">
v.registerAll(false);

const localStorage = newLocalStorage("tinkerbox/JSONEditor", {
	path: v.newExtractor(t.string),
});
</script>

<script setup lang="ts">
import "@/components/Widget/widgetRegistry";
import api from "@/api";
import FileBrowser from "@/apps/FileBrowser.vue";
import Widget from "@/components/Widget.vue";
import { newLocalStorage } from "@/utils/localStorage";
import * as t from "@/utils/runtimeType";
import * as v from "@/utils/runtimeType/validate";
import { computedAsync } from "@vueuse/core";
import { ref, watchEffect } from "vue";

const path = ref(localStorage.get("path"));
watchEffect(() => path.value && localStorage.set("path", path.value));

const isSelectingFile = ref(false);

watchEffect(() => {
	if (!path.value || !/^[.]/.test(path.value)) return;
	api.fs.absolute_path.post({ path: path.value }).then((r) => (path.value = r.data!));
});

// TODO: the rest

const contents = computedAsync<unknown>(() =>
	path.value !== undefined
		? api.fs.get.post({ path: path.value }).then((r) => new Response(r.data).json())
		: undefined,
);

const save = () => {
	if (path.value === undefined || contents.value === undefined) return;
	api.fs.set.post({ path: path.value, contents: JSON.stringify(contents.value) });
};

// FIXME: adding an item into a list does not re-render the widget until it is moved?
</script>

<template>
	<div v-if="!isSelectingFile">
		<div class="titlebar">
			File:
			<button @click="isSelectingFile = true">
				{{ path ?? "Choose file" }}
			</button>
			<button v-if="path !== undefined && contents !== undefined" @click="save">Save</button>
		</div>
		<Widget v-if="path !== undefined && contents !== undefined" v-model="contents" />
	</div>
	<div v-if="isSelectingFile" class="select-file-dialog">
		Select new file
		<FileBrowser
			input
			@submit="(path = $event[0]?.path ?? '.'), (isSelectingFile = false)"
			@cancel="isSelectingFile = false"
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
