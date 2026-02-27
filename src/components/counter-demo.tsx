"use client";

import { Button } from "@/components/ui/button";
import { useCounterStore } from "@/store/counter-store";

export function CounterDemo() {
	const { count, increment, decrement, reset } = useCounterStore();

	return (
		<div className="flex flex-col items-center gap-6 rounded-xl border p-8 shadow-sm">
			<h2 className="text-lg font-semibold text-muted-foreground">Zustand Counter Demo</h2>
			<span className="text-6xl font-bold tabular-nums">{count}</span>
			<div className="flex gap-3">
				<Button variant="outline" onClick={decrement}>
					−
				</Button>
				<Button onClick={increment}>+</Button>
				<Button variant="ghost" onClick={reset}>
					Reset
				</Button>
			</div>
		</div>
	);
}
