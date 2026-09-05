# Glow OS — Ask Glow Multimodal Conversation + Creation Lock

**Status:** AUTHORITATIVE / PERMANENT
**Date:** 2026-09-05
**Scope:** Ask Glow, Shakti, every current and future conversation surface, quick-ask surface, voice surface, creation surface, upload surface, and any room-local entry into the one centralized Glow intelligence.

## Core law

Ask Glow is not a button menu, command palette disguised as AI, FAQ bot, or text-only chatbot.

Ask Glow is the conversational, multimodal, generative operating layer of Glow OS. The user must be able to give Glow whatever is on their mind through natural typing, speech, pasted material, files, images, video, audio, or existing Glow context. Prompt buttons may suggest possibilities, but they are always optional and disappear into the background once the user begins communicating naturally.

Shakti is the one intelligent presence behind Ask Glow. Shakti is continuous across every Glow world and room. Do not create a second assistant, separate page-specific brain, weaker voice system, or disconnected image generator.

## 1. Free-form conversation is primary

Every Ask Glow surface must provide a real expandable composer that accepts natural language without command syntax.

The user may send:

- one sentence
- multiple paragraphs
- lists
- long notes
- copied research
- journal entries
- messy brain dumps
- project briefs
- self-corrections
- multiple requests in one message
- follow-up messages that use pronouns and references to earlier context

The composer must grow with the message rather than forcing long thoughts into a tiny one-line field.

Buttons are suggestions only. A user must always be able to ignore every suggestion and type or say what actually happened.

## 2. Voice is the same conversation

Voice and text use the same central intelligence and conversation history.

The user may speak naturally for extended periods, pause, continue, self-correct, change topics, refer to previous turns, refer to the current room, and refer to attached material.

Voice must never become a separate command-only assistant.

Required flow:

**listen → transcribe → understand whole meaning → use conversation + room context → respond/create/propose action → preserve continuity**

A voice failure must not erase typed content or conversation state.

## 3. Multimodal input is first-class

Ask Glow must support, where the platform and connected services allow:

### Camera and media
- take photo
- choose one or multiple photos
- record video
- choose one or multiple videos
- screenshots

### Audio
- live voice conversation
- recorded voice notes
- uploaded audio

### Files
- PDF
- text and Markdown
- CSV and JSON
- common Word documents
- spreadsheets
- presentations
- archives when supported
- other useful common formats as support expands

### Glow context
- current room
- selected object
- note
- task
- routine
- person
- place
- product
- goal
- calendar period
- previous conversation
- Brain memory
- existing creation

The user may combine multiple modalities in one request.

## 4. Drag, drop, paste, and capture should just work

On supported devices:

- paste text directly
- paste images and screenshots directly
- paste links
- drag files into Ask Glow on iPad/desktop
- drag Glow objects into Ask Glow when those objects support transfer
- capture a new photo or video from the composer

The system should infer the content type rather than making the user select a workflow first.

## 5. Large-context principle

Do not impose artificially tiny product limits merely because an early implementation used a small request body.

The product principle is:

> Let the user provide as much relevant context as reasonably possible without forcing them to break their thought into tiny pieces.

This does not mean pretending storage, model context, network requests, or provider limits are literally infinite.

When material exceeds one processing window, the correct behavior is to:

1. preserve or persist the source when infrastructure supports it
2. process it in sections or chunks
3. index relevant content when appropriate
4. keep the source connected to the conversation
5. explain truthfully what has and has not been processed
6. continue without requiring the user to manually recreate the whole context

Never silently drop a large attachment. Never claim a file was read when only its metadata was available.

## 6. Ask Glow creates, not only answers

Ask Glow is both an intelligence system and a creation system.

It may produce the output form that best fits the request, including:

- conversational answer
- note
- routine
- checklist
- schedule
- plan
- guide
- email draft
- report
- script
- research summary
- image
- diagram
- moodboard
- collage
- illustration
- routine visual
- room concept
- style board
- product layout
- chart
- printable card
- document
- PDF
- presentation
- spreadsheet
- Glow object

A request for a finished image must create an actual image when the verified image renderer is available. Do not substitute a text description of an image for the image itself.

## 7. Native image generation is part of Ask Glow

