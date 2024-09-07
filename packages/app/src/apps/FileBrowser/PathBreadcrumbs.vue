<script setup lang="ts">
import { computed } from "vue";

const path = defineModel<string>("path", { required: true });

const parts = computed(() => path.value.replace(/^[/]/, "").split("/"));

// TODO: push to browser history using hash to store path
const goToParent = (i: number) => {
	const prefix = path.value.startsWith("/") ? "/" : "";
	const newPath = prefix + parts.value.slice(0, i + 1).join("/");
	path.value = newPath;
};

// FIXME: remove whitespace in markup
</script>

<template>
	<ul class="path-breadcrumbs">
		<li v-for="(part, i) in parts" :key="i">
			/
			<div role="button" class="no-bg path-breadcrumb" @click="goToParent(i)">
				{{ part }}
			</div>
		</li>
	</ul>
</template>

<style scoped>
.path-breadcrumbs {
	display: flex;
	cursor: default;
}

.path-breadcrumb {
	margin-right: 4px;
}
</style>
