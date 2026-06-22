# buckflo Feature Timeline

## Overview

Progressive feature roadmap balancing user value, development effort, and database safety. Built around phased validation: ship MVP, get users, validate demand, then expand.

**Current Status:** Capacitor Android APK complete, offline-first, IndexedDB storage
**Next Priority:** Phase 1 (AI Auto-Categorization)

---

## PHASE 1: Smart Quick Log with Learning

**Timeline:** 1-2 weeks
**Effort:** 4-5 hours development
**Risk Level:** 🟢 VERY LOW (isolated new feature, zero impact on core)
**Target Users:** Early testers (friends, cousins)

### Feature: Smart Category Learning (Keyword-Based)

**What it does:**

User types transaction description → Algorithm suggests category → Gets smarter with usage

```
Example flow:

Entry 1: User types "Lunch"
├─ Algorithm: No history, shows category dropdown
├─ User: Selects "Food & Drink"
└─ App learns: "lunch" → "Food" (confidence: 1.0)

Entry 2: User types "Lunch at office"
├─ Algorithm: Finds keyword "lunch" in learning map
├─ Suggests: "Food & Drink" (auto-selected)
├─ User: Just confirms or auto-logs
└─ App updates: "lunch" → confidence increases

Entry 5: User types "Lunch"
├─ Algorithm: High confidence (used correctly 4+ times)
├─ Auto-logs: "Food & Drink" (zero user action)
└─ Done in 1 second
```

**Coverage:**

- 100% of transactions (all manual, but increasingly fast)
- First use: Full entry (amount + description + category pick)
- Repeat uses: Auto-suggests category (1-2 taps max)
- High-confidence: Auto-logs (instant)

**Why this works:**

- No SMS permissions needed
- No API keys or configuration
- Offline works perfectly (always)
- Learns from actual user behavior
- Gets smarter every transaction
- Play Store compatible ✅
- Simple keyword matching algorithm
- Tiny storage footprint (~50KB)

**Subfeatures:**

#### 1. Keyword Learning Map Storage

- New Dexie table: `keywordMappings`
  - Stores: keyword, category, confidence_score, usage_count, last_used
  - Example: `{ "lunch": "Food", confidence: 0.95, count: 12, last_used: "2024-06-18" }`
- Size: ~50KB for 1000+ keywords (tiny)
- Local only (no backend, no API)

**Effort:** 1 hour
**Risk:** NONE (new isolated table)
**Storage:** ~50KB per user

#### 2. Keyword Extraction from Description

- When user types transaction description, extract words
- Split by spaces, remove punctuation
- Convert to lowercase for matching
- Example: "Lunch at office" → ["lunch", "office"]

**Effort:** 1 hour
**Risk:** NONE (simple string processing)

#### 3. Confidence Scoring Algorithm

- **High confidence (auto-log):**
  - confidence > 0.9 AND usage_count > 3
  - Category auto-selected, user can tap confirm
- **Medium confidence (suggest):**
  - confidence > 0.7 AND usage_count > 1
  - Category auto-selected, user confirms
- **Low confidence (dropdown):**
  - confidence < 0.7 OR first time seeing keyword
  - User picks from category list

**Effort:** 1 hour
**Risk:** NONE (local algorithm)

#### 4. Learning Update Logic

- After user confirms category:
  - Check if keyword exists in map
  - If yes: increment count, update confidence
  - If no: add new entry with confidence 1.0
- Confidence calculation: `count_correct / total_count`

**Effort:** 1 hour
**Risk:** NONE (simple math)

#### 5. UI Integration

- Transaction entry field: Description input
- Below input: Real-time category suggestion
  - Shows suggested category (if high confidence)
  - Shows "Pick category" if low confidence
  - User can override anytime
- After confirming: Learning updates (invisible to user)

**Effort:** 1-2 hours
**Risk:** NONE (UI only)

### Success Criteria

**Keyword Learning:**

- [ ] Keywords extracted correctly from descriptions
- [ ] Keyword mappings stored in Dexie
- [ ] Confidence scores calculated correctly
- [ ] Learning updates on each confirmed entry

**Category Suggestion:**

- [ ] High-confidence keywords auto-selected
- [ ] Medium-confidence keywords suggest (user confirms)
- [ ] Low-confidence shows dropdown
- [ ] User can override anytime

**Learning Over Time:**

- [ ] First entry: User picks category from dropdown
- [ ] Second entry (same keyword): Auto-suggests category
- [ ] Third+ entry (same keyword): Auto-logs (zero friction)
- [ ] Confidence increases with repeated correct use

**Coverage:**

- [ ] 100% of transactions tracked (manual entry always works)
- [ ] Increasingly faster as learning grows
- [ ] No permissions needed
- [ ] Works 100% offline

**No Regressions:**