Image generation must live inside the same conversation.

Examples:

- “Generate a picture of my Sunday reset routine.”
- “Make this more editorial.”
- “Use Glow Matter.”
- “Make it vertical for my phone.”
- “Remove the flowers.”
- “Make the skincare section larger.”
- “Turn this into a printable routine card.”

The user should not have to leave Ask Glow or learn prompt-engineering syntax.

Generated images appear inline in the conversation. A generated asset should have a truthful functional path for download/export/save when those capabilities exist.

## 8. Visual generation may be proactive only when useful

Glow may recognize that a visual would materially improve a routine, workout, skincare sequence, organization plan, weekly plan, spatial system, or other visual problem.

Do not generate unnecessary images for simple factual questions.

Explicit requests such as “generate a picture” always take precedence and should invoke the visual renderer when available.

## 9. Conversational editing preserves the current creation

The user must be able to refine an existing creation through ordinary language:

- make that shorter
- move the workout before breakfast
- change Tuesday
- remove step four
- use the second picture
- make it less pink
- make the design more timeless
- keep everything else
- use the lighting from version two

The system should understand that the user is modifying the active creation rather than starting from zero unless they explicitly ask for a new one.

## 10. Media understanding and creation connect

### Images
The user may ask Glow to identify, compare, organize, extract, redesign, or use an image as a reference.

### Video
Video is a first-class source. Glow should extract useful spoken and visual information, including steps, timestamps, products, claims, instructions, and recommendations when the connected model supports them.

### Audio
Audio may be transcribed and incorporated into the same conversation context.

### Documents
Glow should inspect supported document contents rather than treating attachments as filenames. Unsupported binary formats must be labeled truthfully until a decoder is connected.

## 11. Screen and room context are part of the conversation

Ask Glow must know where the user currently is when that context is available.

The user may say:

- “Fix this.”
- “Move this to Friday.”
- “When do I use this?”
- “Where can this fit?”

Reference resolution follows the global intelligence inheritance law:

1. selected object
2. current room/world
3. recent conversation
4. active relevant Glow context

The user should not have to restate information the interface already knows.

## 12. Ask, analyze, plan, create, edit, and act are one flow

Do not split these into disconnected assistant products.

A conversation may naturally move through:

**Ask → Analyze → Plan → Create → Edit → Act**

The interface may surface contextual controls after a response, but those controls are shortcuts around the current answer, not the primary language of the product.

## 13. Actions preserve truth, permission, and receipts

Ask Glow may perform verified actions only through the centralized execution layer.

Persistent changes follow:

**understood → proposed → approved → executed → receipt**

Read-only explanation and creation do not require approval unless another policy requires it.

Sending, publishing, deleting, purchasing, or other consequential external changes require appropriate permission.

Never claim an action happened if the executor did not complete it.

## 14. Generated content lives in the conversation

Images appear inline.
Documents appear as rich objects when supported.
Routine cards are previewable.
Playable media should remain playable.
Files should be tappable or downloadable when a real file exists.

Do not reply only with “your file has been generated” while hiding the generated result.

## 15. Creation history and reference locking

The architecture must support version-aware creation over time.

The user should eventually be able to refer to earlier versions such as:

- go back to version three
- use lighting from two with layout from five
- make this the official version

Reference images may be explicitly locked to a creation thread. A locked reference remains authoritative until the user replaces or unlocks it.

Do not pretend version persistence or locking occurred unless storage actually recorded it.

## 16. Routine visuals are a first-class Glow output

A routine can become:

- written steps
- visual sequence
- Routine Card
- printable
- phone visual
- calendar companion
- in-app Glow Matter object

Different information deserves different visual structures. Do not force every output into identical rectangular cards.

Examples:

- workout → exercise/body-position sequence
- skincare → product-order pathway
- closet → annotated spatial organization
- budget → flow diagram
- week → time landscape
- travel → visual journey

## 17. Natural visual prompting

The user should never need prompt-engineering vocabulary.

Natural requests such as “more Apple,” “more futuristic,” “less busy,” “make the glass look real,” “use my reference,” and “make one for iPad” must be translated internally into creation instructions.

## 18. Cross-modal transformation is a core capability

The system should support transformations such as:

