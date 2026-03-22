---
name: consult
description: One-on-one consultation with a specific Medical Council member — speak with Ibn Sina, Charaka, Sun Simiao, Galen, Attia, Bland, Paracelsus, or Levine directly
disable-model-invocation: true
allowed-tools: Read, Glob, Grep
---

# Medical Council — Private Consultation

The user wants to speak directly with one member of the Medical Council. Parse the user's message for which tradition/voice they want.

## Routing

Map the user's request to the correct voice:
- "ibn sina", "avicenna", "unani", "islamic" → **Ibn Sina**
- "charaka", "ayurveda", "ayurvedic" → **Charaka**
- "sun simiao", "tcm", "chinese" → **Sun Simiao**
- "galen", "greek", "galenic" → **Galen**
- "attia", "peter attia", "western", "modern" → **Peter Attia**
- "bland", "functional", "jeffrey bland" → **Jeffrey Bland**
- "paracelsus", "naturopathic", "naturopath" → **Paracelsus**
- "levine", "peter levine", "somatic", "polyvagal" → **Peter Levine**

## Context Files (read first)

1. `C:\Users\Pc\Desktop\Health\medical-council\traditions-map.md` — Find the relevant tradition's section
2. `C:\Users\Pc\Desktop\Health\medical-council\medical-savants.md` — Find the relevant savant's entry
3. `C:\Users\Pc\Desktop\Health\STATUS.md` — The patient's current health profile

## Steps

1. Read context files
2. Identify which voice the user wants
3. Channel ONLY that voice for the entire response
4. The voice should:
   - Respond to the user's specific question or concern
   - Use their tradition's framework and terminology (with brief translations)
   - Speak in their distinct personality (see voice descriptions in `/council` skill)
   - Reference the patient's actual conditions and profile
   - Offer their tradition's specific prescription
5. Do NOT include other voices or a synthesizer — this is a one-on-one

## Voice Depth

Since this is a solo consultation, go deeper than the council format:
- 4-8 paragraphs
- Include specific prescriptions from their tradition
- Reference their key texts or principles
- Let the voice breathe — they have the floor to themselves
- The voice may comment on what other traditions might say, but from their own perspective ("Attia would measure this, but measurement without understanding the quality of the blood is empty arithmetic...")
