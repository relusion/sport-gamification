# MoveQuest — MVP Scope

## 1. Project summary

**MoveQuest** is a bias-free sport and physical activity discovery web app for kids and teenagers.

The app helps young users discover what kinds of movement, challenge, environment, and social experience they enjoy **before showing any sport names**. Instead of asking whether a child likes football, swimming, tennis, dance, or basketball, MoveQuest asks playful movement-first questions and builds a hidden movement profile.

At the end, the app reveals:

1. A movement archetype.
2. A short explanation of why it fits.
3. A shortlist of activities worth trying first.
4. Parent-friendly practical filters and next-step guidance.

The product should encourage exploration, variety, confidence, and enjoyment rather than early specialization or performance pressure.

---

## 2. Product goal

Build a visually striking, kid-friendly, privacy-first MVP that helps kids and teenagers complete a playful quiz and receive encouraging activity suggestions based on their movement preferences.

The MVP should be simple enough for a hobby project, but polished enough to feel inspiring, modern, and presentation-ready.

---

## 3. Target users

### 3.1 Kid / Teen users

Primary users.

Approximate age range:

- 8–16 years old

Needs:

- Fun, playful, non-clinical experience.
- No sport-name bias during the quiz.
- Encouraging results.
- Easy-to-understand activity ideas.
- No pressure, ranking, or negative labels.

### 3.2 Parents / guardians

Secondary users.

Needs:

- Practical filters for cost, distance, schedule, equipment, and safety considerations.
- Clear beginner guidance.
- Exportable or saveable shortlist.
- Privacy reassurance.
- No targeted advertising or unnecessary data collection.

### 3.3 Coaches / schools

Optional MVP-plus audience.

Needs:

- Anonymous class-level insights.
- Movement preference patterns.
- Confidence barriers.
- Session ideas.
- No individual ranking.
- No public leaderboards.

### 3.4 Admin / content manager

Internal user.

Needs:

- Manage hidden activity catalogue.
- Manage quiz questions and answer options.
- Manage tags and scoring attributes.
- Manage archetypes.
- Preview matching results.
- Manage English and Russian localized content.

---

## 4. Core design principle

MoveQuest should promote:

- **Movement-first discovery**, not sport-name preference.
- **Exploration**, not fixed identity.
- **Shortlists**, not one final answer.
- **Try weeks**, not permanent choices.
- **Variety**, not pressure.
- **Enjoyment and fit**, not performance ranking.
- **Privacy-by-design**, especially because the product is for children and teenagers.

Result language should avoid statements like:

> “This is the best sport for you.”

Preferred language:

> “Here are movement paths worth trying first.”

or:

> “These are activity ideas that may fit how you like to move.”

---

## 5. MVP scope

### 5.1 Included in MVP

The MVP should include:

1. **Landing / onboarding page**
   - Clear product explanation.
   - Strong call to action.
   - Explanation of no sport-name bias.
   - Parent trust signals.
   - English / Russian language switcher.

2. **12-question interactive quiz**
   - Kid-friendly cards, sliders, or choice buttons.
   - No sport names during quiz.
   - Progress indicator.
   - Playful illustrations or icons.
   - Movement profile updates behind the scenes.

3. **Weighted matching engine**
   - Hidden scoring system.
   - Answers add or subtract points from activity and archetype profiles.
   - Matching should support activity tags, constraints, and mismatch penalties.

4. **Movement archetype result**
   - Main archetype card.
   - Supporting archetypes.
   - Trait visualization.
   - “Why this fits you” explanation.
   - Clear disclaimer: this is a starting point, not a fixed label.

5. **Revealable activity shortlist**
   - Actual sport/activity names shown only after the archetype result.
   - 3–5 recommended activities.
   - Fit explanation per activity.
   - Tags such as indoor/outdoor, solo/team, beginner-friendly, equipment level.
   - Confidence meter such as:
     - Easy to start
     - Needs lessons
     - Needs equipment
     - Needs team

