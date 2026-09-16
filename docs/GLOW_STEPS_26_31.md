# Glow OS — Steps 26–31

## 26 React Template Renderer
`GlowTemplateRenderer.tsx` is the React adapter boundary between resolved Glow experiences and real template components. Routes/domains select registered templates. Missing adapters fail visibly instead of silently rendering dead UI.

## 27 Experience Config Format
`experience-config.ts` adds the compact validated experience configuration contract: title, family, classification, World/Room/template/object/environment, intelligence level, actions, overlays, registered exception and lock identity. Configuration cannot contain arbitrary CSS/layout escape hatches.

## 28 Thin Route Factory
`thin-route-factory.ts` formalizes URL/entry point → experience identity/context → Universal Experience Renderer. Routes should not own duplicated shell/template architecture.

## 29 Environment + Token Engine
`environment-tokens.ts` resolves visual inheritance in order Global → World → Room → Template → Exception. It seeds Global, Beauty and Skincare Atelier tokens and provides token-diff support for propagation/regression targeting.

## 30 Bulk Live-App Classifier
`live-app-classifier.ts` adds conservative KEEP/MIGRATE/MERGE/CONFIGURE/RETIRE/TRUE_EXCEPTION/NEEDS_REVIEW classification. Initial repository evidence confirms many current App Router pages still own their own server-page composition; the classifier intentionally refuses automatic retirement without stronger data/route evidence.

## 31 Bulk Migration Generator
`bulk-migration-generator.ts` converts classifications into migration plans and separates ready work from blocked work. Migration order is preserve canonical data → register → connect shared engine → switch projection → QA → verify history/context → retire obsolete code.

## Current rule
These steps establish the executable migration factory, but they do not falsely claim every existing page has already been converted to a thin route or that all T01–T15 React adapters exist. Bulk migration now has a safe mechanism for doing that work in waves.
