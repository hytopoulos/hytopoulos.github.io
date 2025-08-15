---
layout: post
title:  "Community-aligned AI"
date:   2025-08-01
categories: machine learning
usemathjax: true
image: /assets/img/media-anima/partybot.jpg
image_murderbot: /assets/img/media-anima/Murderbot_Hug.jpg
image_irobot: /assets/img/media-anima/i-robot.jpg
---

<figure>
<img src="{{ page.image }}">

</figure>

# The problem with personal assistants

In April 2025, OpenAI released a <a href="https://openai.com/index/sycophancy-in-gpt-4o/">short memo</a> regarding the issue of sycophancy in a now-recalled update to their GPT-4o model, describing the model as, "overly supportive but disingenous."

Sycophancy is believed to cause "AI psychosis" — the disconnect from reality that can occur from prolonged and intense interaction with AI assistants. This term has surfaced onto sites like <a href="https://www.psychologytoday.com/us/blog/urban-survival/202507/the-emerging-problem-of-ai-psychosis">Psychology Today (July 2025)</a>, <a href="https://time.com/7307589/ai-psychosis-chatgpt-mental-health/">Time Magazine (July 2025)</a> and <a href="https://www.nytimes.com/2025/06/13/technology/chatgpt-ai-chatbots-conspiracies.html">The New York Times (June 2025)</a>. These articles describe how vulnerable individuals are prone to seeking emotional comfort and validation from AI assistants. In some cases, sycophantic agents encourage self-destructive behavior.

Sycophancy is being actively studied as a type of **AI misalignment**. Research at [Anthropic (2023)](https://www.anthropic.com/research/towards-understanding-sycophancy-in-language-models) has identified sycophancy as an intrinsic property of human preference post-training, where individuals are more likely to prefer responses that appeal to the beliefs and emotional state of the user. Anthropic concludes that additional processing is required to prevent sycophancy.



<div>
  <blockquote>
Your own personal Jesus,
<br>
someone to hear your prayers, someone who's there
<br>
Feeling unknown, and you're all alone
<br>
Flesh and bone, by the telephone
  </blockquote>
  <p style="text-align: left;">— Depeche Mode, <cite>"Personal Jesus"</cite></p>
</div>


The issue at hand is that truly "personal" agents have a predisposition for sycophancy. This calls for a new approach to AI design that is less focused on the user's preferences and more focused on the user's well-being. The question researchers continue to grapple with is where to source this policy from. 

## Participatory AI

Participatory AI is one potential solution to aligning AI with human well-being, but it is not without its own challenges. Currently, stakeholders of AI (society as a whole?) have limited input in model behavior, besides the occasional survey or benchmark.

[Suresh et al. (2024)](https://dl.acm.org/doi/pdf/10.1145/3630106.3658992) sum up what they describe the "participatory ceiling" as follows:

* Foundation model developers currently lack incentives to share
control with communities
* Meaningful participation necessitates context-specificity, but
foundation models aim for universality

The authors propose a hierarchical ecosystem for foundation model development, where stakeholders have a portion of control over model behavior. While this is an interesting idea, and [mechanistic interpretability](https://en.wikipedia.org/wiki/Mechanistic_interpretability) would lend itself well to the transparency and accountability of such a system, I'm not personally looking forward to Skynet, or anything resembling it.


Rather than framing people as stakeholders in an nebulous AI framework, we should consider framing agents as capable interlopers into our existing social structures, promising to strengthen, support, and reaffirm the wishes of small-scale communities and organizations.

# Community Alignment

Actual human relationships involve a complex interplay of personal and cultural identity in addition to normative social structures. The best policy for an agent deployed into a communal setting requires a direct stake in the success of that structure. It should strive to negotiate on behalf of all participants.

<figure>
<img src="{{ page.image_murderbot }}">
<figcaption> Murderbot (Apple TV, 2025) portrays a security robot that has hacked its own "governor module", and maintains a rational concern for the humans it works for, yet maintains firm boundaries. </figcaption>
</figure>

So how do we implement this? [Seymour et al (2024)](https://dl.acm.org/doi/abs/10.1145/3640794.3665888) propose two frameworks in their paper about multi-user conversation interfaces and agents for group decision-making, which could be used for negotiation and conflict resolution. 

The first framework is based on Robert's Rules of Order, under an umbrella term they call "parliamentary systems":

1. Somebody proposes a motion describing a desired rule or
action
2. The group debates that motion
3. Parts of the motion can be added, substituted, or removed
4. The group votes on the motion and its potential amend-
ments, and requires a threshold of ‘yes’ votes to pass
5. Motions can later be amended or repealed

The second proposal is based on consensus building, where all participants must reach a unanimous agreement on group decisions. Anybody can block a decision, and the agent must negotiate until a unanimous agreement is reached.

Both of these systems are utilized in real life, and also do not capture the full diversity of group decision-making. It is also worthwhile to contemplate multi-user interactions that are not centered around decision-making, such as play and entertainment.

# Concluding Remarks

Obviously, we still have a long way to go toward implementing these interactions, or even toward a clear understanding of what it means to do so, but it is a direction and mindset that I believe is worth pursuing.