- [ ] Manual transaction entry still works
- [ ] No crashes or data corruption
- [ ] Storage footprint small (~50KB)

### Dependencies

- Capacitor Android APK fully functional
- IndexedDB (Dexie) working
- Transaction entry form working (already exists)
- No additional permissions needed
- No API keys needed
- No network dependency

### Rollback Plan

- Disable keyword learning via Settings toggle
- Delete `keywordMappings` table (if corrupted)
- Manual transaction entry continues to work normally
- No impact on existing transactions
- Zero data loss risk (feature is additive only)

---

**Timeline:** 2-4 weeks (after Phase 1 validated)
**Effort:** 11-15 hours total
**Risk Level:** 🟢 LOW (settings only, zero DB impact)
**Trigger:** After 20-30 users testing Phase 1

### Feature 2.1: Biometric App Lock

**What it does:**

- On app open: prompt for Face ID or Fingerprint
- On first use: user can enable/disable
- After timeout (5 min): lock and require re-auth
- Falls back to PIN if biometric fails

**Effort:** 3-4 hours
**DB Risk:** NONE (Capacitor plugin, no data writes)

**Tech:** `@capacitor-community/biometric`

**Success Criteria:**

- [ ] Face ID works on iPhone
- [ ] Fingerprint works on Android
- [ ] Timeout works (5 min default)
- [ ] PIN fallback functional
- [ ] Can disable in Settings

---

### Feature 2.2: PIN Protection

**What it does:**

- User sets 4-6 digit PIN during onboarding (optional)
- On app open: prompt for PIN
- Timeout after 5 min of inactivity
- Show as fallback if biometric unavailable

**Effort:** 2-3 hours
**DB Risk:** NONE (Settings storage)

**Tech:** Dexie `profile` table + Capacitor Storage (encrypted)

**Success Criteria:**

- [ ] Can set PIN
- [ ] Can change PIN
- [ ] Timeout enforced
- [ ] Stored securely (not plaintext)

---

### Feature 2.3: Year-End Wrapped

**What it does:**

- Multi-screen shareable story (like Spotify Wrapped)
- Shows: total spend, top category, biggest transaction, savings rate
- Pixel art aesthetic (matches buckflo design)
- Shareable as image/text

**Effort:** 6-8 hours
**DB Risk:** NONE (read-only analytics)

**Tech:**

- Animation library (Framer Motion or simple CSS)
- HTML canvas for image generation
- Share API (native on mobile)

**Success Criteria:**

- [ ] All metrics calculated correctly
- [ ] Screens animated smoothly
- [ ] Can share as image
- [ ] Design matches brand colors

---

## PHASE 3: Collaboration (Deferred)

**Timeline:** 4+ weeks (only if user demand)
**Effort:** 15-20 hours
**Risk Level:** 🔴 HIGH (new tables, relationship logic)
**Trigger:** Users specifically ask for "split with friends"

### Feature 3.1: Bill Splitting

**Why deferred:**

- Most complex feature
- Highest DB risk (new tables, multi-user logic)
- Requires user validation first
- Only build if users demand it

**Subfeatures (if built):**

#### Friend Connections

- Generate shareable friend codes
- Add friend via code
- Track connected users

#### Shared Expense Groups

- Create group (e.g., "Goa Trip")
- Add members
- Log expenses with split logic
- Calculate who owes whom
- Mark settled

#### Vendor Learning in Splits

- Same as AI feature, but for splits
- Learn vendor names across groups
- Reuse in future splits

### Estimated Effort

- DB schema: 3-4 hours
- Connection UI: 3-4 hours
- Expense splitting logic: 4-5 hours
- Settlement flow: 3-4 hours
- Testing: 4-5 hours
- **Total: 17-22 hours**

### Why It's Risky

- Touches multiple new tables
- Calculation errors = wrong settlements
- Multi-user relationship complexity
- Could corrupt data if bugs exist

### Go/No-Go Criteria

- ✅ Build only if 10+ users ask for it
- ✅ Build only after Phase 1 & 2 validated
- ✅ Build only if you have extra time

---

## Timeline Summary

```
NOW (Week 1-2)
└─ PHASE 1: Smart Quick Log with Keyword Learning
   ├─ Keyword extraction from description
   ├─ Confidence-based category suggestion
   ├─ Local learning map (grows with usage)
   └─ Ship to users (100% coverage with manual entry)

WEEK 3-4
└─ Get feedback from Phase 1 users
└─ Monitor learning quality
└─ Bug fixes + refinements

WEEK 5-6
└─ PHASE 2: Security + Year-End Wrapped
   ├─ Biometric lock
   ├─ PIN protection
   └─ Year-End Wrapped

WEEK 7-8
└─ Polish & bug fixes
└─ Ship as 1.0 release

MONTH 2+ (only if demanded)
└─ PHASE 3: Bill Splitting
   ├─ Friend connections
   ├─ Shared expenses
   └─ Settlement logic
```

