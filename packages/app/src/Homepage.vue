<script setup lang="ts">
import { useDateFormat, useNow } from "@vueuse/core";

const date = useDateFormat(useNow(), "HH:mm");
</script>

<template>
	<div class="Homepage">
		<span class="date">{{ date }}</span>
	</div>
</template>

<style scoped>
.Homepage {
	height: 100%;
	display: grid;
	place-items: center;
	font-family: "Unicorn Scribbles", var(--fonts-sans);
	font-size: 1.2em;
	user-select: none;
	color: lch(85 35 340 / 80%);

	* {
		user-select: none;
	}
}

.date {
	font-size: 8rem;
}
</style>
