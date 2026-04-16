# Getting Started

Welcome to Cloud Quest! You're a fresh junior cloud engineer at NorCloud AS, a Norwegian cloud consultancy. Your goal? Survive incidents, beat other engineers, and climb all the way to Principal Engineer.

---

## How to Play

### Running the Game

```bash
npm install
npm run dev       # Opens at localhost:5173
```

The game runs in your browser — no install needed beyond npm.

### Controls

Cloud Quest uses a classic D-pad + two-button layout, just like a GameBoy:

| Key | Action |
|---|---|
| **Arrow keys** | Move / Navigate menus |
| **Z** | Confirm / Advance dialog |
| **X** | Cancel / Back |
| **Enter** | Interact in the world |

---

## Your First Steps

### Prologue — "Hello World"

You start in **Professor Pedersen's Lab** in Localhost Town. The professor gives you your **starter skill deck** — a small set of CLI commands across a few domains. Your first decision matters: which domain focus to start with.

**Your starter skills include:**
- `kubectl rollout restart` — Clears enemy buffs, Kubernetes domain
- `read the docs` — Reveals enemy weaknesses (Observability)
- `blame DNS` — A shortcut move that confuses everyone, including you
- `az webapp deploy` — Your first cloud attack (30 damage)

### First Quest — Old Margaret's Bakery

Your first real quest comes from **Old Margaret**, who runs a bakery in Localhost Town. Her website keeps going down. Help her deploy it to Azure App Service. This teaches you the basics of cloud deployment and quest structure.

**Tip:** Listen to what Margaret says. The correct answer involves Azure App Service, not "more RAM."

### First Battle

Step into the tall grass (metaphorically) and you'll encounter your first **incident** — a technical problem you need to solve. Incidents show you symptoms first. Use an Observability skill like `read the docs` to reveal the enemy's domain, then hit it with the right type of command.

---

## Core Concepts

### Skills = Real CLI Commands

Every skill in the game is a real cloud, DevOps, or Linux command. When you use `kubectl apply -f` in battle, that's a real Kubernetes command. The game teaches you what these commands actually do.

See the [Skills Reference](skills-reference.md) for every skill in the game.

### Domains = Type System

Every skill and every enemy belongs to one of 8 domains. Think of them like types in Pokémon:

| Domain | What It Covers |
|---|---|
| 🐧 Linux | Processes, files, permissions, services |
| 🔒 Security | IAM, certs, firewalls, secrets |
| ⚡ Serverless | Functions, cold starts, event triggers |
| ☁️ Cloud | Azure/AWS/GCP, billing, deployments |
| 🏗️ IaC | Terraform, Git, CI/CD pipelines |
| 🐳 Containers | Docker, images, registries |
| ☸️ Kubernetes | Pods, Helm, kubectl, clusters |
| 📊 Observability | Monitoring, logging, alerting (support — reveals info, no damage) |

Domains have a matchup cycle — each one beats another. Check the [Combat Guide](combat-guide.md) for the full breakdown.

### Two Types of Battles

1. **Incidents** — Wild encounters. A technical problem appears with symptoms. You diagnose it, then fix it before the SLA timer runs out.
2. **Engineer Battles** — Trainer fights. Another engineer challenges you. They telegraph their next move. Beat them well enough and they teach you their signature skill.

### Saving Your Game

Cloud Quest uses file-based saves — `.cloudquest` files. Think of it like `git commit` for your progress. There's no cloud save (ironic, right?). Export your save file and keep it safe.

---

## What to Do Next

1. **Explore Localhost Town** — Talk to every NPC. Margaret has a quest. Professor Pedersen has wisdom.
2. **Build your skill deck** — You can hold up to 6 active skills. Choose wisely based on what domains you expect to face.
3. **Head to Pipeline Pass** — Your first real challenge area. CI/CD encounters and your first gym await.
4. **Read the [Combat Guide](combat-guide.md)** — Understanding domain matchups is the difference between Optimal and Nuclear solutions.

---

## Stuck?

Check the [Tips & Tricks](tips-and-tricks.md) page for hints, strategy advice, and spoiler-free guidance.

---

*"Be careful in the tall grass — incidents love to ambush young engineers." — Old Margaret*
