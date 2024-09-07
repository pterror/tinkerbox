<script lang="ts">
v.registerAll(false);

const localStorage = newLocalStorage("tinkerbox/App", {
	app: v.newExtractor(t.string),
});
</script>

<script setup lang="ts">
import { newLocalStorage } from "@/utils/localStorage";
import * as t from "@/utils/runtimeType";
import * as v from "@/utils/runtimeType/validate";
import {
	defineAsyncComponent,
	ref,
	shallowRef,
	watchEffect,
	type ComponentPublicInstance,
} from "vue";

const apps = Object.entries(import.meta.glob("@/apps/*.vue")).map(([k, v]) => ({
	name: k.replace(/^.+[/]|.vue$/g, ""),
	component: defineAsyncComponent(v as unknown as () => Promise<ComponentPublicInstance>),
}));

const appName = ref<string>();
const app = shallowRef<ComponentPublicInstance>();

watchEffect(() => appName.value && localStorage.set("app", appName.value));

const savedAppName = localStorage.get("app");
if (savedAppName !== undefined) {
	const entry = apps.find((app) => app.name === savedAppName);
	if (entry !== undefined) {
		appName.value = entry.name;
		app.value = entry.component;
	}
}
</script>

<template>
	<div class="App">
		<details
			class="app-picker"
			@click="
				($event.currentTarget as HTMLDetailsElement).open = !(
					$event.currentTarget as HTMLDetailsElement
				).open
			"
		>
			<summary @click.stop>{{ appName ?? "Select an app" }}</summary>
			<div role="listbox">
				<button
					v-for="{ name, component } in apps"
					class="no-bg"
					@click="(appName = name), (app = component), $event.currentTarget"
				>
					{{ name }}
				</button>
			</div>
		</details>
		<component v-if="app" :is="app" />
	</div>
</template>

<style scoped>
.App {
	display: flex;
	flex-flow: column;
	gap: 0.5em;
}

.app-picker {
	user-select: none;

	> summary {
		cursor: pointer;
	}
}
</style>
