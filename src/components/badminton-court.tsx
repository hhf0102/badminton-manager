"use client";

import { useId } from "react";
import type { Member } from "@/store/badminton-store";

// Portrait court: net horizontal, team A top, team B bottom
// viewBox 0 20 400 400; court x=60 y=30 w=280 h=360; net zone compressed (non-proportional)
const C = { x: 60, y: 30, w: 280, h: 360 } as const;
const NET_Y = C.y + C.h / 2; // 210
const CENTER_X = C.x + C.w / 2; // 200

const SSL = 55; // short service line: compressed
const LSL = 20; // long service line: compressed
const TOP_SSL = NET_Y - SSL; // 155
const BOT_SSL = NET_Y + SSL; // 265
const TOP_LSL = C.y + LSL; // 50
const BOT_LSL = C.y + C.h - LSL; // 370
const SGL_OFFSET = 21; // singles sideline: 0.46m from edge
const LEFT_SGL = C.x + SGL_OFFSET; // 81
const RIGHT_SGL = C.x + C.w - SGL_OFFSET; // 319

const SLOTS = [
	{ x: Math.round((LEFT_SGL + CENTER_X) / 2), y: Math.round((TOP_LSL + TOP_SSL) / 2) }, // A-left  (140, 102)
	{ x: Math.round((CENTER_X + RIGHT_SGL) / 2), y: Math.round((TOP_LSL + TOP_SSL) / 2) }, // A-right (259, 102)
	{ x: Math.round((LEFT_SGL + CENTER_X) / 2), y: Math.round((BOT_SSL + BOT_LSL) / 2) }, // B-left  (140, 317)
	{ x: Math.round((CENTER_X + RIGHT_SGL) / 2), y: Math.round((BOT_SSL + BOT_LSL) / 2) }, // B-right (259, 317)
] as const;

interface BadmintonCourtProps {
	players: (Member | undefined)[];
	onSlotClick?: (index: number) => void;
	onRemovePlayer?: (index: number) => void;
}

function PlayerSlot({
	x,
	y,
	player,
	index,
	onRemove,
}: {
	x: number;
	y: number;
	player?: Member;
	index: number;
	onRemove?: () => void;
}) {
	const teamColors = ["#F59E0B", "#3B82F6"] as const;
	const teamColor = index < 2 ? teamColors[0] : teamColors[1];

	if (!player) {
		return (
			<g>
				<circle
					cx={x}
					cy={y}
					r={30}
					fill="rgba(255,255,255,0.12)"
					stroke="rgba(255,255,255,0.45)"
					strokeWidth="2"
					strokeDasharray="6 4"
				/>
				<text
					x={x}
					y={y + 5}
					textAnchor="middle"
					fill="rgba(255,255,255,0.5)"
					fontSize="20"
					fontFamily="system-ui"
				>
					+
				</text>
				<text
					x={x}
					y={y + 48}
					textAnchor="middle"
					fill="rgba(255,255,255,0.4)"
					fontSize="10"
					fontFamily="system-ui"
					fontWeight="500"
				>
					空位
				</text>
			</g>
		);
	}

	return (
		<g>
			{/* Glow */}
			<circle cx={x} cy={y} r={36} fill={teamColor} opacity={0.25} />
			{/* Main circle */}
			<circle
				cx={x}
				cy={y}
				r={30}
				fill="rgba(255,255,255,0.92)"
				stroke={teamColor}
				strokeWidth="3"
			/>
			{/* Emoji */}
			<text
				x={x}
				y={y + 10}
				textAnchor="middle"
				fontSize="26"
				fontFamily="Apple Color Emoji, Segoe UI Emoji, sans-serif"
			>
				{player.emoji}
			</text>
			{/* Remove badge */}
			<g
				role="button"
				tabIndex={0}
				onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
				onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onRemove?.(); } }}
				style={{ cursor: onRemove ? "pointer" : "default" }}
			>
				<circle cx={x + 22} cy={y - 20} r={11} fill="#EF4444" stroke="white" strokeWidth="2" />
				<text
					x={x + 22}
					y={y - 15}
					textAnchor="middle"
					fill="white"
					fontSize="14"
					fontFamily="system-ui"
					fontWeight="700"
				>
					×
				</text>
			</g>
			{/* Name label */}
			<text
				x={x}
				y={y + 48}
				textAnchor="middle"
				fontFamily="system-ui"
				fontSize="11"
				fontWeight="700"
				stroke="#1a5c35"
				strokeWidth="3"
				paintOrder="stroke"
				fill="white"
			>
				{player.name}
			</text>
		</g>
	);
}

