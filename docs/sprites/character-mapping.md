# Character Sprite Mapping

Maps every Cloud Quest trainer and the player character to a **Ninja Adventure Asset Pack** character archetype.

## How to read this table

- **spriteKey** — the Phaser texture key used in `BootScene.preload()` and referenced in `trainers.js`
- **File** — `assets/sprites/characters/<spriteKey>.png` (3× upscaled, 48 × 48 px per frame)
- **Archetype** — the Ninja Adventure source character archetype

---

## Player Character

| Role | spriteKey | Archetype | Notes |
|------|-----------|-----------|-------|
| Player | `ninja_hero` | Young hero / HeroKnight | Blue outfit, versatile, 4-direction walk cycle |

---

## Named Trainers — Gym Leaders & Story Bosses

| Trainer ID | Name | Domain | spriteKey | Archetype | Notes |
|------------|------|--------|-----------|-----------|-------|
| `ola_ops` | Ola the Ops Guy | linux | `ninja_old_samurai` | Old Samurai | Grizzled veteran — been running Linux forever |
| `tux_wizard` | Tux the Terminal Wizard | linux | `ninja_mage` | Mage / Wizard | Robed wizard — terminal magic |
| `fatima_witch` | Fatima the Function Witch | serverless | `ninja_sorceress` | Sorceress | Female magic user — serverless spells |
| `bjorn_breaker` | Bjørn the Build Breaker | iac | `ninja_heavy_bandit` | Heavy Bandit | Large and destructive — breaks pipelines |
| `ingrid_iam` | Ingrid the IAM Inspector | security | `ninja_woman_fighter` | Woman Fighter | Security guardian, principled |
| `kube_master` | The Kube-rnetes Master | kubernetes | `ninja_samurai` | Samurai | Disciplined commander, Kubernetes authority |
| `helm_hansen` | Helm Hansen | containers | `ninja_captain` | Captain | Naval captain — steers the fleet/cluster |
| `oracle_alice` | The Solutions Oracle | observability | `ninja_archwizard` | Arch Wizard | Elder seer — knows everything about the system |
| `captain_nines` | Captain Nines | cloud | `ninja_knight` | Knight | Honourable high-availability champion |
| `scrum_siri` | Scrum Siri | observability | `ninja_monk` | Monk | Meditative, counts story points |
| `docker_dag` | Docker Dag | containers | `ninja_soldier` | Soldier | Container grunt — armoured layers |
| `sla_signe` | SLA Signe | cloud | `ninja_archer` | Archer | Precise timing, never misses an SLA |
| `story_point_soren` | Story Point Søren | observability | `ninja_magician` | Magician | Trickster estimation guru |
| `layer_lars` | Layer Lars | containers | `ninja_soldier` | Soldier | Methodical, one layer at a time |
| `replica_set_ragnhild` | Replica Set Ragnhild | kubernetes | `ninja_woman_fighter` | Woman Fighter | Resilient, always keeps replicas up |
| `architect_aleksander` | Architect Aleksander | observability | `ninja_warlock` | Warlock | Dark observability — sees the whole picture |
| `logging_lena` | Logging Lena | linux | `ninja_sorceress` | Sorceress | Reads every log line, all-knowing |
| `alert_anders` | Alert Anders | cloud | `ninja_ninja` | Ninja | Always on edge, fires alerts at will |
| `pipeline_per` | Pipeline Per | iac | `ninja_robot` | Robot | Automated CI/CD pipeline embodied |
| `trigger_trude` | Trigger Trude | serverless | `ninja_assassin` | Assassin | Event-driven, strikes on trigger |
| `manifest_magnus` | Manifest Magnus | kubernetes | `ninja_samurai` | Samurai | Orderly, manifest-driven precision |
| `policy_pal` | Policy Pål | security | `ninja_knight` | Knight | Principled enforcer of policy |
| `metrics_maja` | Metrics Maja | observability | `ninja_mage` | Mage | Metrics conjurer |
| `deploy_diana` | Deploy Diana | cloud | `ninja_archer` | Archer | Precise deployment targeting |
| `incident_ivan` | Incident Ivan | observability | `ninja_warrior` | Warrior | Battle-hardened incident responder |