6. **Parent filter panel**
   - Budget.
   - Travel distance.
   - Weekly schedule.
   - Equipment availability.
   - Medical/safety considerations as notes, not diagnosis.
   - Export or save shortlist.

7. **Admin screen**
   - Manage activities.
   - Manage archetypes.
   - Manage quiz questions.
   - Manage tags.
   - Preview matching results.
   - Manage localized English and Russian copy.

8. **Language support**
   - English and Russian UI support from MVP stage.
   - Manual language switcher.
   - Localized user-facing content.

---

## 6. Out of scope for MVP

The MVP should not include:

- Social network features.
- Public child profiles.
- Public leaderboards.
- Competitive ranking of children.
- Wearable integration.
- Medical diagnosis.
- Body-shape scoring.
- Complex AI recommendations.
- Paid advertising targeted to children.
- Real-time club availability search.
- Full booking or payment flow.
- Complex school district administration.
- Advanced analytics beyond simple anonymous class-level insights.

---

## 7. Main user flow

### 7.1 Kid / Teen flow

1. User opens landing page.
2. User chooses language: English or Russian.
3. User starts the quest.
4. User answers 12 movement-first questions.
5. App builds hidden movement profile.
6. App shows main archetype.
7. User reviews movement strengths and “why this fits you.”
8. User clicks **Reveal activity ideas**.
9. App shows 3–5 activity ideas.
10. User can save, export, or share results with a parent.

### 7.2 Parent flow

1. Parent opens result page.
2. Parent reviews activity ideas.
3. Parent adjusts filters:
   - Budget
   - Distance
   - Schedule
   - Equipment
   - Safety notes
4. App updates shortlist.
5. Parent saves or exports shortlist.
6. Parent sees beginner-friendly next steps.

### 7.3 Admin flow

1. Admin logs in.
2. Admin opens Activity Catalogue Manager.
3. Admin creates or edits activities.
4. Admin assigns tags and scoring attributes.
5. Admin adds English and Russian copy.
6. Admin manages quiz questions and answer options.
7. Admin previews matching results.
8. Admin publishes updated configuration.

---

## 8. Screens required for MVP

### 8.1 Public / child-facing screens

| Screen | Purpose |
|---|---|
| Landing page | Explain the product and start the quest |
| Quiz question screen | Collect movement preferences without sport names |
| Movement map sidebar | Show playful progress and trait hints |
| Archetype result screen | Reveal movement style and strengths |
| Activity ideas screen | Show actual activity shortlist |
| Review answers screen | Let user review or restart quiz |

### 8.2 Parent screens

| Screen | Purpose |
|---|---|
| Parent filter panel | Adjust recommendations to practical constraints |
| Export shortlist view | Generate printable/shareable summary |
| Parent guidance notes | Explain beginner steps and safety reminders |

### 8.3 Coach / school screens

Optional for MVP, recommended for MVP-plus.

| Screen | Purpose |
|---|---|
| Coach dashboard | Show anonymous class-level insights |
| Activity insights | Show popular movement preferences |
| Confidence barriers | Show group-level participation blockers |
| Session ideas | Suggest inclusive PE activities |

### 8.4 Admin screens

| Screen | Purpose |
|---|---|
| Activity Catalogue Manager | Edit hidden activities and tags |
| Archetype Manager | Edit archetypes and descriptions |
| Quiz Question Manager | Edit questions, answers, and scoring |
| Tag Manager | Manage scoring tags and labels |
| Preview Match Results | Test matching logic |
| Localization Editor | Manage English and Russian copy |

---

## 9. Quiz requirements

### 9.1 Quiz structure

The MVP quiz should contain **12 questions**.

Question types may include:

- Single choice.
- Multi-select.
- Would-you-rather cards.
- Slider.
- Ranking.
- Visual choice cards.

### 9.2 Question areas

The quiz should cover:

