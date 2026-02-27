import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MemberStatus = "waiting" | "playing" | "resting";

export interface Member {
	id: string;
	name: string;
	emoji: string;
	playCount: number;
	status: MemberStatus;
	paid: boolean;
}

const EMOJIS = [
	"😀",
	"😎",
	"🥷",
	"🤩",
	"😄",
	"🥸",
	"🤠",
	"😏",
	"🧐",
	"🤗",
	"🦸",
	"🧙",
	"😈",
	"👑",
	"🦊",
	"🐼",
];

const DEFAULT_MEMBERS: Member[] = [];

export type CourtSlots = [string | null, string | null, string | null, string | null];

const EMPTY_COURT: CourtSlots = [null, null, null, null];

interface BadmintonState {
	members: Member[];
	sessionFee: number;
	courts: [CourtSlots, CourtSlots];
	waitingOrder: string[];
	addMember: (name: string) => void;
	removeMember: (id: string) => void;
	assignToSlot: (courtIndex: number, slotIndex: number, memberId: string) => void;
	removeFromSlot: (courtIndex: number, slotIndex: number) => void;
	autoFillSlots: (courtIndex: number) => void;
	finishMatch: (courtIndex: number) => void;
	moveToRest: (id: string) => void;
	returnFromRest: (id: string) => void;
	togglePaid: (id: string) => void;
	setSessionFee: (fee: number) => void;
	reorderWaiting: (ids: string[]) => void;
	clearCourt: (courtIndex: number) => void;
	adjustPlayCount: (id: string, delta: number) => void;
	resetAll: () => void;
}

