# Routine and Ritual button fix

This branch hardens the existing `/routines` and `/beauty` destinations so dashboard actions do not fail when optional routine tables are temporarily unavailable. The routines and beauty data loaders now degrade to empty-state UI instead of throwing a route-level exception. A stable `/ritual` entry route also forwards into Beauty OS.
