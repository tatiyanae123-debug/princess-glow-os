# Glow OS — Biggest Upgrade Final Architecture

Date: 2026-08-14
Branch: `codex/glow-os-biggest-upgrade-final`

This document locks the uploaded batch boards as the current master product architecture and visual reference system for Glow OS.

## Product rule

Glow OS is one connected personal operating system, not a collection of independent trackers.

Information should be created once in its source system and then surfaced in every relevant view. A calendar event can appear in Home, Briefings, Beauty, Work, Timeline, Notices, or another room without becoming a duplicate record.

## Core hierarchy

### 1. Today + Planning
- Home / Command Center
- Today
- Morning Brief
- Evening Debrief
- Planning
- Calendar
- Tasks
- Reminders
- Routines
- Habits
- Timeline
- Goals

Home summarizes. Source rooms manage the underlying information.

### 2. Mind
- Brain
- Concierge
- Memory
- Observations
- Graph
- Notes
- Knowledge
- Briefings

Memory stores context. Timeline stores sequence. Graph stores relationships. Observations surfaces patterns. Brain interprets. Concierge turns intent into proposed action.

### 3. Wellness
- Wellness
- Fitness
- Food & Nutrition
- Medications & Supplements
- Sleep
- Symptoms & Recovery
- Workout Studio

These are multiple views of one wellness system rather than isolated trackers.

### 4. Beauty
- Beauty OS
- Beauty Lab
- Hair Studio
- Skincare / Makeup child views
- Closet
- beauty-linked appointments and routines

Beauty OS is the hub. Beauty Lab explains products and reactions. Hair Studio manages the hair lifecycle. Closet manages style and wardrobe context.

### 5. Money + Goals
- Financial Brain
- Financial Overview
- Spending
- Subscriptions
- Forecast
- Purchases & Transactions
- Goals

Transactions are source data. Spending, subscriptions, overview, forecast and Financial Brain are derived views of the same financial system.

### 6. Work + Create
- Career & Work
- Applications
- Interviews
- Interview Prep
- Projects
- Creative Studio

An opportunity or project should move through multiple views without manual duplicate entry.

### 7. Home + World
- Home
- All Rooms
- Life World
- Travel
- Closet and room-linked life areas

All Rooms is the fast directory. Life World is the immersive spatial overview. Home manages the physical home domain.

### 8. Tools + Modes
- Command Surface
- Add Anything
- Deep Focus
- Workout Studio
- Interview Prep
- Ambient mode

Modes temporarily change the interaction model. They do not create parallel databases.

### 9. System + Integrations
- Gmail
- Import
- Connections
- Notices
- Settings / System Overview

Integrations supply real data. Notices surface actionable changes. Import routes existing information into source systems.

## Navigation contract

The reference sidebar is organized in this order:

1. Today
2. Life
3. Mind
4. Wellness
5. Beauty
6. Money
7. Work + Create
8. Home + World
9. Tools + System

`All Rooms` remains the complete index for every route.

## Visual system

The uploaded boards establish the visual direction:

- warm white / ivory surfaces
- editorial serif display typography
- clean small sans-serif UI copy
- muted rose primary accent
- sage, plum, sand, lavender and warm neutrals by domain
- thin borders rather than heavy shadows
- rounded cards
- lifestyle/editorial imagery rather than generic dashboard art
- compact information density on desktop
- calmer stacking on iPad and iPhone
- no dark interface by default
- deeper special-mode screens may use darker cinematic sections when appropriate

## Interaction contract

Every important card must do at least one of these:
- open its source object
- create or update real data
- navigate to the relevant source room
- start a mode
- surface an explainable Glow insight

Decorative controls that appear interactive but do nothing are not acceptable.

## Data contract

- Keep Neon PostgreSQL + Drizzle as the application database.
- Keep Auth.js as the authentication system.
- Keep Next.js App Router + React + TypeScript + Tailwind.
- Do not introduce a second auth system or replacement database.
- Preserve user data when redesigning pages.
- Avoid fake history, fake connected-account state or invented health/financial status.
- Empty states should say what is missing and how to add or connect it.

## Route compatibility

The final branch includes compatibility aliases for reference-board screens that are views or modes of existing source systems, including:

- `/medications` -> Maintenance / medication system
- `/sleep` -> Wellness sleep view
- `/symptoms` -> Wellness symptom/recovery view
- `/spending` -> Finance spending view
- `/subscriptions` -> Finance subscriptions view
- `/forecast` -> Finance forecast view
- `/transactions` -> Finance transaction view
- `/applications` -> Work application view
- `/interviews` -> Work interview view
- `/interview-prep` -> Work interview-prep mode
- `/workout-studio` -> Fitness workout mode
- `/travel` -> Life World travel view
- `/command` -> Search / command surface
- `/add-anything` -> Universal Intake
- `/system-overview` -> Settings system view

This keeps one source of truth while allowing the reference screens to exist as distinct destinations.

## Completion definition

The upgrade is considered complete when:

1. the latest branch builds successfully,
2. the full navigation is present,
3. the reference aliases resolve,
4. no existing V3 data system is replaced,
5. Home remains the fast daily command center,
6. All Rooms exposes the complete structure,
7. the same object can be surfaced across multiple rooms,
8. iPhone/iPad navigation remains usable,
9. focus/special modes do not duplicate data,
10. a Vercel preview is available for final visual QA.