---

## Go/No-Go Checklist per Phase

### Phase 1 Release Criteria

- [ ] Keyword extraction works correctly
- [ ] Keyword mappings store/retrieve correctly
- [ ] Confidence scoring calculates correctly
- [ ] High-confidence keywords auto-log
- [ ] Medium-confidence keywords auto-suggest
- [ ] Low-confidence shows dropdown
- [ ] Learning updates on every confirmed entry
- [ ] User can override anytime
- [ ] No crashes or data corruption
- [ ] Works 100% offline
- [ ] Tested with 10+ real user entries
- [ ] Storage footprint < 100KB

### Phase 2 Release Criteria

- [ ] Phase 1 shipped & stable
- [ ] No major bugs reported
- [ ] Biometric tested on real Android devices
- [ ] PIN tested on both platforms
- [ ] Year-End Wrapped animations smooth
- [ ] Share functionality works

---

## Risk & Mitigation

### Phase 1 Risks

| Risk                         | Impact                   | Mitigation                                            |
| ---------------------------- | ------------------------ | ----------------------------------------------------- |
| Keyword match false positive | Wrong category suggested | User can override, learning self-corrects             |
| User never confirms keyword  | Learning doesn't happen  | Still manual entry works, user controls learning      |
| Duplicate keywords           | Confusion in map         | Deduplicate on insert (convert to lowercase)          |
| Storage corruption           | Keyword map lost         | Backup in Dexie, can rebuild from transaction history |

**Overall Risk: VERY LOW** — Simple algorithm, local-only, user has full control

---

### Phase 2 Risks

| Risk                   | Impact          | Mitigation                        |
| ---------------------- | --------------- | --------------------------------- |
| Biometric unavailable  | User locked out | PIN fallback                      |
| Timeout too aggressive | User frustrated | Adjustable timeout setting        |
| Year-End calc wrong    | Bad data shown  | Read-only, no impact on real data |

**Overall Risk: LOW** — All settings-based, no transaction impact

---

### Phase 3 Risks

| Risk                   | Impact            | Mitigation                    |
| ---------------------- | ----------------- | ----------------------------- |
| Settlement calc wrong  | Users lose money  | Thorough testing, audit trail |
| Data corruption        | User data lost    | Backup before feature         |
| Multi-user sync issues | Inconsistent data | Only after sync validated     |

**Overall Risk: HIGH** — Don't build unless you're confident

---

## Success Metrics

### Phase 1

- Users track 100% of transactions (manual entry fallback always works)
- Keyword learning map grows: 50+ keywords within first 2 weeks
- High-confidence auto-logs: 30%+ of entries after 2 weeks
- User friction decreases over time (learns patterns)
- Keyword reuse rate: 70%+ (getting faster as learns)
- User satisfaction: "Category suggestion speeds up entry"
- No permissions needed: ✅
- Works offline: ✅
- Storage footprint: < 100KB

### Phase 2

- Biometric adoption: 50%+
- Year-End Wrapped shares: 30%+ of users
- App crashes from lock: 0

### Phase 3

- Users creating splits: 30%+
- Settlements marked correctly: 95%+
- Data integrity maintained: 100%

---

## Feature Pruning (What We're NOT Building)

**Skipped (was overcomplicating):**

- ❌ SMS reading (permission issues, Play Store problems)
- ❌ Email reading (Phase 1.5 optional, not MVP)
- ❌ LLM API integration (overkill, simple algorithm does it)
- ❌ Provider configuration (no API keys needed)
- ❌ Complex vendor mapping (simple keyword matching works)

**Permanently excluded:**

- ❌ Google OAuth (not needed, offline works)
- ❌ Multi-account support (deferred, low demand)
- ❌ Cross-device sync (offline-first philosophy)
- ❌ Business expense tracking (separate product)
- ❌ Apple login (not Android-focused)

**Why Phase 1 is realistic:**

- Simple keyword algorithm (not ML/AI)
- Works offline (always)
- Play Store compatible (no permissions)
- Learns from user behavior
- Gets smarter over time
- Honest about what it does
- MVP ships in 1-2 weeks

---

## Document Maintenance

**Update this when:**

- [ ] Phase 1 ships
- [ ] User feedback changes priorities
- [ ] New feature ideas emerge
- [ ] Effort estimates change

**Last Updated:** June 18, 2026
**Next Review:** After Phase 1 ships (Week 3)

---

## Quick Links

- Dexie Schema: `src/db/database.ts`
- Capacitor Config: `capacitor.config.ts`
- Design System: `KNOWLEDGE_BASE.md` Section 8
- Current Features: `README.md`

---

## Sign-Off

**Approved by Pranav:** [22 Jun, 2026]
**Next milestone:** Phase 1 completion
