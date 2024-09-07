<script setup lang="ts">
defineModel<null>({ required: true });

// FIXME: styling
</script>

<script lang="ts">
export type Type = null;

export const matches = (value: unknown): value is Type => {
	return value === null;
};

export const defaultValue = (): Type => {
	return null;
};
</script>

<template>
	<div class="NothingWidget">_</div>
</template>

<style scoped>
.NothingWidget {
	display: block;
}
</style>
