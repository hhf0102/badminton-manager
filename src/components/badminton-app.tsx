"use client";

import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { BadmintonCourt } from "@/components/badminton-court";
import type { Member } from "@/store/badminton-store";
import { useBadmintonStore } from "@/store/badminton-store";
import { toast } from "sonner";

// ── Member Card ────────────────────────────────────────────────────────────────
function MemberCard({
	member,
	rank,
	highlight,
	actions,
}: {
	member: Member;
	rank?: number;
	highlight?: boolean;
	actions?: React.ReactNode;
}) {
	return (
		<div
			className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 shadow-sm ${
				highlight
					? "bg-yellow-400/12 border border-yellow-400/35"
					: "bg-white/15 border border-white/25"
			}`}
		>
			{rank !== undefined && (
				<span
					className={`text-xs font-black w-4 text-center shrink-0 ${highlight ? "text-yellow-300/80" : "text-white/40"}`}
				>
					{rank + 1}
				</span>
			)}
			<span className="text-2xl shrink-0">{member.emoji}</span>
			<div className="flex-1 min-w-0">
				<div className="font-black text-sm text-white leading-tight truncate">{member.name}</div>
				<div className="text-xs text-white/55">🏸 {member.playCount} 場</div>
			</div>
			{actions}
		</div>
	);
}

// ── Waiting Card ───────────────────────────────────────────────────────────────
function WaitingCard({
	member,
	rank,
	isInNextMatch,
	nextMatchFull,
	onMoveToSubstitute,
	onMoveToNextMatch,
	onMoveToRest,
	onRemove,
}: {
	member: Member;
	rank: number;
	isInNextMatch: boolean;
	nextMatchFull: boolean;
	onMoveToSubstitute: () => void;
	onMoveToNextMatch: () => void;
	onMoveToRest: () => void;
	onRemove: () => void;
}) {
	return (
		<MemberCard
			member={member}
			rank={rank}
			highlight={isInNextMatch}
			actions={
				<div className="flex gap-1.5 shrink-0">
					{isInNextMatch ? (
						<button
							type="button"
							onClick={onMoveToSubstitute}
							className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white/60 border border-white/20 transition-colors"
						>
							候補
						</button>
					) : !nextMatchFull ? (
						<button
							type="button"
							onClick={onMoveToNextMatch}
							className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-yellow-500/40 hover:bg-yellow-500/60 text-yellow-200 border border-yellow-400/30 transition-colors"
						>
							下一場
						</button>
					) : null}
					<button
						type="button"
						onClick={onMoveToRest}
						className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-purple-500/40 hover:bg-purple-500/60 text-purple-200 border border-purple-400/30 transition-colors"
					>
						休息
					</button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<button
								type="button"
								className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-red-500/40 hover:bg-red-500/60 text-red-200 border border-red-400/30 transition-colors"
							>
								✕
							</button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>移除成員</AlertDialogTitle>
								<AlertDialogDescription>
									確定要移除 {member.emoji} {member.name}？
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>取消</AlertDialogCancel>
								<AlertDialogAction onClick={onRemove}>移除</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			}
		/>
	);
}

// ── Section Panel ──────────────────────────────────────────────────────────────
function Panel({
	emoji,
	title,
	count,
	headerClass,
	children,
}: {
	emoji: string;
	title: string;
	count: number;
	headerClass: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-3xl overflow-hidden shadow-lg border border-white/15">
			<div className={`flex items-center gap-2 px-4 py-3 ${headerClass}`}>
				<span className="text-xl">{emoji}</span>
				<h2 className="font-black text-base text-white tracking-wide">{title}</h2>
				<span className="ml-auto text-xs font-bold bg-black/20 text-white/90 rounded-full px-2.5 py-0.5">
					{count}
				</span>
			</div>
			<div className="bg-white/8 backdrop-blur-sm p-3 space-y-2">{children}</div>
		</section>
	);
}

function EmptyHint({ text }: { text: string }) {
	return <p className="text-center text-white/35 text-xs py-4 font-medium">{text}</p>;
}

// ── Payment Dialog ─────────────────────────────────────────────────────────────
function PaymentDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
}) {
	const { members, sessionFee, setSessionFee, togglePaid } = useBadmintonStore();
	const [feeInput, setFeeInput] = useState(String(sessionFee));

	const paidCount = members.filter((m) => m.paid).length;
	const unpaidCount = members.length - paidCount;

	function handleFeeBlur() {
		const n = Number(feeInput);
		if (!Number.isNaN(n) && n > 0) setSessionFee(n);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-0 bg-transparent shadow-none p-0 max-w-sm w-full gap-0 overflow-hidden rounded-3xl">
				<div
					className="relative px-6 pt-5 pb-6 text-center"
					style={{
						background: "linear-gradient(160deg, #16a34a 0%, #15803d 50%, #166534 100%)",
					}}
				>
					<DialogHeader className="sr-only">
						<DialogTitle>費用收款</DialogTitle>
						<DialogDescription>管理成員費用繳納狀況</DialogDescription>
					</DialogHeader>
					<div className="w-16 h-16 mx-auto mb-3 mt-1 rounded-full bg-yellow-400 border-4 border-yellow-200 shadow-lg flex items-center justify-center text-3xl">
						💰
					</div>
					<h2 className="text-xl font-black text-white tracking-wide drop-shadow">費用收款</h2>
					<p className="text-sm text-emerald-200 mt-0.5">共 {members.length} 位成員</p>
					<div className="mt-4 flex items-center justify-center gap-3">
						<span className="text-sm font-bold text-emerald-100">每人費用</span>
						<div className="flex items-center gap-1 bg-white/20 rounded-2xl px-3 py-1.5 border border-white/30">
							<span className="text-emerald-200 font-bold">$</span>
							<input
								className="w-16 text-center font-black text-white bg-transparent text-base outline-none"
								value={feeInput}
								onChange={(e) => setFeeInput(e.target.value)}
								onBlur={handleFeeBlur}
								inputMode="numeric"
							/>
						</div>
						<span className="text-xs font-bold bg-red-500/80 text-white rounded-full px-2.5 py-1">
							未付 {unpaidCount} 人
						</span>
					</div>
				</div>
				<div className="bg-[#0f2417] max-h-80 overflow-y-auto divide-y divide-white/8">
					{members.map((m) => (
						<button
							key={m.id}
							type="button"
							onClick={() => togglePaid(m.id)}
							className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 active:bg-white/10 transition-colors"
						>
							<div
								className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl border-2 shrink-0 ${
									m.paid ? "border-emerald-400 bg-emerald-900/50" : "border-white/20 bg-white/10"
								}`}
							>
								{m.emoji}
							</div>
							<div className="flex-1 text-left">
								<div className="font-black text-sm text-white">{m.name}</div>
								<div className="text-xs text-white/40">🏸 {m.playCount} 場</div>
							</div>
							<div
								className={`text-xs font-black px-3 py-1.5 rounded-2xl border-2 ${
									m.paid
										? "bg-emerald-500 border-emerald-300 text-white"
										: "bg-red-500/80 border-red-400 text-white"
								}`}
							>
								{m.paid ? "✅ 已付" : `💸 $${sessionFee}`}
							</div>
						</button>
					))}
				</div>
				<div className="bg-[#0a1c10] px-5 pt-4 pb-6 space-y-3">
					<div className="flex justify-between items-center rounded-2xl bg-white/8 border border-white/12 px-4 py-3">
						<div>
							<div className="text-xs text-white/50 font-medium">已收款</div>
							<div className="text-lg font-black text-emerald-400">${paidCount * sessionFee}</div>
						</div>
						<div className="text-right">
							<div className="text-xs text-white/50 font-medium">待收款</div>
							<div className="text-lg font-black text-red-400">${unpaidCount * sessionFee}</div>
						</div>
						<div className="text-right">
							<div className="text-xs text-white/50 font-medium">總金額</div>
							<div className="text-lg font-black text-white">${members.length * sessionFee}</div>
						</div>
					</div>
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="w-full py-3.5 rounded-2xl font-black text-base text-white shadow-lg"
						style={{
							background: "linear-gradient(160deg, #374151, #1f2937)",
							border: "2px solid rgba(255,255,255,0.15)",
						}}
					>
						關閉
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ── Slot Assign Dialog ─────────────────────────────────────────────────────────
function SlotAssignDrawer({
	open,
	courtIndex,
	slotIndex,
	waitingMembers,
	onAssign,
	onClose,
}: {
	open: boolean;
	courtIndex: number;
	slotIndex: number;
	waitingMembers: Member[];
	onAssign: (memberId: string) => void;
	onClose: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="border-0 bg-transparent shadow-none p-0 max-w-sm w-full gap-0 overflow-hidden rounded-3xl">
				<div style={{ background: "linear-gradient(160deg, #16a34a 0%, #166534 100%)" }}>
					<DialogHeader className="text-center px-6 pt-5 pb-4">
						<DialogTitle className="text-lg font-black text-white">選擇上場球友</DialogTitle>
						<DialogDescription className="text-sm text-emerald-200">
							場地 {courtIndex + 1} · 位置 {slotIndex + 1}
						</DialogDescription>
					</DialogHeader>
				</div>
				<div className="bg-[#0f2417] max-h-72 overflow-y-auto divide-y divide-white/8">
					{waitingMembers.length === 0 ? (
						<p className="text-center text-white/40 py-8 text-sm">沒有等候中的球友</p>
					) : (
						waitingMembers.map((m) => (
							<div
								key={m.id}
								className="w-full flex items-center gap-3 px-5 py-3.5"
							>
								<div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl border-2 border-white/20 bg-white/10 shrink-0">
									{m.emoji}
								</div>
								<div className="flex-1 text-left">
									<div className="font-black text-sm text-white">{m.name}</div>
									<div className="text-xs text-white/40">🏸 {m.playCount} 場</div>
								</div>
								<button
									type="button"
									onClick={() => {
										onAssign(m.id);
										onClose();
									}}
									className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/40 hover:bg-emerald-500/60 text-emerald-200 border border-emerald-400/30 transition-colors shrink-0"
								>
									上場
								</button>
							</div>
						))
					)}
				</div>
				<div className="bg-[#0a1c10] px-5 py-4">
					<button
						type="button"
						onClick={onClose}
						className="w-full py-3.5 rounded-2xl font-black text-base text-white shadow-lg"
						style={{
							background: "linear-gradient(160deg, #374151, #1f2937)",
							border: "2px solid rgba(255,255,255,0.15)",
						}}
					>
						取消
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ── Add Member Bar ─────────────────────────────────────────────────────────────
function AddMemberBar() {
	const { addMember, members } = useBadmintonStore();
	const [name, setName] = useState("");

	function handleAdd() {
		const names = name
			.split("\n")
			.map((n) => n.trim())
			.filter(Boolean);
		if (!names.length) return;

		const existing = new Set(members.map((m) => m.name));
		const duplicates = names.filter((n) => existing.has(n));
		if (duplicates.length) {
			toast.warning(`已有同名球友：${duplicates.join("、")}`);
			return;
		}
		for (const n of names) addMember(n);
		setName("");
	}

	return (
		<div className="flex gap-2">
			<textarea
				rows={1}
				value={name}
				onChange={(e) => setName(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						handleAdd();
					}
				}}
				placeholder={"新增成員名稱…\n(多行 = 批次新增)"}
				className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 text-white placeholder:text-white/35 text-sm outline-none focus:bg-white/15 focus:border-white/35 transition-colors resize-none min-h-[44px] field-sizing-content"
			/>
			<button
				type="button"
				onClick={handleAdd}
				className="w-11 h-11 flex items-center justify-center rounded-2xl font-black text-lg text-white shadow-md self-end"
				style={{ background: "linear-gradient(160deg, #22c55e, #16a34a)" }}
			>
				+
			</button>
		</div>
	);
}

// ── Court Card ─────────────────────────────────────────────────────────────────
function CourtCard({
	courtIndex,
	players,
	isCourtPlaying,
	onSlotClick,
	onRemovePlayer,
	onFinish,
	onClear,
}: {
	courtIndex: number;
	players: (Member | undefined)[];
	isCourtPlaying: boolean;
	onSlotClick: (slotIndex: number) => void;
	onRemovePlayer: (slotIndex: number) => void;
	onFinish: () => void;
	onClear: () => void;
}) {
	return (
		<div
			className="rounded-3xl p-2.5 pb-3 shadow-2xl flex-1 flex flex-col gap-2"
			style={{
				background: "rgba(255,255,255,0.06)",
				border: "1px solid rgba(255,255,255,0.12)",
			}}
		>
			<div className="text-center text-xs font-black text-white/50 pt-0.5">
				場地 {courtIndex + 1}
			</div>
			<BadmintonCourt players={players} onSlotClick={onSlotClick} onRemovePlayer={onRemovePlayer} />
			{isCourtPlaying && (
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onFinish}
						className="flex-1 py-2.5 rounded-2xl font-black text-sm text-white shadow-lg"
						style={{
							background: "linear-gradient(160deg, #f97316, #dc2626)",
							border: "2px solid #ef4444",
						}}
					>
						🏆 結束
					</button>
					<button
						type="button"
						onClick={onClear}
						className="flex-1 py-2.5 rounded-2xl font-black text-sm text-white/70 shadow-sm"
						style={{
							background: "rgba(255,255,255,0.08)",
							border: "1px solid rgba(255,255,255,0.15)",
						}}
					>
						🗑️ 清除
					</button>
				</div>
			)}
		</div>
	);
}

