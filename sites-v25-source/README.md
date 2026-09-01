# Glow OS Sites v25 source snapshot

This branch preserves the complete source state that powered the ChatGPT Sites Glow OS v25 experience before the GitHub navigation and Today-flow integration began.

- Source checkout: ChatGPT Sites internal repository
- Source commit: `e1a345c`
- Live URL at capture: `https://glow-os.tatiyanae123.chatgpt.site`
- Captured: 2026-09-01
- Archive parts: `archive/sites-v25-source.tar.gz.part-*`
- Archive SHA-256: `67975efe4fbe44cc4b7df6a2ee45a5be97b6c75bd8c36aef88ed819f515b5597`

The archive excludes generated and local-only directories (`.git`, `node_modules`, `dist`, `build`, `.sites-runtime`, and `.wrangler`). It includes the application source, configuration, migrations, documentation, and reference assets required to reconstruct the v25 source tree.

To reconstruct it from this directory:

```bash
cat archive/sites-v25-source.tar.gz.part-* > sites-v25-source.tar.gz
sha256sum sites-v25-source.tar.gz
mkdir sites-v25-source
tar -xzf sites-v25-source.tar.gz -C sites-v25-source
```

This snapshot is intentionally stored on `backup/sites-v25`. The production GitHub application remains a larger Next.js application with authentication, Neon/Drizzle data, integrations, and working routes that must not be replaced wholesale.