export const useBadmintonStore = create<BadmintonState>()(
	persist(
		(set, get) => ({
			members: DEFAULT_MEMBERS,
			sessionFee: 200,
			courts: [[...EMPTY_COURT] as CourtSlots, [...EMPTY_COURT] as CourtSlots],
			waitingOrder: DEFAULT_MEMBERS.filter((m) => m.status === "waiting").map((m) => m.id),

			addMember: (name) => {
				const { members } = get();
				const emoji = EMOJIS[members.length % EMOJIS.length];
				const newId = crypto.randomUUID();
				set((s) => ({
					members: [
						...s.members,
						{
							id: newId,
							name: name.trim(),
							emoji,
							playCount: 0,
							status: "waiting",
							paid: false,
						},
					],
					waitingOrder: [...s.waitingOrder, newId],
				}));
			},

			removeMember: (id) => {
				set((s) => ({
					members: s.members.filter((m) => m.id !== id),
					waitingOrder: s.waitingOrder.filter((wid) => wid !== id),
				}));
			},

			assignToSlot: (courtIndex, slotIndex, memberId) => {
				const { members, courts, waitingOrder } = get();
				const newCourts = courts.map((c) => [...c] as CourtSlots) as [CourtSlots, CourtSlots];
				const oldOccupantId = newCourts[courtIndex][slotIndex];
				newCourts[courtIndex][slotIndex] = memberId;

				let newWaitingOrder = waitingOrder.filter((id) => id !== memberId);
				if (oldOccupantId && !newWaitingOrder.includes(oldOccupantId)) {
					newWaitingOrder = [...newWaitingOrder, oldOccupantId];
				}

				set({
					courts: newCourts,
					waitingOrder: newWaitingOrder,
					members: members.map((m) => {
						if (m.id === memberId) return { ...m, status: "playing" };
						if (oldOccupantId && m.id === oldOccupantId) return { ...m, status: "waiting" };
						return m;
					}),
				});
			},

			removeFromSlot: (courtIndex, slotIndex) => {
				const { members, courts, waitingOrder } = get();
				const memberId = courts[courtIndex][slotIndex];
				if (!memberId) return;
				const newCourts = courts.map((c) => [...c] as CourtSlots) as [CourtSlots, CourtSlots];
				newCourts[courtIndex][slotIndex] = null;
				set({
					courts: newCourts,
					waitingOrder: waitingOrder.includes(memberId)
						? waitingOrder
						: [...waitingOrder, memberId],
					members: members.map((m) => (m.id === memberId ? { ...m, status: "waiting" } : m)),
				});
			},

			autoFillSlots: (courtIndex) => {
				const { members, courts, waitingOrder } = get();
				const waitingById = new Map(
					members.filter((m) => m.status === "waiting").map((m) => [m.id, m])
				);
				const waiting = waitingOrder
					.filter((id) => waitingById.has(id))
					// biome-ignore lint/style/noNonNullAssertion: filtered above
					.map((id) => waitingById.get(id)!)
					.sort((a, b) => a.playCount - b.playCount);

				let waitingIdx = 0;
				const newCourts = courts.map((c) => [...c] as CourtSlots) as [CourtSlots, CourtSlots];
				const newPlayingIds = new Set<string>();

				for (let i = 0; i < 4; i++) {
					if (newCourts[courtIndex][i] === null && waitingIdx < waiting.length) {
						newCourts[courtIndex][i] = waiting[waitingIdx].id;
						newPlayingIds.add(waiting[waitingIdx].id);
						waitingIdx++;
					}
				}

				set({
					courts: newCourts,
					waitingOrder: waitingOrder.filter((id) => !newPlayingIds.has(id)),
					members: members.map((m) => (newPlayingIds.has(m.id) ? { ...m, status: "playing" } : m)),
				});
			},

			finishMatch: (courtIndex) => {
				const { members, courts, waitingOrder } = get();
				const playingIds = courts[courtIndex].filter(Boolean) as string[];
				const newCourts = courts.map((c) => [...c] as CourtSlots) as [CourtSlots, CourtSlots];
				newCourts[courtIndex] = [...EMPTY_COURT] as CourtSlots;
				set({
					courts: newCourts,
					waitingOrder: [...waitingOrder, ...playingIds.filter((id) => !waitingOrder.includes(id))],
					members: members.map((m) =>
						playingIds.includes(m.id) ? { ...m, status: "waiting", playCount: m.playCount + 1 } : m
					),
				});
			},

			moveToRest: (id) => {
				set((s) => ({
					members: s.members.map((m) => (m.id === id ? { ...m, status: "resting" } : m)),
					waitingOrder: s.waitingOrder.filter((wid) => wid !== id),
				}));
			},

			returnFromRest: (id) => {
				set((s) => ({
					members: s.members.map((m) => (m.id === id ? { ...m, status: "waiting" } : m)),
					waitingOrder: s.waitingOrder.includes(id) ? s.waitingOrder : [...s.waitingOrder, id],
				}));
			},

			togglePaid: (id) => {
				set((s) => ({
					members: s.members.map((m) => (m.id === id ? { ...m, paid: !m.paid } : m)),
				}));
			},

			setSessionFee: (fee) => {
				set({ sessionFee: fee });
			},

			reorderWaiting: (ids) => {
				set({ waitingOrder: ids });
			},

			adjustPlayCount: (id, delta) => {
				set((s) => ({
					members: s.members.map((m) =>
						m.id === id ? { ...m, playCount: Math.max(0, m.playCount + delta) } : m
					),
				}));
			},

			clearCourt: (courtIndex) => {
				const { members, courts, waitingOrder } = get();
				const playerIds = courts[courtIndex].filter(Boolean) as string[];
				const newCourts = courts.map((c) => [...c] as CourtSlots) as [CourtSlots, CourtSlots];
				newCourts[courtIndex] = [...EMPTY_COURT] as CourtSlots;
				set({
					courts: newCourts,
					waitingOrder: [...waitingOrder, ...playerIds.filter((id) => !waitingOrder.includes(id))],
					members: members.map((m) =>
						playerIds.includes(m.id) ? { ...m, status: "waiting" } : m
					),
				});
			},

			resetAll: () => {
				set({
					members: DEFAULT_MEMBERS,
					sessionFee: 200,
					courts: [[...EMPTY_COURT] as CourtSlots, [...EMPTY_COURT] as CourtSlots],
					waitingOrder: DEFAULT_MEMBERS.filter((m) => m.status === "waiting").map((m) => m.id),
				});
			},
		}),
		{ name: "badminton-store-v5" }
	)
);