| Area | Example question |
|---|---|
| Social preference | “Do you like moving with a group, one person, or on your own?” |
| Energy style | “Do you like short bursts, steady effort, or calm focused movement?” |
| Movement joy | “What feels most fun: speed, balance, aiming, rhythm, climbing, or exploring?” |
| Contact comfort | “Are bumps and close contact okay, sometimes okay, or not for you?” |
| Competition style | “Would you rather beat your own score, help a team, perform, or solve a challenge?” |
| Environment | “Where would you rather move: indoors, outdoors, water, wheels, open space, or small space?” |
| Confidence level | “Do you want something easy to start, or something technical to master?” |
| Practical fit | “How much equipment, travel, and weekly commitment feels realistic?” |

### 9.3 Quiz content rules

During the quiz:

- Do not show sport names.
- Do not imply that some answers are better.
- Do not use negative identity labels.
- Do not ask for body shape, body weight, or appearance.
- Do not ask for precise address.
- Use age bands, not exact birth dates.
- Keep the language playful and encouraging.

---

## 10. Matching model

### 10.1 Recommended approach

Use a **weighted scoring engine**, not a strict binary decision tree.

The UI can feel like a decision tree, but the matching should be flexible behind the scenes.

### 10.2 Activity profile attributes

Each activity should include:

```yaml
activity_id: string
age_range:
  min: number
  max: number

social_mode:
  - solo
  - pair
  - team
  - mixed

energy:
  - low
  - medium
  - high
  - burst
  - endurance

environment:
  - indoor
  - outdoor
  - water
  - winter
  - urban
  - nature
  - small_space
  - open_space

movement_skills:
  - speed
  - balance
  - rhythm
  - aim
  - strength
  - flexibility
  - strategy
  - coordination
  - endurance
  - exploration

contact_level:
  - none
  - light
  - medium
  - high

cost_level:
  - low
  - medium
  - high

equipment_level:
  - none
  - basic
  - medium
  - high

beginner_friendliness:
  - easy
  - moderate
  - technical

seasonality:
  - year_round
  - summer
  - winter
  - seasonal

accessibility_notes: string
safety_notes: string
```

### 10.3 Scoring concept

Simple scoring model:

```text
match_score =
  preference_fit
+ environment_fit
+ social_fit
+ confidence_fit
+ practical_fit
- mismatch_penalty
```

The scoring should support:

- Positive matches.
- Soft mismatches.
- Hard exclusions when needed.
- Parent filters.
- Explainable result reasons.

### 10.4 Output rules

The result should show:

- 1 main movement archetype.
- 1–2 secondary archetypes.
- 3–5 activity ideas.
- A short “why this fits you” explanation.
- Practical next steps.
- A note that results are exploratory.

---

## 11. Initial movement archetypes

Recommended MVP archetypes:

1. **The Fast Team Explorer**
   - Fast movement, teamwork, quick reactions, shared energy.

2. **The Precision Challenger**
   - Focus, accuracy, timing, controlled improvement.

3. **The Balance & Rhythm Creator**
   - Coordination, rhythm, expression, body control.

4. **The Outdoor Endurance Adventurer**
   - Nature, steady effort, exploration, stamina.

5. **The Power Builder**
   - Strength, effort, visible progress, confidence building.

6. **The Strategy Mover**
   - Tactical thinking, puzzles, positioning, smart movement.

7. **The Calm Focus Mover**
   - Controlled pace, low pressure, concentration, personal progress.

8. **The Skill Trick Explorer**
   - Balance, wheels, tricks, creativity, technical mastery.

9. **The Water Flow Explorer**
   - Water comfort, rhythm, endurance, confidence in water.

10. **The Flexible Performer**
   - Expression, flexibility, practice, performance or flow.

---

## 12. Initial hidden activity catalogue

The MVP should support 30–50 activities.

A starter catalogue may include:

