<script setup lang="ts">
defineModel<Type>({ required: true });

// FIXME: styling
</script>

<script lang="ts">
export type Type = undefined;

export const matches = (value: unknown): value is Type => {
	return value === undefined;
};

export const defaultValue = (): Type => {
	return undefined;
};
</script>

<template>
	<div class="UndefinedWidget">__</div>
</template>

<style scoped>
.UndefinedWidget {
	display: block;
}
</style>