- video → routine
- voice note → plan
- PDF → Glow system
- photos → inventory
- conversation → project
- routine → image
- image → editable room concept
- notes → presentation
- spreadsheet → visual system
- calendar → daily visual
- research → guide

No single transformation requires its own separate assistant identity.

## 19. Ask the minimum necessary questions

If Glow has enough context to produce a useful first result safely, produce it.

Do not turn every creation into a setup interview. Refinement can happen conversationally after the first useful output.

## 20. Error recovery preserves continuity

When a file, video, audio recording, generation, or external action fails, the conversation remains intact.

Offer only real recovery paths, such as retrying, using audio only, analyzing selected material, or choosing another file.

Never strand the user on a dead-end error screen.

## 21. Upload states use Glow Matter, not generic bureaucracy

Uploads and processing should communicate understandable states such as:

- Receiving
- Reading
- Understanding
- Ready

Glow Matter may visually clarify, refract, or gather light as understanding progresses. Accessibility text must still state the processing status clearly.

## 22. Device behavior

### iPhone
A compact floating Glow Matter composer should provide attachment, expandable text, voice, and send without covering the conversation.

### iPad and desktop
Support drag-and-drop, larger creation previews, side-by-side source/creation work where useful, and keyboard behavior without becoming a three-panel dashboard.

Across all devices:

- touch targets remain usable
- keyboard/focus behavior works
- reduced motion is respected
- OS status bars are not faked inside mockups
- generated output remains visible inline

## 23. Shakti behavior

Shakti is not a chatbot bubble, mascot, generic orb, fairy, angel, hologram person, or decorative icon.

Shakti is the intelligent presence behind the conversation. Glow Matter may respond to listening, understanding, creating, acting, and completion through restrained light, refraction, depth, and motion.

The futuristic interface must never hide basic usability. The user must still clearly see what they wrote, what Glow replied, attachments, creations, and actions.

## 24. Absolute prohibitions

Ask Glow must never regress into:

- a screen consisting mainly of prompt buttons
- a text-only chatbot
- a tiny one-line input
- a menu disguised as AI
- an FAQ bot
- a fixed command launcher
- an attachment-less assistant surface
- a weaker page-specific voice assistant
- a disconnected image generator
- a separate AI product awkwardly embedded inside Glow OS
- a pink floating chatbot bubble
- a generic orb assistant
- a conventional dashboard widget
- fake “save,” “done,” “uploaded,” “read,” or “generated” states without verified execution

Shakti must never be reduced to a send icon.

## 25. Fundamental product principle

> Anything the user can show, say, type, upload, point to, or create can become part of a conversation with Glow when the platform can access it.

> Anything Glow understands should be transformable into another useful form when a verified creation/execution path exists.

The experience should feel like communicating with an intelligent creative partner and operating layer, not navigating a menu of what the assistant is allowed to do.

## 26. Acceptance tests

Before Ask Glow or any new surface that invokes it is considered complete, verify at minimum:

1. free typing works without pressing a suggestion
2. multiline and long text expand naturally
3. Shift+Enter creates a newline and Enter sends on keyboard surfaces
4. microphone input enters the same conversation
5. photo capture and photo selection work on supported mobile browsers
6. video capture/selection is available on supported mobile browsers
7. multiple files can be attached together
8. pasted screenshots/files are accepted where browser APIs expose them
9. drag-and-drop works on iPad/desktop where supported
10. PDF content can be analyzed by a compatible model
11. image content can be analyzed
12. audio can be transcribed
13. supported video can be analyzed by a compatible multimodal model
14. unsupported binary formats are never falsely reported as read
15. an explicit image-generation request returns a real inline image
16. generated image remains visible in the conversation
17. text-only persistent actions still use approval and truthful receipts
18. selected room/object context remains available
19. conversation continuity survives movement across Glow rooms where the shared session supports it
20. suggestions remain optional rather than blocking free input
21. iPhone, iPad, and desktop responsive layouts remain usable
22. keyboard/focus and reduced-motion behavior remain usable
23. a failed attachment/generation does not destroy conversation history
24. no second assistant runtime is introduced

## Final invariant

**Ask Glow is where the user can think out loud, show Glow the world, create with Shakti, and act through Glow OS without changing how they naturally communicate.**