export function BadmintonCourt({ players, onSlotClick, onRemovePlayer }: BadmintonCourtProps) {
	const uid = useId();
	const meshId = `net-mesh-${uid}`;
	const shadowId = `court-shadow-${uid}`;

	return (
		<svg
			viewBox="0 20 400 400"
			xmlns="http://www.w3.org/2000/svg"
			className="w-full drop-shadow-xl"
			aria-label="羽球場地"
		>
			<defs>
				<pattern id={meshId} width="7" height="7" patternUnits="userSpaceOnUse">
					<path d="M 0 0 L 7 7 M 7 0 L 0 7" stroke="#2a2a2a" strokeWidth="0.7" fill="none" />
				</pattern>
				<filter id={shadowId} x="-5%" y="-5%" width="110%" height="110%">
					<feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.3" />
				</filter>
			</defs>

			{/* ── Court surface ──────────────────────────────────────── */}
			<rect
				x={C.x}
				y={C.y}
				width={C.w}
				height={C.h}
				fill="#2E8B57"
				rx={6}
				filter={`url(#${shadowId})`}
			/>

			{/* ── White court markings ───────────────────────────────── */}

			{/* Outer boundary */}
			<rect
				x={C.x}
				y={C.y}
				width={C.w}
				height={C.h}
				fill="none"
				stroke="white"
				strokeWidth={3}
				rx={6}
			/>

			{/* Singles sidelines (vertical, full height) */}
			<line x1={LEFT_SGL} y1={C.y} x2={LEFT_SGL} y2={C.y + C.h} stroke="white" strokeWidth={2} />
			<line x1={RIGHT_SGL} y1={C.y} x2={RIGHT_SGL} y2={C.y + C.h} stroke="white" strokeWidth={2} />

			{/* Long service lines (horizontal, near top/bottom back) */}
			<line x1={C.x} y1={TOP_LSL} x2={C.x + C.w} y2={TOP_LSL} stroke="white" strokeWidth={2} />
			<line x1={C.x} y1={BOT_LSL} x2={C.x + C.w} y2={BOT_LSL} stroke="white" strokeWidth={2} />

			{/* Short service lines (horizontal, near net) */}
			<line x1={C.x} y1={TOP_SSL} x2={C.x + C.w} y2={TOP_SSL} stroke="white" strokeWidth={2} />
			<line x1={C.x} y1={BOT_SSL} x2={C.x + C.w} y2={BOT_SSL} stroke="white" strokeWidth={2} />

			{/* Center service lines (vertical, from back to short service line each side) */}
			<line x1={CENTER_X} y1={C.y} x2={CENTER_X} y2={TOP_SSL} stroke="white" strokeWidth={2} />
			<line
				x1={CENTER_X}
				y1={BOT_SSL}
				x2={CENTER_X}
				y2={C.y + C.h}
				stroke="white"
				strokeWidth={2}
			/>

			{/* ── Net ───────────────────────────────────────────────── */}

			{/* Net posts (left & right, extending beyond court) */}
			<rect x={C.x - 12} y={NET_Y - 3} width={12} height={6} fill="#555" rx={3} />
			<rect x={C.x + C.w} y={NET_Y - 3} width={12} height={6} fill="#555" rx={3} />
			<circle cx={C.x - 12} cy={NET_Y} r={5} fill="#444" />
			<circle cx={C.x + C.w + 12} cy={NET_Y} r={5} fill="#444" />

			{/* Net mesh body */}
			<rect
				x={C.x}
				y={NET_Y - 6}
				width={C.w}
				height={12}
				fill={`url(#${meshId})`}
				stroke="#222"
				strokeWidth={1.5}
			/>

			{/* Net tape (white band) */}
			<rect
				x={C.x - 2}
				y={NET_Y - 4}
				width={C.w + 4}
				height={8}
				fill="white"
				stroke="#ddd"
				strokeWidth={1}
				rx={3}
			/>

			{/* ── Player slots ──────────────────────────────────────── */}
			{SLOTS.map((pos, i) => (
				<g
					key={i}
					role="button"
					tabIndex={0}
					onClick={() => onSlotClick?.(i)}
					onKeyDown={(e) => e.key === "Enter" && onSlotClick?.(i)}
					style={{ cursor: onSlotClick ? "pointer" : "default" }}
				>
					<PlayerSlot x={pos.x} y={pos.y} player={players[i]} index={i} onRemove={players[i] ? () => onRemovePlayer?.(i) : undefined} />
				</g>
			))}
		</svg>
	);
}
