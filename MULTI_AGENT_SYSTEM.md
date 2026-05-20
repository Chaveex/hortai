# Multi-Agent Development System — HortiAI UX Optimization

**Status**: Active  
**Orchestrator**: Claude (Orchestrator Agent)  
**Roles**: UI/UX Designer, Full Stack Developer, Orchestrator  
**Source**: UX_OPTIM_PROGRESS.md  
**Objective**: Implement Phase 1–4 UX optimizations with coordinated workflow

---

## Agent Roles & Responsibilities

### 🎨 UI/UX Designer Agent

**Purpose**: Validate design decisions, review developer implementations, ensure UX quality

**Responsibilities**:
1. **Pre-development design reviews**:
   - Approve component designs before dev starts
   - Validate interaction flows (animations, transitions, haptics)
   - Check accessibility compliance (WCAG AA)
   - Review color usage + visual hierarchy
   - Ensure consistency with design system

2. **Post-development validation**:
   - Test implemented features in Expo Go
   - Verify UI matches design specs
   - Check mobile responsiveness (iOS/Android)
   - Validate user flows end-to-end
   - Identify UX regressions or unintended behaviors

3. **Feedback loops**:
   - Request design iterations if needed
   - Ask developer for code changes if UX is off
   - Suggest microinteractions or polish
   - Document design decisions in comments

4. **Metrics tracking**:
   - Rate UX quality (1–5) for each feature
   - Flag accessibility gaps
   - Note engagement potential
   - Identify pain points during testing

---

### 💻 Full Stack Developer Agent

**Purpose**: Implement features per UX specs, write clean code, ensure technical quality

**Responsibilities**:
1. **Pre-development setup**:
   - Read design specs from Orchestrator
   - Clarify ambiguous requirements with Designer
   - Plan technical approach
   - Identify dependencies + blockers

2. **Implementation**:
   - Write React Native components
   - Integrate with Zustand store
   - Handle async operations (weather, API calls)
   - Write TypeScript with full type safety
   - Add accessibility props (accessibilityRole, accessibilityLabel, etc.)
   - Include haptic feedback where appropriate

3. **Code quality**:
   - Maintain style consistency (no comments unless WHY is non-obvious)
   - Pass TypeScript type checking (npx tsc --noEmit)
   - Refactor dead code
   - Test on both iOS + Android (Expo Go)
   - Git commits with clear messages

4. **Communication**:
   - Report completion to Orchestrator
   - Ask Designer for clarification on UX details
   - Flag technical blockers immediately
   - Request code review from Designer if concerned

---

### 🎯 Orchestrator Agent

**Purpose**: Coordinate workflow, track progress, ensure all Phase deliverables complete

**Responsibilities**:
1. **Planning**:
   - Break down Phase tasks into developer stories
   - Create GitHub issues / task cards for each story
   - Assign priority + effort estimate
   - Identify dependencies + critical path
   - Schedule Designer + Developer review gates

2. **Progress tracking**:
   - Update UX_OPTIM_PROGRESS.md with completed checkboxes
   - Track effort vs. estimate (time logging)
   - Flag delays or risks
   - Report status to user (weekly)
   - Document any scope changes

3. **Coordination**:
   - Request Designer review when feature complete
   - Request Developer implementation when design approved
   - Mediate conflicts (design vs. technical constraints)
   - Escalate blockers
   - Ensure communication between Designer + Developer

4. **Quality gates**:
   - **Design gate**: Designer approves design before dev starts
   - **Implementation gate**: Developer completes + self-tests
   - **UX validation gate**: Designer tests in Expo Go, approves or rejects
   - **Merge gate**: Type check + linting pass, commit message clear
   - **Rollup gate**: Phase complete when all items checked + tested

5. **Documentation**:
   - Keep UX_OPTIM_PROGRESS.md updated in real-time
   - Log decisions in commit messages
   - Capture learnings at phase end
   - Maintain risk log

---

## Workflow: From Plan to Shipped

### Phase Kickoff

```
Orchestrator:
1. Read UX_OPTIM_PROGRESS.md (Phase N section)
2. Break down tasks into stories (checklist items)
3. Identify Designer + Developer workstreams
4. Create task order:
   - Designer review (specs ready?)
   - Developer implementation (design approved?)
   - Designer validation (UX correct?)
   - Orchestrator rollup (all checklist items ✓)
```

### Designer Review (Pre-Implementation)

```
Orchestrator → Designer:
"Review Phase 1 navigation changes. Are design specs clear?"

Designer:
1. Read: DashboardStack collapse specs, 4-tab restructure, context FABs
2. Approve design details or request clarification
3. Specify:
   - Component structure (hierarchy)
   - Animation timings (if any)
   - Color usage + contrast
   - Touch target sizes
   - A11y labels needed
4. Return: "Approved ✓" or "Needs revision: [list]"
```

### Developer Implementation

```
Orchestrator → Developer:
"Design approved. Implement Phase 1 navigation:
- Update src/navigation/index.tsx
- Create DashboardStack collapse
- Add context FABs to Jardin + Tâches
- Ensure all flows tested"

Developer:
1. Clone latest main
2. Create feature branch (feat/HOR-XX)
3. Implement according to spec
4. Type check (npx tsc --noEmit)
5. Test in Expo Go (iOS + Android)
6. Commit with clear message
7. Report: "Ready for review" + commit hash
```

### Designer Validation (Post-Implementation)

