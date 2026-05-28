# Screenshots

Drop captures into this directory; the project README renders them in the
Screenshots table.

Expected filenames:

| File              | What to capture                                          |
| ----------------- | -------------------------------------------------------- |
| `dashboard.png`   | Dashboard with the hero card and at least 3 documents    |
| `chat.png`        | A chat thread mid-conversation, citations panel visible  |
| `documents.png`   | Documents table with all seeded rows                     |
| `dark.png`        | Any page in dark mode                                    |

Recommended capture flow:

```bash
docker compose up -d
bash scripts/seed.sh
# Visit http://localhost:3000 and capture each page above.
# Toggle theme via the moon/sun icon in the top nav for dark.png.
```

Browser window 1440x900 produces clean captures with no horizontal
scrolling.
