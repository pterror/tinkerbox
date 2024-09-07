<script setup lang="ts">
import "@/components/Widget/widgetRegistry";
import api from "@/api";
import Widget from "@/components/Widget.vue";
import Window from "@/components/Window.vue";
import { escapeHTML } from "@/utils/escapeHTML";
import { computedAsync } from "@vueuse/core";
import { computed, ref, toRaw, watchEffect } from "vue";

// TODO: state (player's current room)
const facts = computedAsync(
	() =>
		api.text_world.list
			.post({ $fetch: { headers: { "Content-Type": "application/json" }, body: "{}" } })
			.then((r) => r.data!),
	[],
);

const a = (s: string) => (/^(?:[aeiou]|hour)/i.test(s) ? "an " : "a ") + s;

const capitalize = (s: string) => (s ? s[0]?.toUpperCase() + s.slice(1) : s);

const subjectAsObject = (subject: string) => {
	const entries: readonly (readonly [string, string | object])[] = facts.value
		.filter((fact) => fact.subject === subject)
		.map((entry) => [entry.predicate, subjectAsObject(entry.object)]);
	return entries.length === 0 ? subject : Object.fromEntries(entries);
};

const lookup = (subject: string, predicate: string) =>
	facts.value.find((fact) => subject === fact.subject && predicate === fact.predicate)?.object;

const name = (subject: string | undefined) =>
	subject ? lookup(subject, "meta.name") ?? subject : "(unnamed)";

// TODO: `meta.description` should ideally be in RDF, but not sure about the format
// because RDF dislikes arrays. Also it doesn't make sense to split it into smaller
// components. A format string is an option but that's making a DSL which is yuck
const describePlayer = (subject: string) => {
	const gender = lookup(subject, "entity.gender")!;
	const subj = lookup(gender, "entity.pronoun.subject")!;
	const poss = lookup(gender, "entity.pronoun.possessive")!;
	const eye = lookup(subject, "eye.color")!;
	// TODO: colorize
	const leftEye = lookup(subject, "eye.left.color") ?? eye;
	const rightEye = lookup(subject, "eye.right.color") ?? eye;
	const eyeText =
		leftEye === rightEye
			? `${capitalize(subj)} has ${rgbColor(leftEye)} eyes.`
			: `${capitalize(poss)} left eye is ${rgbColor(
					leftEye,
				)}, and ${poss} right eye is ${rgbColor(rightEye)}.`;
	return `(looking at ${name(subject)}) You see a ${
		gender === "gender.female" ? "young girl" : "young boy"
	}. ${capitalize(poss)} hair is in ${a(
		name(lookup(subject, "hair.length")!),
	)} ${name(lookup(subject, "hair.style")!)}. ${eyeText}`;
};

const rgb = (subject: string) =>
	`rgb(${lookup(subject, "color.rgb.red")} ${lookup(
		subject,
		"color.rgb.green",
	)} ${lookup(subject, "color.rgb.blue")} / ${lookup(subject, "color.rgb.alpha") ?? 1})`;

const rgbColor = (subject: string) =>
	`<span style="color: ${rgb(subject)}">${escapeHTML(name(subject)!)}</span>`;

const playerId = computed(() => lookup("you", "$ref"));
const player = computed(() => playerId.value && describePlayer(playerId.value));

const playerAsObject = ref({});
watchEffect(() => playerId.value && (playerAsObject.value = subjectAsObject(playerId.value)));
watchEffect(() => {
	console.log(":U", toRaw(playerAsObject.value));
});
// TODO:
const you = [];
</script>

<template>
	<div class="TextWorld">
		<div v-html="player"></div>
		<Window title="You (debug)">
			<Widget v-model="playerAsObject" />
		</Window>
	</div>
</template>

<style scoped>
.TextWorld {
	display: flex;
	gap: 16px;
}
</style>
