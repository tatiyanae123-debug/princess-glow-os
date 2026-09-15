# Glow OS — Steps 32–35

Before Step 32, Vercel was checked directly. The acceleration branch had repeated ERROR deployments beginning after Step 18. The failing compiler error was traced to `dependency-matrix.ts`: TypeScript widened the ternary priority value to `string`, which was incompatible with `EnginePriority['priority']`. The code now explicitly types the map result and priority value. A new Vercel deployment must pass before this branch is treated as build-safe.

## 32 Shared State Machine Factory
Adds reusable machine/transition contracts, a guided-session machine, universal content states and global energy states. Domain experiences extend registered state behavior instead of cloning it.

## 33 Shared Overlay Factory
Adds one lifecycle for Ask Glow, Quick Add, Peek, Picker, Compare, Inspector, Help, Confirmation and Decision Receipt, including context/session preservation and focus behavior.

## 34 Automatic QA Pipeline
Adds ordered QA stages and promotion gating. Schema/type/build failures block promotion. Golden approval stays separate and mandatory only for master templates/registered visual exceptions.

## 35 First Bulk Migration Wave
Adds the Beauty/Face Skincare Wave 1 manifest covering Atelier Home, Today, Product Library, Product Detail, Routine Library, Guided Skincare, Calendar, Progress and Completion. Each item declares template, shared engine, migration mode and Golden requirement. Old routes are not authorized for retirement until all migration gates pass.
