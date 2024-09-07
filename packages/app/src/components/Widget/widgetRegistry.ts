import { registerWidget, type WidgetModule } from "@/components/Widget/widgets";

for (const module of Object.values(
	import.meta.glob("@/components/Widget/widgets/*", { eager: true }),
)) {
	registerWidget(module as WidgetModule);
}
