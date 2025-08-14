---
layout: post
title:  "RL Decompiler"
date:   2025-08-12
categories: machine learning
usemathjax: true
image: /rl-decompiler/score_mean.png
---

## Introduction

Decompilation is the process of converting compiled machine code back into source code. Reverse engineers use "decompiler" software, such as IDA Pro and Ghidra, to reverse engineer software. These decompilers are based on static analysis and rule-based heuristics. 

In this post, we explore the use of reinforcement learning to train a LoRA adapter for Qwen2.5-Coder-7B-Instruct. We are going to set the bar high, and try to generate C++ code that compiles into the exact same assembly as the original.

## Why RL?

Decompilation is a translation task, which is often trained using cross-entropy. However, Qwen Coder is already trained on a large corpus of code, likely including parallel corpora of C++/ASM. We can make the argument that the model is already capable of this task, and that reinforcement learning can be used to improve it. One reason Qwen is not already a decompiler is that there are distinct 

* We want to learn the compiler signal.

## Dataset

We source our training data from deepmind code_contests, which is the largest dataset of readily compileable code (as far as I'm aware).

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

We can train our model on [Modal.com](https://modal.com/). Modal offers $30/month in credits for its free tier, which is enough to train this model.

I adapted the [verl example](https://modal.com/docs/examples/grpo_verl) to train the model.

## Training

I left the model to run overnight.

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
