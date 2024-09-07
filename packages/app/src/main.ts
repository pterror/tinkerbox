import { createApp } from "vue";
import "./assets/main.css";

const App =
	process.env.HOMEPAGE === "true"
		? (await import("./Homepage.vue")).default
		: (await import("./App.vue")).default;

createApp(App).mount("#app");
