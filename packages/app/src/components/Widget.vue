<script setup lang="ts">
import { getWidget } from "@/components/Widget/widgets";
import { watchEffect } from "vue";

const model = defineModel<unknown>({ required: true });

watchEffect(() => {
	console.log(getWidget(model.value));
});
</script>

<template>
	<component :is="getWidget(model)" v-model="model" />
</template>