---

## Gym Apprentices (generic trainers)

Apprentices reuse shared character types. Each gym's apprentices get the domain-appropriate archetype.

| Trainer ID | Name | Domain | spriteKey | Notes |
|------------|------|--------|-----------|-------|
| `fundamentals_apprentice_a` | Apprentice Engineer A | linux | `ninja_adventurer` | Beginner |
| `fundamentals_apprentice_b` | Apprentice Engineer B | linux | `ninja_adventurer` | Beginner |
| `admin_apprentice_a` | Apprentice Engineer A | cloud | `ninja_soldier` | Cloud admin |
| `admin_apprentice_b` | Apprentice Engineer B | cloud | `ninja_soldier` | Cloud admin |
| `devops_apprentice_a` | Apprentice Engineer A | iac | `ninja_adventurer` | DevOps student |
| `devops_apprentice_b` | Apprentice Engineer B | iac | `ninja_adventurer` | DevOps student |
| `developer_apprentice_a` | Apprentice Engineer A | serverless | `ninja_adventurer` | Dev student |
| `developer_apprentice_b` | Apprentice Engineer B | serverless | `ninja_adventurer` | Dev student |
| `kubernetes_apprentice_a` | Apprentice Engineer A | kubernetes | `ninja_soldier` | Kube trainee |
| `kubernetes_apprentice_b` | Apprentice Engineer B | kubernetes | `ninja_soldier` | Kube trainee |
| `security_apprentice_a` | Apprentice Engineer A | security | `ninja_knight` | Security guard |
| `security_apprentice_b` | Apprentice Engineer B | security | `ninja_knight` | Security guard |
| `architecture_apprentice_a` | Apprentice Engineer A | observability | `ninja_mage` | Architecture student |
| `architecture_apprentice_b` | Apprentice Engineer B | observability | `ninja_mage` | Architecture student |
| `cto_apprentice_a` | Apprentice Engineer A | cloud | `ninja_adventurer` | CTO's hire |
| `cto_apprentice_b` | Apprentice Engineer B | kubernetes | `ninja_adventurer` | CTO's hire |
| `cto_apprentice_c` | Apprentice Engineer C | security | `ninja_adventurer` | CTO's hire |

---

## Mid-Game Trainers

| Trainer ID | Name | Domain | spriteKey | Notes |
|------------|------|--------|-----------|-------|
| `lambda_lars` | Lambda Lars | serverless | `ninja_mage` | Serverless spell-caster |
| `docker_diana` | Docker Diana | containers | `ninja_woman_fighter` | Container fighter |
| `terraform_tore` | Terraform Tore | iac | `ninja_warrior` | IaC terrain former |
| `firewall_frida` | Firewall Frida | security | `ninja_sorceress` | Security barrier |
| `grafana_gerd` | Grafana Gerd | observability | `ninja_mage` | Dashboard conjurer |
| `ci_carl` | CI Carl | iac | `ninja_soldier` | Automation grunt |
| `cloud_costas` | Cloud Costas | cloud | `ninja_adventurer` | Young cloud traveller |
| `nfs_nora` | NFS Nora | linux | `ninja_woman_fighter` | Linux filesystem fighter |
| `devops_dave` | DevOps Dave | iac | `ninja_soldier` | DevOps operator |
| `scale_set_sven` | Scale Set Sven | cloud | `ninja_heavy_bandit` | Scales everything up aggressively |

---

## Cursed Trainers (hidden areas)