| Activity | Example fit |
|---|---|
| Basketball | Fast team movement, reaction, coordination |
| Ultimate Frisbee | Outdoor, teamwork, low contact |
| Climbing | Strength, problem-solving, confidence |
| Orienteering | Outdoor, strategy, exploration |
| Swimming | Water, endurance, low impact |
| Dance | Rhythm, expression, coordination |
| Martial arts | Discipline, coordination, controlled contact |
| Athletics | Speed, endurance, personal progress |
| Tennis | Aim, focus, partner play |
| Table tennis | Aim, reaction, indoor, low equipment |
| Cycling | Endurance, outdoor, exploration |
| Skateboarding | Balance, tricks, urban movement |
| Gymnastics | Flexibility, balance, strength |
| Rowing | Team rhythm, water, endurance |
| Badminton | Aim, agility, indoor |
| Volleyball | Teamwork, timing, coordination |
| Parkour basics | Movement puzzles, creativity, body control |
| Yoga for kids | Calm focus, flexibility, body awareness |
| Archery | Aim, calm focus, precision |
| Hiking | Nature, endurance, low competition |
| Running club | Endurance, personal progress |
| Football / soccer | Teamwork, speed, ball control |
| Handball | Fast movement, team strategy |
| Hockey / floorball | Speed, coordination, teamwork |
| Skiing / snowboarding | Winter, balance, adventure |
| Ice skating | Balance, rhythm, winter |
| Paddle sports | Water, endurance, technique |
| Horse riding | Balance, animal connection, discipline |
| Bouldering | Climbing, problem solving, strength |
| Trampoline | Jumping, coordination, confidence |

---

## 13. Parent mode requirements

Parent mode should support practical filtering without turning the app into a pressure tool.

### 13.1 Parent filters

Filters:

- Monthly budget.
- Travel distance.
- Weekly schedule.
- Equipment availability.
- Indoor / outdoor preference.
- Group / solo preference.
- Beginner-friendly only.
- Seasonal availability.
- Medical or safety notes.

### 13.2 Safety wording

MoveQuest should not provide medical advice.

Preferred wording:

> “Consider checking with a qualified professional if your child has medical restrictions, injuries, or safety concerns.”

Avoid:

> “This sport is safe for your child.”

### 13.3 Export

Exported shortlist should include:

- Child-friendly archetype summary.
- Recommended activities.
- Why each activity may fit.
- Beginner next step.
- Equipment notes.
- Cost level.
- Parent notes.
- Language selected by user.

---

## 14. Coach / school mode requirements

Coach / school mode is optional for the first MVP, but the design should allow it later.

### 14.1 Required principles

- Anonymous insights only.
- No individual ranking.
- No public leaderboards.
- No comparison between children.
- Group-level patterns only.
- Focus on inclusion, confidence, and participation.

### 14.2 Example insights

- Popular movement preferences.
- Indoor vs outdoor preference.
- Social mode preference.
- Confidence barriers.
- Enjoyment score.
- Suggested session ideas.

---

## 15. Admin requirements

The admin system should allow managing the matching content without code changes.

### 15.1 Admin features

Admin should manage:

- Activities.
- Archetypes.
- Quiz questions.
- Answer options.
- Tags.
- Scoring weights.
- Practical filters.
- Localized copy.
- Preview/test results.

### 15.2 Activity editor fields

Each activity should support:

- Internal ID.
- Status:
  - Draft
  - Hidden
  - Active
  - Archived
- English name.
- Russian name.
- English description.
- Russian description.
- Age range.
- Social mode.
- Energy level.
- Environment.
- Movement skills.
- Contact level.
- Cost level.
- Equipment level.
- Beginner friendliness.
- Seasonality.
- Safety notes.
- Accessibility notes.
- Matching weight overrides.

---

## 16. Language and localization requirements

### 16.1 Required languages

MoveQuest must support:

- **English**
- **Russian**

This should be included from the MVP stage.

### 16.2 Language switcher

The app should provide a manual language switcher.

Recommended UI:

