# Glow OS — Real Data Only Law

**Status:** Canonical, authoritative, permanent.

Every current and future Glow OS surface must distinguish product structure from the user's actual life data.

## Core law

Glow may display a personal fact only when it comes from one of these sources:

1. the signed-in user's Glow OS database records;
2. a connected and authorized external account belonging to that signed-in user;
3. a value the user entered or confirmed in the current interaction;
4. a clearly labeled suggestion that is not presented as an existing fact.

If a data source is empty, disconnected, unavailable, or not implemented, Glow must show an honest empty or connection state. It must never fill that gap with a sample person, sample appointment, sample task, sample file, sample location, sample medication, sample routine, sample meal, sample financial value, or sample relationship and present it as the user's life.

## Reference-image rule

Reference images may contain visual placeholder content. Their architecture, composition, hierarchy, material, lighting, typography, spacing, and interaction pattern can remain authoritative. Placeholder values are not user data and must be replaced by live data or an explicit empty state before a room is considered live.

## People

People must come from the user's connected contacts or another explicitly connected relationship source. No Alex, Jordan, Taylor, Sam, or any other sample name may appear as a real relationship unless that person actually exists in the user's connected data.

Opening Apple Messages with a real contact phone number is allowed. Glow must not imply that the web app can read private iMessage conversation history unless a real authorized integration exists.

## Calendar and Places

Calendar events and places must come from the user's Glow calendar or connected calendar provider. Locations may only be shown when attached to a real event or explicitly saved by the user.

## Tasks, Focus, and Journey

Focus must use the user's real open/in-progress tasks. Progress percentages, due times, blockers, related people, and files may not be fabricated.

Journey may connect product states such as Morning Brief and What Now, but personal steps inside that journey must come from real tasks, events, routines, or user-confirmed plans.

## Health, wellness, medication, food, beauty, and routine data

These are especially sensitive to false personalization. If Glow does not have a real connected record, it must say that the value is not logged or not connected. It must not present a sample medication, supplement, meal, sleep value, wake time, weather value, body metric, beauty routine, or wellness state as the user's fact.

## Money

Financial values must always come from the signed-in user's stored financial records or an authorized financial connection. No sample balances, income, spending, debt, investments, or goals may be presented as live personal data.

## Working controls

A visible control must either perform its stated action or clearly communicate why the action is unavailable. Decorative elements must not masquerade as working controls.

External write actions must not claim success until the corresponding authorized external write actually succeeded. For example, a replan screen may propose moving a Google Calendar event, but it must not say the event was moved unless a real Calendar write request succeeded.

## Authentication boundary

Personalized Home and Today require a signed-in Glow user. Preview mode must not bypass authentication and then substitute sample personal content. If the account is not signed in, Glow should route to authentication.

## Future-page inheritance

Before any future page is considered complete, verify:

- every personal name belongs to the signed-in user's connected data;
- every personal time/date/event is live or explicitly user-entered;
- every task, goal, habit, routine, note, place, and financial value is user-scoped;
- missing integrations show honest empty states;
- suggestions are labeled as suggestions;
- reference placeholders are removed from the live surface;
- visible buttons work on the first press;
- external writes are not simulated;
- Glow OS / Today / Ask Glow follow the single navigation authority law.

**Permanent standard:** preserve the reference architecture, but never preserve reference fiction as personal truth.