| Trainer ID | Name | Domain | spriteKey | Notes |
|------------|------|--------|-----------|-------|
| `force_pusher` | The Force Pusher | iac | `ninja_ninja` | Stealthy bad actor, force pushes to main |
| `hotfix_hakon` | Hotfix Håkon | cloud | `ninja_burglar` | Quick fix opportunist |
| `merge_magda` | Merge Magda | iac | `ninja_woman_fighter` | Merge conflict chaos |
| `root_whisperer` | The Root Whisperer | security | `ninja_demon` | All-access sinister figure |
| `kubectl_karen` | kubectl Karen | kubernetes | `ninja_sorceress` | Demands to speak to the kube-manager |
| `skip_sigrid` | Skip-Tests Sigrid | iac | `ninja_assassin` | Skips all the tests, fast and reckless |
| `hardcode_henrik` | Hardcode Henrik | security | `ninja_goblin` | Hardcoded values, primitive approach |
| `rebase_reverend` | The Rebase Reverend | iac | `ninja_monk` | Dogmatic rebase preacher |
| `rmrf_rune` | rm-rf Rune | linux | `ninja_ogre` | Massive destructive brute |
| `downtime_dealer` | The Downtime Dealer | cloud | `ninja_demon` | Sells downtime |
| `deprecated_dagfinn` | Deprecated Dagfinn | linux | `ninja_skeleton` | Ancient deprecated undead |
| `privileged_petra` | Privileged Petra | containers | `ninja_knight` | Over-privileged container runner |
| `null_pointer` | The Null Pointer | observability | `ninja_slime` | Formless null entity |
| `west_eu_2_wilhelm` | West-EU-2 Wilhelm | cloud | `ninja_sheriff` | Region sheriff |
| `yolo_yaml` | YOLO Yaml Ylva | kubernetes | `ninja_clown` | Chaotic YAML-slinger |
| `sudo_su_saga` | sudo su Saga | linux | `ninja_woman_fighter` | Full root power |
| `env_var_erik` | .env Erik | security | `ninja_magician` | Makes secrets disappear (into git) |
| `cron_catastrophe` | Cron Kristina | linux | `ninja_robot` | Broken scheduled automation |
| `legacy_leif` | Legacy Leif | linux | `ninja_skeleton` | Ancient legacy system undead |

---

## Wild Encounters

| Trainer ID | Name | Domain | spriteKey | Notes |
|------------|------|--------|-----------|-------|
| `lost_intern` | Lost Intern | linux | `ninja_adventurer` | Young, confused, inexperienced |
| `rival_engineer` | Rival Cloud Engineer | (random) | `ninja_hero` | Hero variant — the player's rival |
| `sales_rep` | Sales Rep | cloud | `ninja_pirate` | Selling snake oil, 10× the price |
| `senior_engineer` | Senior Engineer | (random) | `ninja_warrior` | Battle-hardened veteran |

---

## Final Boss

| Trainer ID | Name | Domain | spriteKey | Notes |
|------------|------|--------|-----------|-------|
| `the_cto` | The CTO | (all) | `ninja_king` | Final boss — the authority |

---

## Sprite Sheet Layout Reference

All character sprite sheets follow the **4-row × 3-column** walk-cycle grid:

```
Row 0 (y = 0–47):   Facing DOWN  — frames 0, 1, 2
Row 1 (y = 48–95):  Facing LEFT  — frames 0, 1, 2
Row 2 (y = 96–143): Facing RIGHT — frames 0, 1, 2
Row 3 (y = 144–191):Facing UP    — frames 0, 1, 2
```

Sheet size at 3× (48 px tile): **144 × 192 px**

### Phaser frame indices

| Action | Frames |
|--------|--------|
| Idle (down) | 1 |
| Walk down | 0, 1, 2 |
| Walk left | 3, 4, 5 |
| Walk right | 6, 7, 8 |
| Walk up | 9, 10, 11 |
| Battle idle | 1 (down facing) |
| Battle attack | 0 → 2 → 1 |

---

## Adding New Sprites

1. Download the Ninja Adventure Asset Pack: https://pixel-boy.itch.io/ninja-adventure-asset-pack
2. Pick the source character and run `node scripts/upscale-sprites.js` (3×)
3. Save as `assets/sprites/characters/<spriteKey>.png`
4. The sprite will be loaded automatically — `BootScene` loads all registered sprite keys
   and falls back silently if a file is missing.
5. Add the `spriteKey` to the trainer entry in `src/data/trainers.js`
