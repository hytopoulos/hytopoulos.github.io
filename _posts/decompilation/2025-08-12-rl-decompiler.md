---
layout: post
title:  "RL Decompiler"
date:   2025-08-12
categories: machine learning
usemathjax: true
image: /assets/img/rl-decompiler/score_mean.png
---

## Introduction

Decompilation is the process of converting compiled machine code back into source code. Decompilers, such as IDA Pro and Ghidra, are typically used to reverse engineer software into psuedocode. Decompilers are largely based on static analysis and rule-based heuristics. In Ghidra, all instruction sets are first converted to an intermediate representation, and then decompiled into a C-like psuedocode. IDA is closed-source but likely operates the same way. Neither offers readily compilable source code.

In this post, we explore the use of reinforcement learning to adapt Qwen2.5-Coder-7B-Instruct into an end-to-end decompiler for C++, with two goals:

1. Generate compilable source code that resembles the original assembly.
2. Generate source code that compiles into the exact same assembly as the original.

## Why reinforcement learning is useful for these tasks

Decompilation is a translation task. Translation tasks are often trained using cross-entropy loss on a parallel corpus and there are many existing AI decompilers that are trained in this way. However, there is no way to know if the generated code is compilable. Using reinforcement learning, we can encourage the model to generate compilable code by rewarding it for doing so, addressing goal #1.

Qwen Coder is already trained on a large corpus of code, probably including parallel corpora of C++/ASM, so it likely possesses some understanding of the relationship between C++ and assembly. Using reinforcement learning, we can collapse the search space of possible translations, addressing goal #2.

## Algorithm details

First, we must define a metric for the quality of a decompilation. For this experiment, we use the Levenshtein distance between the original assembly and the generated assembly. The Levenshtein distance is the minimum number of single-character edits (insertions, deletions or substitutions) required to change one string into the other. A more robust approach might use a token-wise edit distance. But in theory, we should be able to achieve a Levenshtein distance of 1, which would indicate that the generated assembly is identical to the original assembly. When the code does not compile, the reward is 0.

We use the `verl` library for reinforcement learning with Group Relative Policy Optimization (GRPO). For a given sample, GRPO generates several candidate completions, then optimizes the policy to prefer completions within the group that receive comparatively higher rewards. For example, if we prompt Qwen Coder to generate 10 potential decompilations for a given assembly listing, some portion might fail to compile (0 reward) and will be ranked the lowest. Other completions might identify that the assembly implements a certain algorithm and provide a vague implementation. This would be ranked higher than those that fail to compile, but lower than a literal translation that attends to each instruction.

## Dataset

The source of our training data is Google DeepMind's `code_contests` dataset, which is one of the largest datasets of readily compileable code (as far as I'm aware).

We can use the following python function to compile the code from the dataset into assembly, then split the assembly into separate functions.

```python
def compile_and_split(sample: dict, *, sample_id: int) -> Optional[Dict[str, str]]:

    flags = [
        "-O2", "-std=c++17",
        # filter out directives and debugging information
        "-fno-verbose-asm", "-fno-asynchronous-unwind-tables",
        "-fno-stack-protector", "-fno-ident", "-g0",
        "-fno-inline-functions", "-fno-inline-functions-called-once",
        "-fno-implicit-templates", "-fno-rtti", "-fno-exceptions",
    ]

    # compile to a human-readable assembly listing
    res = subprocess.run(
        ["g++", *flags, "-x", "c++", "-", "-S", "-o", "-"],
        input=tu.encode(), stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    if res.returncode:
        return None
    asm_text = res.stdout.decode("utf-8", "replace")
    asm_text = strip_directives(asm_text)

    # split into functions
    funcs, current, buf = {}, None, []
    for line in asm_text.splitlines(keepends=True):
        # ...
```

## Setting up the Environment

There are many cloud providers offering compute resources, but I chose [Modal.com](https://modal.com/) for the $30 of credits it offers in its free tier, which is enough to train this model.

Modal provides a [verl example](https://modal.com/docs/examples/grpo_verl) that we can adapt to train our model.

## Training

<figure>
<img src="{{ page.image }}">
<figcaption>Fig 1. </figcaption>
</figure>

The model converges at ~30 steps (6 1/2 hours). Each step processes around 700,000 tokens, so it took around 21 million tokens to converge.

## Evaluation

Let's compare our model to GPT 4.1.


```python
client = OpenAI()

def gen_gpt5(prompt: str) -> str:
    messages = [
        {"role": "system", "content": "You are a precise C++ decompiler. Return only a single fenced ```cpp code block."},
        {"role": "user", "content": prompt},
    ]
    resp = client.chat.completions.create(
        model=GPT5_MODEL,
        messages=messages,
        # temperature=TEMPERATURE,
        max_completion_tokens=MAX_NEW_TOKENS,
    )
    return resp

# Build prompts and refs
prompts = df_val["prompt"].tolist()
refs    = df_val["ground_truth"].tolist()

# GPT-4.1
gpt4_comps = generate_gpt4(prompts)
gpt4_rewards, gpt4_metadata = compute_rewards(gpt4_comps, refs)
gpt4_mean = float(np.mean(gpt4_rewards)) if gpt4_rewards else 0.0

# Local model
tok, mdl = load_qwenrl_model()
local_comps = generate_qwenrl(prompts, tok, mdl)
local_rewards, qwenrl_metadata = compute_rewards(local_comps, refs)
local_mean = float(np.mean(local_rewards)) if local_rewards else 0.0
```

Comparing the results, we see that our model is able to consistently produce source code that compiles. Of the code that does successfully compile, our model increases the Levenshtein score by 19.6%.

```bash
==== Evaluation Summary ====
Samples: 39
qwenrl (hytopot/DeCMP-cpp-gcc-10-amd64): mean reward@1 = 0.3946 | tel {'no_code': 7, 'comp_fail': 0, 'empty_funcs': 0, 'n': 39}
GPT-4.1 (     gpt-4.1): mean reward@1 = 0.3298 | tel={'no_code': 17, 'comp_fail': 2, 'empty_funcs': 0, 'n': 39}
```

## Conclusion

This was a simple experiment to show how reinforcement learning can leverage LLMs for decompilation tasks. There are many improvements that can be made, such as pretraining on a C++/ASM corpus, encouraging struct generation, or developing separate tasks. One such task is to give the model partial C++ implementation, and ask it to "improve the score", which would allow the model to potentially iterate on its own in an agentic manner.
