# Reel Maker skills

Dua skill agent untuk membuat reel vertikal 1080x1920 dengan Remotion:

- `skills/reel-maker`: alur kerja reel, plus `engine/` (proyek Remotion: kode, SFX, musik, gambar, 3 contoh `script.json`)
- `skills/remotion-best-practices`: referensi Remotion

## Install

**Claude Code** (per proyek, atau global di `~/.claude/skills/`):
```bash
git clone <url-repo-ini> /tmp/reel-skills
mkdir -p .claude/skills && cp -R /tmp/reel-skills/skills/* .claude/skills/
```
Saat pertama dipakai, agent akan menyalin `engine/` menjadi `reel/` lalu menjalankan `npm install` (lihat bagian Setup di SKILL.md).

**Agent lain (Codex, Cursor, dll.)**: salin folder `skills/` ke proyek, lalu tambahkan baris ini ke `AGENTS.md`:
> Untuk membuat reel/video, baca dan ikuti `skills/reel-maker/SKILL.md`. Untuk detail Remotion, baca `skills/remotion-best-practices/SKILL.md`.

## Kebutuhan
Node 20+, ffmpeg. Opsional: whisper-cli (untuk timing VO), macOS `say` (untuk suara default).
