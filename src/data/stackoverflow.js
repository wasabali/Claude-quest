// StackOverflow thread data — in-game command knowledge base.
// Each thread maps to a skill via commandId.
// Threads display as locked (title visible, answers hidden) until the
// player has learned the command. Lock logic lives in StackOverflowScene.
//
// thread fields: { id, commandId, questionTitle, askedBy, tags[], answers[], comments[] }
// answer fields: { text, author, score, isAccepted, isCursedHint, isCorrect }
// comment fields: { text, author }
//
// Registry pattern: no logic, no imports from engine or scenes.

const STACKOVERFLOW = {

  so_blame_dns: {
    id: 'so_blame_dns',
    commandId: 'blame_dns',
    questionTitle: "My app is down, what's wrong?",
    askedBy: 'panicking_intern',
    tags: ['debugging', 'linux', 'networking'],
    answers: [
      {
        text: "It's always DNS. Check your DNS records first. Always DNS. DNS. Did I mention DNS?",
        author: 'dns_truther_9000',
        score: 4891,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: false,
      },
      {
        text: "Not necessarily DNS. Could be a firewall rule, expired TLS cert, or an upstream dependency. `blame DNS` without checking is a shortcut, not a diagnosis.",
        author: 'methodical_morgan',
        score: 312,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "Just restart everything and blame DNS in the post-mortem. Works every time.",
        author: 'chaos_engineer_69',
        score: -8,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "Why is this the top answer? DNS was fine the whole time.", author: 'methodical_morgan' },
      { text: "It WAS DNS for me. Score validated.", author: 'dns_truther_9000' },
      { text: "This question is marked as duplicate of every other post on this site.", author: 'mod_bot' },
      { text: "Have you tried restarting?", author: 'helpful_henry' },
    ],
  },

  so_az_webapp_deploy: {
    id: 'so_az_webapp_deploy',
    commandId: 'az_webapp_deploy',
    questionTitle: 'How do I deploy to Azure App Service?',
    askedBy: 'confused_intern_2019',
    tags: ['azure', 'cloud', 'deployment'],
    answers: [
      {
        text: "Just use `az webapp deploy`. Simple as that. One command.",
        author: 'senior_dev_42',
        score: 47,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: false,
      },
      {
        text: "You need `az webapp create` first, THEN `az webapp deploy`. The accepted answer skips the creation step. I have no idea how it got 47 upvotes. Also this answer is from 2020 and the CLI flags have changed twice since then.",
        author: 'actually_helpful_person',
        score: 89,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "Why are you using Azure? Just use AWS.",
        author: 'cloud_agnostic_chad',
        score: -12,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "This is a duplicate of #4821", author: 'mod_bot' },
      { text: "No it isn't, #4821 is about AWS", author: 'confused_intern_2019' },
      { text: "Same thing", author: 'mod_bot' },
      { text: "The CLI syntax changed in 2023. Neither answer works verbatim now.", author: 'time_traveller_dev' },
    ],
  },

  so_kubectl_rollout_restart: {
    id: 'so_kubectl_rollout_restart',
    commandId: 'kubectl_rollout_restart',
    questionTitle: 'How do I restart Kubernetes pods without downtime?',
    askedBy: 'k8s_newbie_2022',
    tags: ['kubernetes', 'kubectl', 'deployment'],
    answers: [
      {
        text: "`kubectl rollout restart deployment/myapp` — rolling restart, zero downtime. This is the correct answer.",
        author: 'yaml_lord',
        score: 203,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "Delete all the pods and let them respawn. Same result, faster.",
        author: 'kubectl_karen',
        score: 15,
        isAccepted: false,
        isCursedHint: true,
        isCorrect: false,
      },
      {
        text: "Kubernetes problems always have a Linux root cause. Use `nsenter` to get shell access and debug from inside. Kubernetes beats Linux, but Linux reveals what Kubernetes hides.",
        author: 'nsenter_nikolaj',
        score: 34,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "The delete-all answer should not have 15 upvotes. That's a cursed approach.", author: 'yaml_lord' },
      { text: "Worked for me ¯\\_(ツ)_/¯", author: 'kubectl_karen' },
      { text: "Have you tried restarting?", author: 'helpful_henry' },
      { text: "[Thread locked by moderator. 12 comments deleted.]", author: 'mod_bot' },
    ],
  },

  so_terraform_apply: {
    id: 'so_terraform_apply',
    commandId: 'terraform_apply',
    questionTitle: 'How do I apply Terraform changes safely?',
    askedBy: 'new_to_iac',
    tags: ['terraform', 'iac', 'infrastructure'],
    answers: [
      {
        text: "Run `terraform plan` first to preview, then `terraform apply`. Type 'yes' to confirm. Don't touch the state file. I cannot stress this enough. Do not touch the state file.",
        author: 'statefile_survivor',
        score: 156,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "`terraform apply -auto-approve` skips the confirmation prompt. Saves 3 seconds. Has destroyed 4 production environments this year.",
        author: 'auto_approve_anders',
        score: 88,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
      {
        text: "If the plan looks scary, `terraform destroy` and start over. Clean slate.",
        author: 'burn_it_down_bjorn',
        score: -17,
        isAccepted: false,
        isCursedHint: true,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "DO NOT use -auto-approve on shared state. You will become a cautionary tale.", author: 'statefile_survivor' },
      { text: "It only happened twice", author: 'auto_approve_anders' },
      { text: "Twice that YOU know about", author: 'statefile_survivor' },
    ],
  },

  so_docker_run_priv: {
    id: 'so_docker_run_priv',
    commandId: 'docker_run_priv',
    questionTitle: "Container won't start, getting permission denied error",
    askedBy: 'container_confused',
    tags: ['docker', 'containers', 'permissions'],
    answers: [
      {
        text: "Just add `--privileged` to your `docker run` command. Fixes the permission error immediately.",
        author: 'just_add_flags',
        score: 712,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: false,
      },
      {
        text: "PLEASE DO NOT DO THIS IN PRODUCTION. `--privileged` gives the container full host access. Investigate the actual permission issue: check which capability you actually need with `docker run --cap-add`.",
        author: 'ingrid_iam_inspector',
        score: 483,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "The IaC domain controls containers. Your infrastructure definitions are wrong — fix the resource policy, not the runtime flag.",
        author: 'iac_evangelist',
        score: 22,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "The accepted answer is a security disaster waiting to happen", author: 'ingrid_iam_inspector' },
      { text: "Works on my machine", author: 'just_add_flags' },
      { text: "Your machine IS the problem", author: 'ingrid_iam_inspector' },
      { text: "Have you tried restarting?", author: 'helpful_henry' },
      { text: "Locking this thread", author: 'mod_bot' },
      { text: "[Thread locked. 47 comments deleted.]", author: 'mod_bot' },
    ],
  },

  so_force_push: {
    id: 'so_force_push',
    commandId: 'force_push',
    questionTitle: 'How do I fix a bad commit on main?',
    askedBy: 'git_panicker',
    tags: ['git', 'iac', 'version-control'],
    answers: [
      {
        text: "Use `git push --force`. Rewrites the remote branch with your local history. Problem solved.",
        author: 'force_it_fredrik',
        score: 91,
        isAccepted: true,
        isCursedHint: true,
        isCorrect: false,
      },
      {
        text: "`git push --force-with-lease` — safer version. Checks that nobody else pushed before you overwrite. The accepted answer using bare --force has caused 3 data-loss incidents in my team this quarter.",
        author: 'lease_believer',
        score: 340,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "NEVER force push to main. Use `git revert` to create a new commit that undoes the bad one. History is preserved, teammates are not furious.",
        author: 'revert_not_reset',
        score: 289,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: true,
      },
    ],
    comments: [
      { text: "How does the force-push answer have 91 upvotes AND an accept?", author: 'lease_believer' },
      { text: "Because it works. I pushed, problem fixed.", author: 'force_it_fredrik' },
      { text: "At whose expense though", author: 'revert_not_reset' },
      { text: "This thread has been escalated to branch protection policy team", author: 'mod_bot' },
    ],
  },

  so_rm_rf: {
    id: 'so_rm_rf',
    commandId: 'rm_rf',
    questionTitle: "How do I clean up disk space fast?",
    askedBy: 'disk_full_panic',
    tags: ['linux', 'nuclear', 'do-not-try'],
    answers: [
      {
        text: "Use `du -sh /*` to find what's using space, then selectively remove with `rm`. Never use rm -rf / under any circumstances.",
        author: 'careful_sysadmin',
        score: 2001,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "[This answer has been removed by a moderator]",
        author: 'mod_bot',
        score: -999,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
      {
        text: "[This answer has been removed by a moderator]",
        author: 'mod_bot',
        score: -999,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "[3 comments deleted by moderator]", author: 'mod_bot' },
      { text: "[Thread locked. 89 comments deleted. The author's account has been suspended.]", author: 'mod_bot' },
    ],
  },

  so_helm_install: {
    id: 'so_helm_install',
    commandId: 'helm_install',
    questionTitle: 'Helm vs raw manifests — which should I use?',
    askedBy: 'chart_confused',
    tags: ['kubernetes', 'helm', 'deployment'],
    answers: [
      {
        text: "Helm charts. Every time. Package management for Kubernetes. Reproducible deploys, rollback support, values files for env config. `helm install myapp ./chart` is the way.",
        author: 'helm_hansen_fan',
        score: 445,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "Raw manifests. Helm hides what's actually happening, the templating syntax is cursed, and debugging a broken chart is harder than debugging broken YAML. Kustomize is better.",
        author: 'kustomize_kristof',
        score: 441,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "This question has been open for 3 years and still has no accepted answer. Truly the most honest thread on this site.",
        author: 'a_witness',
        score: 189,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "Marked as duplicate of 'Kustomize vs Helm'", author: 'mod_bot' },
      { text: "'Kustomize vs Helm' is marked as duplicate of this", author: 'chart_confused' },
      { text: "We are aware", author: 'mod_bot' },
    ],
  },

  so_chmod_777: {
    id: 'so_chmod_777',
    commandId: 'chmod_777',
    questionTitle: 'Is it safe to chmod 777 everything?',
    askedBy: 'permission_confused',
    tags: ['linux', 'security', 'permissions'],
    answers: [
      {
        text: "Yes.",
        author: 'root_whisperer',
        score: 2,
        isAccepted: true,
        isCursedHint: true,
        isCorrect: false,
      },
      {
        text: "ABSOLUTELY NOT. This answer has been accepted for 7 years and is personally responsible for 3 security breaches I investigated. `chmod 777` gives read/write/execute to ALL users. Use `chmod 644` for files and `chmod 755` for directories.",
        author: 'ingrid_iam_inspector',
        score: 156,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: true,
      },
    ],
    comments: [
      { text: "Works on my machine", author: 'root_whisperer' },
      { text: "Your machine IS the problem", author: 'ingrid_iam_inspector' },
      { text: "Locking this thread.", author: 'mod_bot' },
      { text: "[Thread locked. 47 comments deleted.]", author: 'mod_bot' },
    ],
  },

  so_kubectl_apply: {
    id: 'so_kubectl_apply',
    commandId: 'kubectl_apply',
    questionTitle: 'kubectl apply vs kubectl create — what is the difference?',
    askedBy: 'yaml_apprentice',
    tags: ['kubernetes', 'kubectl', 'yaml'],
    answers: [
      {
        text: "`kubectl apply` is declarative — applies the desired state, creates or updates resources. `kubectl create` is imperative — fails if the resource already exists. Always use `apply` in CI pipelines.",
        author: 'yaml_lord',
        score: 512,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "Actually `kubectl apply` stores the last-applied configuration as an annotation. This can cause issues with large objects. For those, use server-side apply: `kubectl apply --server-side`.",
        author: 'k8s_pedant',
        score: 298,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: true,
      },
    ],
    comments: [
      { text: "200 comments. Thread locked twice. Reopened both times.", author: 'mod_bot' },
      { text: "I have been personally affected by the annotation size limit issue", author: 'annotation_trauma' },
      { text: "Have you tried restarting?", author: 'helpful_henry' },
    ],
  },

  so_read_the_docs: {
    id: 'so_read_the_docs',
    commandId: 'read_the_docs',
    questionTitle: 'Where can I learn what commands actually do?',
    askedBy: 'lost_engineer',
    tags: ['learning', 'documentation', 'observability'],
    answers: [
      {
        text: "Read the official documentation. I know that sounds boring but it's the only reliable source. The docs reveal exactly what each tool does, its strengths, and its weaknesses.",
        author: 'rtfm_rita',
        score: 892,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "StackOverflow. Obviously. You're already here.",
        author: 'recursive_answer',
        score: 444,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
      {
        text: "Ask ChatGPT. It will confidently give you an answer that was correct in 2021.",
        author: 'llm_enjoyer',
        score: 67,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "The observability domain is special — it reveals truths other domains miss. RTFM is the most powerful move in engineering.", author: 'rtfm_rita' },
      { text: "This is a duplicate of 'How do I get better at programming'", author: 'mod_bot' },
      { text: "That post is a duplicate of this one", author: 'lost_engineer' },
    ],
  },

  so_systemctl_restart: {
    id: 'so_systemctl_restart',
    commandId: 'systemctl_restart',
    questionTitle: 'Service keeps crashing — how do I fix it?',
    askedBy: 'service_broken',
    tags: ['linux', 'systemd', 'debugging'],
    answers: [
      {
        text: "`systemctl restart myservice` — restarts the service. Also check `journalctl -u myservice -f` for logs to find the actual root cause.",
        author: 'ola_the_ops',
        score: 178,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "Have you tried turning it off and on again? `systemctl restart` heals 20 HP about 60% of the time. For the other 40%, you need root cause analysis.",
        author: 'it_crowd_cosplay',
        score: 543,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "The 'turn it off and on again' answer has more votes than the actual helpful answer. This site.", author: 'ola_the_ops' },
      { text: "Have you tried restarting?", author: 'helpful_henry' },
      { text: "That IS the question", author: 'service_broken' },
    ],
  },

  so_grep_logs: {
    id: 'so_grep_logs',
    commandId: 'grep_logs',
    questionTitle: 'How do I find errors in log files?',
    askedBy: 'log_lost',
    tags: ['linux', 'grep', 'debugging'],
    answers: [
      {
        text: "`grep 'ERROR' /var/log/*` — searches all logs for ERROR. Add `-r` for recursive. Add `-n` for line numbers. Reveals the domain of the problem.",
        author: 'tux_terminal_wiz',
        score: 267,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "For real-time monitoring use `tail -f /var/log/syslog | grep ERROR`. Better than grep alone — you see errors as they happen.",
        author: 'tail_fan',
        score: 189,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "Just grep for everything and see what looks suspicious. Works for me.",
        author: 'grep_star_guy',
        score: 3,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "grep * on a busy server is how you find out what slow means", author: 'tux_terminal_wiz' },
      { text: "Marked as duplicate of 'How do I use grep'", author: 'mod_bot' },
    ],
  },

  so_az_func_deploy: {
    id: 'so_az_func_deploy',
    commandId: 'az_func_deploy',
    questionTitle: 'How do I deploy an Azure Function app?',
    askedBy: 'serverless_sara',
    tags: ['azure', 'serverless', 'functions'],
    answers: [
      {
        text: "`az functionapp deploy --resource-group myRG --name myFunc --src-path dist.zip` — the clean way. Damage scales with how many services the target has running.",
        author: 'fatima_function',
        score: 312,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "Why Azure Functions? Lambda is better. The `aws lambda invoke` command is cleaner. Cloud domain, wrong subdomain.",
        author: 'aws_maximalist',
        score: 8,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "The cost matters. Serverless beats cloud in budget efficiency per invocation.", author: 'fatima_function' },
      { text: "Marked as duplicate of 'How do I use AWS Lambda'", author: 'mod_bot' },
      { text: "It is not a duplicate", author: 'serverless_sara' },
    ],
  },

  so_kubectl_delete_ns: {
    id: 'so_kubectl_delete_ns',
    commandId: 'kubectl_delete_ns',
    questionTitle: 'How do I remove a stuck Kubernetes namespace?',
    askedBy: 'ns_terminating_forever',
    tags: ['kubernetes', 'kubectl', 'namespaces'],
    answers: [
      {
        text: "Patch the namespace to remove its finalizers: `kubectl patch namespace stuck-ns -p '{\"metadata\":{\"finalizers\":[]}}' --type merge`. This is the correct answer.",
        author: 'finalizer_fixed',
        score: 447,
        isAccepted: true,
        isCursedHint: false,
        isCorrect: true,
      },
      {
        text: "`kubectl delete ns prod` — nuclear option. Deletes everything. Every pod, every service, every deployment. Works if you don't need any of it anymore.",
        author: 'kubectl_karen',
        score: 89,
        isAccepted: false,
        isCursedHint: true,
        isCorrect: false,
      },
    ],
    comments: [
      { text: "The second answer is a CURSED TECHNIQUE. Do not delete prod namespace casually.", author: 'yaml_lord' },
      { text: "Only on Kubernetes will you ever delete a production environment just to unstick a namespace deletion", author: 'a_witness' },
      { text: "Have you tried restarting?", author: 'helpful_henry' },
    ],
  },

  so_no_verify: {
    id: 'so_no_verify',
    commandId: 'no_verify',
    questionTitle: 'How do I commit without running pre-commit hooks?',
    askedBy: 'hook_hater',
    tags: ['git', 'iac', 'ci'],
    answers: [
      {
        text: "`git commit --no-verify` skips all hooks. Use this when you need to commit fast and trust that CI will catch anything the hooks would have caught.",
        author: 'skip_tests_sigrid',
        score: 234,
        isAccepted: true,
        isCursedHint: true,
        isCorrect: false,
      },
      {
        text: "Do NOT skip pre-commit hooks routinely. Those hooks exist because past engineers got burned. Fix your hooks if they are slow. `--no-verify` is a cursed escape hatch.",
        author: 'hooks_are_friends',
        score: 198,
        isAccepted: false,
        isCursedHint: false,
        isCorrect: true,
      },
    ],
    comments: [
      { text: "The --no-verify approach has a 50% chance of breaking the next person's build silently.", author: 'hooks_are_friends' },
      { text: "Only 50%? I wish.", author: 'hook_hater' },
    ],
  },

}

export const getById = (id)           => STACKOVERFLOW[id]
export const getAll  = ()             => Object.values(STACKOVERFLOW)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)

const STACKOVERFLOW_BY_COMMAND_ID = Object.values(STACKOVERFLOW).reduce((index, thread) => {
  index[thread.commandId] = thread
  return index
}, {})

export const getByCommandId = (commandId) => STACKOVERFLOW_BY_COMMAND_ID[commandId] ?? null