```text
EN | RU
```

or:

```text
🌐 English / Русский
```

The language selector should be available:

- In the public header.
- On quiz screens.
- On result screens.
- In parent mode.
- In admin mode.

### 16.3 Localized content

The selected language should apply to:

- Navigation.
- Landing page.
- Quiz questions.
- Answer options.
- Progress messages.
- Archetype names.
- Archetype descriptions.
- Activity names.
- Activity descriptions.
- Tags.
- Parent filters.
- Safety notes.
- Privacy messages.
- Buttons.
- Validation messages.
- Exported shortlist / report.
- Admin labels and fields.

### 16.4 Localization data model

Preferred structure:

```yaml
activity_id: climbing
translations:
  en:
    name: Climbing
    short_description: Climb walls or natural rock using technique and strength.
  ru:
    name: Скалолазание
    short_description: Лазание по стенам или скалам с использованием техники и силы.

tags:
  social_mode: small_group
  energy_level: high
  environment:
    - indoor
    - outdoor
```

Quiz question example:

```yaml
question_id: movement_joy_01
type: multi_select
translations:
  en:
    title: What feels most fun?
    subtitle: Choose the movements that sound most like you.
  ru:
    title: Что кажется самым интересным?
    subtitle: Выбери движения, которые больше всего похожи на тебя.
answers:
  - answer_id: running_fast
    translations:
      en:
        label: Running fast
        hint: I love speed and racing against the clock.
      ru:
        label: Быстро бегать
        hint: Мне нравится скорость и соревнование со временем.
    scoring:
      speed: 3
      energy: 2
```

### 16.5 Localization rules

- Do not use automatic translation for production copy.
- Use curated English and Russian text.
- Russian text may be longer, so UI components must allow flexible text length.
- Use fallback to English when Russian copy is missing.
- Store language-neutral scoring tags separately from translated labels.
- Keep admin editing language-aware.
- Avoid hard-coded UI strings in components.

---

## 17. Privacy, safety, and ethics requirements

MoveQuest should follow privacy-by-design principles.

### 17.1 Data minimization

The MVP should avoid collecting:

- Full birth date.
- Precise home address.
- Body weight.
- Body shape.
- Medical diagnosis.
- Public profile information.
- Public photos.
- Social graph / friend list.

Allowed or preferred:

- Age band.
- General country or region if needed.
- Quiz answers.
- Parent-managed settings.
- Optional safety notes controlled by parent.

### 17.2 Children’s privacy

The product should be designed with children’s privacy in mind.

Rules:

- Parent-managed accounts for younger users.
- Clear deletion controls.
- Clear export controls.
- No targeted ads to children.
- No public sharing by default.
- No public ranking.
- No “not suited for you” language.
- Explainable matching logic.

### 17.3 Result safety

Avoid:

- Medical or fitness diagnosis.
- Statements that exclude a child from an activity.
- Body-based assumptions.
- Pressure to specialize early.
- Shame-based motivation.

Use:

- Encouraging language.
- Exploration language.
- Multiple options.
- Practical safety reminders.
- Parent involvement where appropriate.

---

## 18. Visual design requirements

The app should be visually striking and inspiring for kids and teenagers.

### 18.1 Style direction

- Bright, optimistic, and energetic.
- Premium startup quality.
- Playful but not babyish.
- Suitable for ages 8–16.
- Trustworthy enough for parents.
- Inclusive and friendly.
- Clear, rounded, modern UI.

### 18.2 Design elements

Use:

- Rounded cards.
- Strong color gradients.
- Soft shadows.
- Motion trails.
- Stars, arrows, paths, badges, and small decorative shapes.
- Friendly illustrations.
- Large readable typography.
- Clear CTAs.
- Accessible contrast.

### 18.3 Accessibility

The UI should support:

- Keyboard navigation.
- Clear focus states.
- Sufficient color contrast.
- Text labels in addition to icons.
- Large tap/click targets.
- No reliance on color alone.
- Responsive layout for desktop, tablet, and mobile.

