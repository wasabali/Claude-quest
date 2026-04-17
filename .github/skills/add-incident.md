# Add Incident

Turn a real work problem into a Cloud Quest battle incident. Invoke with a description of the issue (e.g. "Our pods keep OOMKilling in prod after the latest deploy").

# What is an incident in Cloud Quest?

In Cloud Quest, **incidents are wild encounters** — the player stumbles into them while exploring the world, like running into a Pokémon in tall grass. Instead of a creature, the enemy is a technical problem: a CrashLoopBackOff, a cost spike, a failing pipeline.

**The player doesn't know the root cause at the start.** They see symptoms. They have to use an Observability skill to reveal the domain type, then hit it with the right domain for full damage. There's also an SLA timer — if it counts down to zero before the incident is resolved, the player takes HP and reputation damage.

Real incidents from real engineers make the best game content. If you've solved it before, you know exactly what symptoms appear, what the root cause is, and how to fix it.

---

## What you need to provide

Extract from the invocation or ask:

1. **What does the player SEE first?** (the symptom — what error/alert/behavior shows up)
   - Examples: *"Pods in CrashLoopBackOff"*, *"502 errors on the load balancer"*, *"Azure bill 3× normal"*, *"Pipeline stuck at lint step"*

2. **What is the actual root cause?** (hidden from the player until domain is revealed)
   - Examples: *"OOM limit too low"*, *"Misconfigured health check"*, *"Someone left a test cluster running"*, *"Node module cache busted"*

3. **What domain type is it?** (pick one)
   | Domain | Types of incidents it covers |
   |---|---|
   | `linux` | Process issues, file permissions, service failures, cron jobs |
   | `containers` | Docker, image build failures, registry issues, OOM |
   | `kubernetes` | Pod crashes, deployments, ingress, RBAC, resource limits |
   | `cloud` | Azure/AWS/GCP resource issues, networking, billing |
   | `security` | Creds exposed, access denied, cert expired, vulnerability |
   | `iac` | Terraform drift, Pulumi failures, config mismatch |
   | `serverless` | Cold starts, timeout, function errors, event trigger issues |
   | `observability` | *(not used for incidents — observability skills reveal, not damage)* |

4. **How urgent is it?** (sets the SLA timer)
   | Severity | SLA turns | Description |
   |---|---|---|
   | `sev3` | 10 | Low priority — annoying but not on fire |
   | `sev2` | 6 | Significant — affecting some users or team velocity |
   | `sev1` | 3 | Critical — production down, customers impacted |
   | `sev0` | 1 | Everything is on fire. You are paged at 3am. |

5. **Which region does it belong in?** (determines where in the world the player encounters it)
   - `localhost_town` — beginner incidents, safe environment
   - `pipeline_pass` — CI/CD, build issues
   - `container_port` — container and image issues
   - `cloud_citadel` — cloud platform and billing
   - `kernel_caves` — Linux, OS-level, infra
   - `serverless_steppes` — functions, events, cold starts
   - `three_am_tavern` — nightmare scenarios (rare/cursed pool)

6. **Rarity** — how common is this kind of problem?
   - `common` — seen it every week
   - `rare` — happens but not often
   - `cursed` — the kind of thing that haunts your dreams

---

## Step 1 — Create the incident entry

Add to `src/data/incidents.js`. If the file doesn't exist yet, create it with the registry pattern:

```js
const INCIDENTS = {}
export const getById = (id)           => INCIDENTS[id]
export const getAll  = ()             => Object.values(INCIDENTS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
```

Then add the incident:

```js
incident_id_here: {
  id: 'incident_id_here',                      // snake_case, descriptive
  displayName: 'CrashLoopBackOff',             // what the player sees on screen (the symptom)
  domain: 'kubernetes',                        // hidden until revealed
  hp: 80,                                      // how much damage to deal before it's resolved
  slaTimer: 6,                                 // turns before SLA breach (3/6/10/1 for sev1/2/3/0)
  severity: 'sev2',
  symptoms: [
    'Pod has been restarting 47 times.',
    'Last exit code: 137.',
    'Node memory pressure detected.',
  ],
  rootCause: 'Memory limit set too low — container OOMKilled repeatedly.',
  revealDialog: 'Domain revealed: Containers. The pod keeps hitting its memory ceiling.',
  resolveDialog: 'Incident resolved. Memory limits updated. Pod stable.',
  slaBreachDialog: 'SLA breached. This is now a P1. Your manager knows.',
},
```

### Field notes

- **`displayName`**: The error message or symptom as it would appear in a terminal or alert. Not a description — the actual string.
- **`hp`**: How tough is this to fix? `40–60` for sev3, `60–80` for sev2, `80–100` for sev1, `100+` for sev0.
- **`symptoms`**: 2–4 lines of what the player sees before the domain is revealed. Think: what does `kubectl describe`, CloudWatch, or your monitoring tool show?
- **`rootCause`**: The real answer. Only shown after domain is revealed.
- **`revealDialog`**: Shown when an Observability skill reveals the domain. Short. Clinical. Like a real diagnosis.
- **`resolveDialog`**: Shown when the player wins. Satisfying. The problem is fixed.
- **`slaBreachDialog`**: Shown when the timer hits 0. Should sting. This is a real consequence.

---

## Step 2 — Add to the encounter pool

Open `src/data/encounters.js` and add the incident ID to the correct region and rarity pool:

```js
container_port: {
  common: ['crashloopbackoff_oom'],   // ← add here
  rare:   [],
  cursed: [],
},
```

---

## Step 3 — Verify

- [ ] `id` matches the object key
- [ ] `domain` is one of the 7 valid values (not `observability`)
- [ ] `symptoms` has at least 2 entries
- [ ] `slaTimer` matches the severity (1/3/6/10 for sev0/1/2/3)
- [ ] Incident added to the correct pool in `encounters.js`
- [ ] Registry exports unchanged in `incidents.js`

---

## Example — a real incident turned into game content

**The real thing:** *"We had pods OOMKilling in prod after bumping the Node.js image. Someone set the memory limit to 128Mi but the new image uses 200Mi at idle."*

```js
// src/data/incidents.js
crashloopbackoff_oom: {
  id: 'crashloopbackoff_oom',
  displayName: 'CrashLoopBackOff',
  domain: 'containers',
  hp: 75,
  slaTimer: 6,
  severity: 'sev2',
  symptoms: [
    'Pod restart count: 23.',
    'OOMKilled. Exit code 137.',
    'kubectl describe shows memory pressure on the node.',
  ],
  rootCause: 'Memory limit (128Mi) below actual usage after image upgrade (~200Mi idle).',
  revealDialog: 'Domain revealed: Containers. The pod keeps exceeding its memory limit.',
  resolveDialog: 'Memory limits updated to 512Mi. Pod has been running stable for 10 minutes.',
  slaBreachDialog: 'This is now a P1. The on-call rotation has been paged.',
},
```
