<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";

const model = defineModel<Type>({ required: true });

const autoSize = (element: HTMLElement) => {
	if (!(element instanceof HTMLElement)) return;
	element.style.width = "0";
	element.style.width = `${Math.max(64, element.scrollWidth)}px`;
};

const autoSizeRef = (element: unknown) => {
	if (element instanceof HTMLElement) requestAnimationFrame(() => autoSize(element));
};

const autoSizeEventTarget = (event: Event) => {
	const target = event.currentTarget;
	if (!(target instanceof HTMLElement)) return;
	autoSize(target);
};
</script>

<script lang="ts">
export type Type = string;

export const matches = (value: unknown): value is Type => {
	return typeof value === "string";
};

export const defaultValue = (): Type => {
	return "";
};
</script>

<template>
	<input
		:ref="autoSizeRef"
		:size="1"
		class="TextInputWidget"
		type="text"
		v-model="model"
		@input="autoSizeEventTarget"
	/>
</template>

<style scoped>
.TextInputWidget {
	width: 64px;
	background: lch(100% 0 0 / 0.075);
	text-align: center;
	border: none;
	border-radius: 4px;
	padding: 4px;
}
</style>
