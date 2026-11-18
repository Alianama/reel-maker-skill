# Reel Almeli Labs (Remotion)

Reel vertikal 1080x1920. Cara bikin: lihat skill `.claude/skills/reel-maker` dan `talking-head`, atau `PROMPT-TEMPLATE.md` / `TALK-TEMPLATE.md` di root.

## Peta folder

| folder | isi | boleh dihapus? |
|---|---|---|
| `reels/<produk>/<judul>/` | **sumber reel**: `script.json`, `caption.txt`, `vo.txt` (naskah ElevenLabs), `vo.mp3` (rekaman) | jangan |
| `edits/<nama>/` | tambah SFX/musik/VO ke video jadi: `edit.json`, `video.mp4`, `vo.mp3` | jangan |
| `talks/<nama>/` | talking head: `raw.mp4` + transkrip + `edit.json` | jangan |
| `src/` | komponen video. Gaya: `theme.ts`, `Reel.tsx`, `Fx.tsx`. Visual: `Visuals.tsx` + `*UI.tsx` per produk (`ChatUI` Melichat, `BrainUI` Melibrain, `MoreUI` Melidoc/Melisense, `KasUI` Melikas, `SellUI`/`PriceUI`/`ShopUI` seri jualan) | jangan |
| `public/img`, `public/music`, `public/sfx` | aset yang bisa dipakai ulang (foto, musik bebas royalti, SFX) | jangan |
| `scripts/` | `make.mjs` (render reel), `talk.mjs`, `overlay.mjs`, `music.mjs`, `sfx.mjs` | jangan |
| `public/reels`, `public/talks` | cache audio/data hasil render | ya, dibuat ulang otomatis |
| `out/` | hasil mp4 + `-check.jpg` | ya, bisa dirender ulang |

## Perintah

```console
npm run make -- melikas/pengenalan     # reel → out/melikas/pengenalan.mp4
npm run talk -- <nama>                  # talking head
node scripts/overlay.mjs <nama>         # edits/<nama> → out/edits/<nama>.mp4
npm run dev                             # Remotion Studio
```
