<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect } from "vue";

// TODO: close button (optional)

const props = defineProps<{
	title?: string;
	width?: number;
	height?: number;
	left?: number;
	top?: number;
}>();

const width = ref(480);
watchEffect(() => props.width !== undefined && (width.value = props.width));
const height = ref(320);
watchEffect(() => props.height !== undefined && (height.value = props.height));
const left = ref(0);
watchEffect(() => props.left !== undefined && (left.value = props.left));
const top = ref(0);
watchEffect(() => props.top !== undefined && (top.value = props.top));

interface Position {
	left: number;
	top: number;
}

const dragStartPos = ref<{ window: Position; mouse: Position }>();
const resizeH = ref<{ width: number; mouseLeft: number }>();
const resizeV = ref<{ height: number; mouseTop: number }>();

const startDragging = (event: MouseEvent) => {
	dragStartPos.value = {
		window: { left: left.value, top: top.value },
		mouse: { left: event.clientX, top: event.clientY },
	};
};

const startResizing = (event: MouseEvent, h: boolean, v: boolean) => {
	if (h) {
		resizeH.value = { width: width.value, mouseLeft: event.clientX };
	}
	if (v) {
		resizeV.value = { height: height.value, mouseTop: event.clientY };
	}
};

const stopDragging = () => {
	dragStartPos.value = undefined;
	resizeH.value = undefined;
	resizeV.value = undefined;
};
onMounted(() => {
	document.addEventListener("mouseup", stopDragging);
	document.addEventListener("contextmenu", stopDragging);
});
onUnmounted(() => {
	document.removeEventListener("mouseup", stopDragging);
	document.removeEventListener("contextmenu", stopDragging);
});

const onMouseMove = (event: MouseEvent) => {
	if (dragStartPos.value) {
		left.value = dragStartPos.value.window.left + (event.clientX - dragStartPos.value.mouse.left);
		top.value = dragStartPos.value.window.top + (event.clientY - dragStartPos.value.mouse.top);
		return;
	}
	if (resizeH.value) {
		width.value = resizeH.value.width + (event.clientX - resizeH.value.mouseLeft);
	}
	if (resizeV.value) {
		height.value = resizeV.value.height + (event.clientY - resizeV.value.mouseTop);
	}
};
onMounted(() => document.addEventListener("mousemove", onMouseMove));
onUnmounted(() => document.removeEventListener("mousemove", onMouseMove));
</script>

<template>
	<div
		class="Window"
		:class="{ dragging: dragStartPos || resizeH || resizeV }"
		:style="{ left: `${left}px`, top: `${top}px` }"
	>
		<div class="title-bar" @mousedown="startDragging">
			{{ title }}
		</div>
		<div class="contents" :style="{ width: `${width}px`, height: `${height}px` }">
			<div class="resizer-right" @mousedown="startResizing($event, true, false)"></div>
			<div class="resizer-bottom" @mousedown="startResizing($event, false, true)"></div>
			<div class="resizer-bottom-right" @mousedown="startResizing($event, true, true)"></div>
			<div class="slot"><slot></slot></div>
		</div>
	</div>
</template>

<style scoped>
.Window {
	position: fixed;
	display: flex;
	flex-flow: column;
	border: 1px solid var(--border-default);
	border-radius: var(--radius-default);
	background-color: lch(0 0 0 / 50%);
	backdrop-filter: opacity(20%) blur(4px);
}

.dragging,
.dragging * {
	user-select: none;
}

.title-bar {
	padding: var(--padding-default);
	cursor: grab;
	user-select: none;
	border-bottom: 1px solid var(--border-default);
}

.contents {
	position: relative;
}

.slot {
	padding: var(--padding-default);
	width: calc(100% - var(--padding-default) * 2);
	height: calc(100% - var(--padding-default) * 2);
	overflow: auto;
}

.resizer-right {
	position: absolute;
	cursor: ew-resize;
	width: var(--resizer-size);
	height: 100%;
	left: 100%;
}

.resizer-bottom {
	position: absolute;
	cursor: ns-resize;
	width: 100%;
	height: var(--resizer-size);
	top: 100%;
}

.resizer-bottom-right {
	position: absolute;
	cursor: nwse-resize;
	height: var(--resizer-size);
	width: var(--resizer-size);
	top: 100%;
	left: 100%;
}
</style>