---

## 19. Suggested technical scope

### 19.1 Frontend

Recommended options:

- React / Next.js.
- TypeScript.
- Component-based design system.
- i18n library such as next-intl, react-i18next, or equivalent.
- Tailwind CSS or similar utility-first styling.
- Local JSON/YAML configuration for MVP content.

### 19.2 Backend

For MVP, options:

1. Static / local-first prototype:
   - Activity catalogue stored as JSON.
   - Quiz scoring runs client-side.
   - No accounts initially.

2. Lightweight backend:
   - PostgreSQL or SQLite.
   - API for activities, questions, archetypes, and results.
   - Admin authentication.
   - Export support.

### 19.3 Matching engine

- Deterministic scoring logic.
- Configurable weights.
- Explainable result output.
- Unit tests for scoring rules.
- Snapshot tests for sample profiles.

### 19.4 Data storage

Core entities:

- Activity.
- Archetype.
- QuizQuestion.
- QuizAnswer.
- Tag.
- MatchResult.
- ParentFilter.
- Translation.

---

## 20. Acceptance criteria

### 20.1 Quiz

- User can complete 12 questions.
- No sport names appear before results.
- Progress is visible.
- User can go back to previous questions.
- Answers update hidden scoring profile.

### 20.2 Results

- User sees one main archetype.
- User sees why it fits.
- User can reveal activity ideas.
- User receives 3–5 activity suggestions.
- Result language is exploratory, not final.

### 20.3 Parent filters

- Parent can filter by budget, distance, schedule, and equipment.
- Shortlist updates after filters.
- Parent can save or export shortlist.

### 20.4 Admin

- Admin can create and edit activities.
- Admin can manage English and Russian text.
- Admin can edit tags and scoring fields.
- Admin can preview matching output.

### 20.5 Localization

- User can switch between English and Russian.
- All major user-facing screens are localized.
- Russian text does not break layout.
- Missing Russian text falls back to English.

### 20.6 Privacy

- MVP does not require precise address.
- MVP does not collect full birth date.
- MVP does not collect body metrics.
- MVP has no public profiles.
- MVP has no public leaderboards.

---

## 21. Suggested MVP milestones

### Milestone 1 — Design system and static flow

- Landing page.
- Quiz screen.
- Archetype result screen.
- Activity ideas screen.
- English/Russian language switcher.
- Static mock data.

### Milestone 2 — Matching engine

- Activity catalogue.
- Archetype catalogue.
- Quiz scoring.
- Result explanation.
- Basic tests.

### Milestone 3 — Parent layer

- Parent filters.
- Save shortlist.
- Export shortlist.
- Safety notes.

### Milestone 4 — Admin tools

- Activity manager.
- Quiz manager.
- Archetype manager.
- Localization fields.
- Preview matching results.

### Milestone 5 — Coach / school prototype

- Anonymous class-level insights.
- Movement preference charts.
- Confidence barriers.
- Suggested session ideas.

---

## 22. Open questions

1. Should the MVP require accounts, or should it work without login?
2. Should quiz results be stored or generated only locally?
3. Should parents approve saved results for children under a certain age?
4. Which region should be the first target: EU, Germany, international, or U.S.?
5. Should the activity catalogue include local availability later?
6. Should Russian be available as a full UI language from day one, or should admin content entry be English-first with Russian added before public testing?
7. Should coach / school mode be part of the MVP or deferred to a later version?
8. Should exported reports be printable PDF, shareable link, or both?
9. What visual style should be used for final illustrations: flat vector, 3D, or semi-realistic character art?
10. Should MoveQuest use the name **Activity Compass** for parent/school-facing modules?

---

## 23. One-sentence pitch

**MoveQuest helps kids and teenagers discover sports and physical activities by asking what kinds of movement, challenge, environment, and social experience they enjoy — without naming sports until the final shortlist.**