// ── Main App ───────────────────────────────────────────────────────────────────
export function BadmintonApp() {
	const {
		members,
		courts,
		waitingOrder,
		reorderWaiting,
		autoFillSlots,
		finishMatch,
		assignToSlot,
		removeFromSlot,
		moveToRest,
		returnFromRest,
		removeMember,
		clearCourt,
	} = useBadmintonStore();
	const [showPayment, setShowPayment] = useState(false);
	const [selectedSlot, setSelectedSlot] = useState<{
		courtIndex: number;
		slotIndex: number;
	} | null>(null);

	// Dynamic boundary: how many members are in the "下一場" section
	const [nextMatchBoundary, setNextMatchBoundary] = useState(0);

	const waitingById = new Map(members.filter((m) => m.status === "waiting").map((m) => [m.id, m]));
	const waiting = waitingOrder
		.filter((id) => waitingById.has(id))
		// biome-ignore lint/style/noNonNullAssertion: filtered above
		.map((id) => waitingById.get(id)!);
	const playing = members.filter((m) => m.status === "playing");
	const resting = members.filter((m) => m.status === "resting");

	// Clamp boundary to valid range
	const effectiveBoundary = Math.min(nextMatchBoundary, waiting.length);

	const courtPlayers = courts.map((slots) =>
		slots.map((id) => (id ? members.find((m) => m.id === id) : undefined))
	);
	const isCourtPlaying = courts.map((slots) => slots.some((id) => id !== null));
	const canAutoFill = courts.map((slots) => slots.some((id) => id === null) && waiting.length > 0);

	function handleSlotClick(courtIndex: number, slotIndex: number) {
		if (courts[courtIndex][slotIndex]) {
			removeFromSlot(courtIndex, slotIndex); // returns to end (候補), boundary unchanged
		} else {
			setSelectedSlot({ courtIndex, slotIndex });
		}
	}

	function handleAssign(memberId: string) {
		if (!selectedSlot) return;
		const rank = waiting.findIndex((m) => m.id === memberId);
		const eb = Math.min(nextMatchBoundary, waiting.length);
		if (rank >= 0 && rank < eb) setNextMatchBoundary(Math.max(0, eb - 1));
		assignToSlot(selectedSlot.courtIndex, selectedSlot.slotIndex, memberId);
		setSelectedSlot(null);
	}


	function handleFinishAndFill(courtIndex: number) {
		finishMatch(courtIndex);
		autoFillSlots(courtIndex);
		// Sort remaining waiting by playCount and auto-populate 下一場
		const { waitingOrder: wo, members: ms } = useBadmintonStore.getState();
		const wMap = new Map(ms.filter((m) => m.status === "waiting").map((m) => [m.id, m]));
		// biome-ignore lint/style/noNonNullAssertion: filtered above
		const sorted = wo
			.filter((id) => wMap.has(id))
			// biome-ignore lint/style/noNonNullAssertion: filtered above
			.sort((a, b) => wMap.get(a)!.playCount - wMap.get(b)!.playCount);
		reorderWaiting(sorted);
		setNextMatchBoundary(Math.min(4, sorted.length));
	}

	// Move a 下一場 member to 候補 (append to end, shrink boundary)
	function moveToSubstitute(id: string) {
		const eb = Math.min(nextMatchBoundary, waiting.length);
		const newOrder = waiting.filter((m) => m.id !== id).map((m) => m.id);
		reorderWaiting([...newOrder, id]);
		setNextMatchBoundary(Math.max(0, eb - 1));
	}

	// Auto-fill 下一場: sort all waiting by playCount asc, set boundary to min(4, len)
	function autoFillNextMatch() {
		const sorted = [...waiting].sort((a, b) => a.playCount - b.playCount);
		reorderWaiting(sorted.map((m) => m.id));
		setNextMatchBoundary(Math.min(4, sorted.length));
	}

	// Move a 候補 member to end of 下一場 (no displacement, expand boundary)
	function moveToNextMatch(id: string) {
		const eb = Math.min(nextMatchBoundary, waiting.length);
		const newOrder = waiting.filter((m) => m.id !== id).map((m) => m.id);
		newOrder.splice(eb, 0, id);
		reorderWaiting(newOrder);
		setNextMatchBoundary(eb + 1);
	}

	function handleMoveToRest(id: string) {
		const rank = waiting.findIndex((m) => m.id === id);
		const eb = Math.min(nextMatchBoundary, waiting.length);
		if (rank >= 0 && rank < eb) setNextMatchBoundary(Math.max(0, eb - 1));
		moveToRest(id);
	}

	function handleRemoveMember(id: string) {
		const rank = waiting.findIndex((m) => m.id === id);
		const eb = Math.min(nextMatchBoundary, waiting.length);
		if (rank >= 0 && rank < eb) setNextMatchBoundary(Math.max(0, eb - 1));
		removeMember(id);
	}

	return (
		<div
			className="min-h-screen"
			style={{ background: "linear-gradient(180deg, #0f4c29 0%, #052210 100%)" }}
		>
			{/* ── Header ──────────────────────────────────────────────────────── */}
			<header className="flex items-center justify-between px-4 pt-5 pb-3">
				<div>
					<h1 className="text-xl font-black text-white tracking-wide">🏸 羽球場管理</h1>
					<p className="text-xs text-emerald-300/70 mt-0.5">
						{members.length} 位成員 · {playing.length > 0 ? "比賽進行中" : "等待開始"}
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowPayment(true)}
					className="flex items-center gap-1.5 font-black text-sm px-4 py-2.5 rounded-2xl shadow-lg"
					style={{
						background: "linear-gradient(160deg, #fbbf24, #d97706)",
						color: "#78350f",
					}}
				>
					💰 收款
				</button>
			</header>

			{/* ── Courts ───────────────────────────────────────────────────────── */}
			<div className="px-4 pb-3 flex gap-3">
				{([0, 1] as const).map((i) => (
					<CourtCard
						key={i}
						courtIndex={i}
						players={courtPlayers[i]}
						isCourtPlaying={isCourtPlaying[i]}
						onSlotClick={(slotIndex) => handleSlotClick(i, slotIndex)}
						onRemovePlayer={(slotIndex) => removeFromSlot(i, slotIndex)}
						onFinish={() => handleFinishAndFill(i)}
						onClear={() => clearCourt(i)}
					/>
				))}
			</div>

			{/* ── Fallback hint ─────────────────────────────────────────────────── */}
			{!canAutoFill[0] && !canAutoFill[1] && !isCourtPlaying[0] && !isCourtPlaying[1] && (
				<div className="px-4 pb-4">
					<div className="py-3.5 rounded-2xl border-2 border-dashed border-white/20 text-center text-white/35 text-sm font-medium">
						至少需要 2 人才能開始
					</div>
				</div>
			)}

			{/* ── Three Panels ────────────────────────────────────────────────── */}
			<div className="px-4 pb-8 space-y-3">
				{/* [等候名單] */}
				<Panel
					emoji="⏳"
					title="等候名單"
					count={waiting.length}
					headerClass="bg-gradient-to-r from-blue-600 to-sky-600"
				>
					{waiting.length === 0 ? (
						<EmptyHint text="沒有等候中的成員" />
					) : (
						<>
							<div className="flex items-center gap-2 px-1 pb-0.5">
								<span className="text-xs font-black text-yellow-300">🎯 下一場</span>
								<div className="flex-1 h-px bg-yellow-400/30" />
								{effectiveBoundary < 4 && waiting.length > effectiveBoundary && (
									<button
										type="button"
										onClick={autoFillNextMatch}
										className="text-xs font-bold px-2.5 py-1 rounded-xl bg-yellow-500/40 hover:bg-yellow-500/60 text-yellow-200 border border-yellow-400/30 transition-colors shrink-0"
									>
										自動排場
									</button>
								)}
							</div>
							{waiting.map((m, idx) => (
								<div key={m.id}>
									{idx === effectiveBoundary && (
										<div className="flex items-center gap-2 px-1 pt-1 pb-0.5">
											<span className="text-xs font-black text-white/35">🪑 候補</span>
											<div className="flex-1 h-px bg-white/15" />
										</div>
									)}
									<WaitingCard
										member={m}
										rank={idx}
										isInNextMatch={idx < effectiveBoundary}
										nextMatchFull={effectiveBoundary >= 4}
										onMoveToSubstitute={() => moveToSubstitute(m.id)}
										onMoveToNextMatch={() => moveToNextMatch(m.id)}
										onMoveToRest={() => handleMoveToRest(m.id)}
										onRemove={() => handleRemoveMember(m.id)}
									/>
								</div>
							))}
						</>
					)}
				</Panel>

				{/* [休息區] */}
				<Panel
					emoji="☕"
					title="休息區"
					count={resting.length}
					headerClass="bg-gradient-to-r from-purple-600 to-violet-600"
				>
					{resting.length === 0 ? (
						<EmptyHint text="沒有休息中的成員" />
					) : (
						resting.map((m) => (
							<MemberCard
								key={m.id}
								member={m}
								actions={
									<button
										type="button"
										onClick={() => returnFromRest(m.id)}
										className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-blue-500/40 hover:bg-blue-500/60 text-blue-200 border border-blue-400/30 transition-colors shrink-0"
									>
										回候場
									</button>
								}
							/>
						))
					)}
				</Panel>

				{/* Add member */}
				<AddMemberBar />
			</div>

			{/* Payment Dialog */}
			<PaymentDialog open={showPayment} onOpenChange={setShowPayment} />

			{/* ── Slot Assign Drawer ───────────────────────────────────────────── */}
			<SlotAssignDrawer
				open={selectedSlot !== null}
				courtIndex={selectedSlot?.courtIndex ?? 0}
				slotIndex={selectedSlot?.slotIndex ?? 0}
				waitingMembers={waiting}
				onAssign={handleAssign}
				onClose={() => setSelectedSlot(null)}
			/>
		</div>
	);
}