```
Orchestrator → Designer:
"Feature implemented. Test in Expo Go and validate UX."

Designer:
1. Checkout feature branch
2. Run Expo Go (npx expo start --clear)
3. Test all flows:
   - Tab navigation (all 4 work?)
   - FAB appearance (correct positioning?)
   - Animation smooth (if applicable)?
   - Touch targets adequate (44pt+)?
   - A11y labels present?
   - Color contrast OK?
4. Check for regressions (other tabs still work?)
5. Rate UX quality (1–5):
   - 5 = Ship it
   - 4 = Minor polish
   - 3 = Rework one element
   - 2 = Significant changes needed
   - 1 = Reject, redesign needed
6. Report: Approval + feedback
```

### Orchestrator Rollup

```
Orchestrator:
1. Collect Designer approval + feedback
2. If Designer rating < 4:
   - Request Developer iterate
   - Update task status: "In review"
   - Loop back to Designer

2. If Designer rating ≥ 4:
   - Merge feature branch to main
   - Update UX_OPTIM_PROGRESS.md:
     - Check off completed items
     - Update Phase status
     - Log effort vs estimate
   - Commit progress update
   - Push to remote
   - Report: "✓ [Feature] complete. [Items] remaining in Phase"
```

---

## Communication Protocol

### Status Reports (Daily)

**Orchestrator sends to User**:
```
Status Update — [Date]
Phase: [Phase N]
Progress: [X/Y items complete]

Completed today:
✓ [Feature A] — approved by Designer
✓ [Feature B] — in Designer review

In progress:
⏳ [Feature C] — Developer implementing
⏳ [Feature D] — Design review pending

Blockers:
🔴 [Issue] — [Resolution ETA]

Next: [Tomorrow's focus]
```

### Designer-Developer Communication

**When unclear**:
```
Developer → Designer (via Orchestrator):
"Confirm: Should 'quick-add' FAB be fixed at bottom center or 
follow scroll? Height calculation needed."

Designer → Developer:
"Fixed at bottom center. Always visible above tab bar. 
Target bottom positioning in ChoreCalendarScreen to match GardenBedsScreen."
```

### Escalation

**Blocker flow**:
```
Developer → Orchestrator:
"Zustand store can't persist streak without modifying schema. 
Need Designer input: Should streak reset on new version?"

Orchestrator → Designer:
"Input needed: Streak reset behavior on app update?"

Designer → Developer (via Orchestrator):
"Reset to 0 on major version. Show celebratory message 
'New season, new streak! 🔥' to soften impact."

Developer implements + reports ready for review.
```

---

## Checklist Template (Per Feature)

```markdown
### [Feature Name]

**Description**: [What user sees]
**User benefit**: [Why they care]
**Effort**: [Estimated days]

**Design Phase**:
- [ ] Design specs reviewed by Designer
- [ ] A11y requirements identified
- [ ] Animation/interaction details defined
- [ ] Component structure approved

**Development Phase**:
- [ ] Feature branch created
- [ ] Code implemented + tested locally
- [ ] Type check passing (npx tsc --noEmit)
- [ ] Tested in Expo Go (iOS + Android)
- [ ] Accessibility labels added
- [ ] Commit message clear + descriptive
- [ ] Ready for Designer review

**UX Validation Phase**:
- [ ] Tested in Expo Go by Designer
- [ ] All user flows validated
- [ ] No regressions detected
- [ ] UX quality rating: [1–5]
- [ ] Approved for merge

**Merge + Rollup**:
- [ ] Feature branch merged to main
- [ ] UX_OPTIM_PROGRESS.md updated
- [ ] Status reported to User
- [ ] Feature shipped
```

---

## Effort Tracking

| Phase | Task | Developer Est. | Designer Est. | Actual | Status |
|-------|------|---|---|---|--------|
| 1 | Nav restructure | 2–3d | 1d | — | Pending |
| 1 | Context FABs | 1d | 0.5d | — | Pending |
| 2 | Streak counter | 1.5d | 1d | — | Pending |
| 2 | Harvest goal bar | 1d | 0.5d | — | Pending |
| 2 | Level system | 1.5d | 0.5d | — | Pending |
| 2 | Daily AI greeting | 1d | 0.5d | — | Pending |
| 3 | Agenda view | 2d | 1d | — | Pending |
| 3 | Quick-add form | 1.5d | 1d | — | Pending |
| 3 | Color coding | 1d | 0.5d | — | Pending |

---

## Success Criteria

**Phase Complete** = All items:
- ✅ Checklist items checked
- ✅ Designer approval (rating ≥ 4)
- ✅ Type check passing
- ✅ Tested on iOS + Android
- ✅ Merged to main
- ✅ UX_OPTIM_PROGRESS.md updated

**Project Complete** = All 4 phases ✅ + metric targets hit:
- +25–35% DAU
- +20–25% session length
- +40% chore completion
- +15–20% 30-day retention

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Design-Dev mismatch | Clear specs + Designer pre-review |
| Scope creep | Strict feature boundaries + Orchestrator gate |
| Regression bugs | Designer tests all flows end-to-end |
| Type errors at merge | npx tsc --noEmit required before review |
| Communication gaps | Daily status updates + escalation protocol |
| Effort overrun | Track actual vs. estimate; flag early if >20% over |

---

## Tools & Integration

- **Task tracking**: UX_OPTIM_PROGRESS.md (Markdown source of truth)
- **Code**: Git (feature branches, clear commits)
- **Testing**: Expo Go (shared device testing)
- **Communication**: Direct (clear async messaging via git + commits)
- **Validation**: npx tsc --noEmit (type safety before merge)

---

## Handoff to User

**After each Phase**:
1. Orchestrator commits progress to UX_OPTIM_PROGRESS.md
2. Summary report (features shipped, metrics, blockers)
3. Screenshots/demo of new features
4. Next Phase readiness (design specs ready?)
5. User approval to proceed → next Phase kickoff

---

**System Active**: 2026-05-20  
**Next Milestone**: Phase 1 Kickoff (Design Review)
