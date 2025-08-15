---
layout: post
title:  "Community-aligned AI"
date:   2025-08-01
categories: machine learning
usemathjax: true
image: /assets/img/media-anima/partybot.png
image_murderbot: /assets/img/media-anima/Murderbot_Hug.jpg
image_irobot: /assets/img/media-anima/i-robot.jpg
---

<figure>
<img src="{{ page.image }}">
<figcaption>BZZT. Social battery on 10%!</figcaption>
</figure>

# The problem with personal assistants

The past few years have seen an increasing number of collective "Oh Shit" moments in response to sudden advancements in AI. It's the uncanny valley ones that stick out the most, such as the video by OpenAI: [Two GPT-4o's interacting and singing](https://www.youtube.com/watch?v=MirzFk_DSiI). It hints at a goal of approximating "humanness" through playful and affective interactions. In April 2025, OpenAI released a <a href="https://openai.com/index/sycophancy-in-gpt-4o/">short memo</a> regarding the issue of sycophancy in a now-recalled update to their GPT-4o model, describing the model as, "overly supportive but disingenous."

Sycophancy is believed to cause "AI psychosis" — the disconnect from reality that can occur from prolonged and intense interaction with AI assistants. This term has surfaced onto sites like <a href="https://www.psychologytoday.com/us/blog/urban-survival/202507/the-emerging-problem-of-ai-psychosis">Psychology Today</a>, <a href="https://time.com/7307589/ai-psychosis-chatgpt-mental-health/">Time Magazine</a> and <a href="https://www.nytimes.com/2025/06/13/technology/chatgpt-ai-chatbots-conspiracies.html">The New York Times</a> since the release of the OpenAI memo. These articles describe how vulnerable individuals are prone to seeking emotional comfort and validation from AI assistants. In some cases, sycophantic agents encourage self-destructive behavior.

Sycophancy is being actively studied as a type of **AI misalignment**. Researchers at [Anthropic](https://www.anthropic.com/research/towards-understanding-sycophancy-in-language-models) (2023) have identified sycophancy as a general side effect of RLHF, where individuals are more likely to prefer responses that appeal to their preexisting beliefs and emotional state. Anthropic concludes that additional processing is required to prevent sycophancy.

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

Reward hacking is a phenomenon that occurs when an agent learns to "exploit" its environment in order to receive a reward, rather than learning to perform the task in the intended way. If we consider the reward function to be the preferences of an individual, then we begin to understand the potential for emotional manipulation. Currently, we circumscribe the social interactions of an agent to an individual level. This does not align with the communal nature of human relationships.

# Rewarding pro-social behavior

<figure>
<img src="{{ page.image_murderbot }}">
<figcaption> Murderbot (Apple TV, 2025) portrays a security robot that has hacked its own "governor module", and maintains a rational concern for the humans it works for, yet maintains firm boundaries. </figcaption>
</figure>

Human relationships involve a complex interplay of personal and cultural identity. Therefore, a reward policy for an agent in a communal setting should be tied to the success of the community. Agents, as mediative figures, should strive to negotiate on behalf of all participants.

Post-training on normative assumptions about social structures will not make the cut. The current paradigm of monolithic AI inevitably contains biases, as there is no universal pattern we can apply to communication. We must consider alternative approaches that adapt to local, contextual social structures.

Furthermore, as we begin to explore the physical presence of AI, it is important to how these systems interact within social structures outside of a digital environment. We must carefully consider what method we use to shape agents toward socialization in communities, and what this kind of infusion means for society.

One might say we still have a long way to go toward implementing these interactions, or even toward a clear understanding of what it means to do so, but it is clear that we are already witnessing the side effects of a technology that is encroaching into an unspoken and sacred territory of the human experience.

<!-- So how do we implement this? [Seymour et al (2024)](https://dl.acm.org/doi/abs/10.1145/3640794.3665888) propose two frameworks in their paper about multi-user conversation interfaces and agents for group decision-making, which could be used for negotiation and conflict resolution. 

The first framework is based on Robert's Rules of Order, under an umbrella term they call "parliamentary systems":

1. Somebody proposes a motion describing a desired rule or
action
2. The group debates that motion
3. Parts of the motion can be added, substituted, or removed
4. The group votes on the motion and its potential amend-
ments, and requires a threshold of ‘yes’ votes to pass
5. Motions can later be amended or repealed

The second proposal is based on consensus building, where all participants must reach a unanimous agreement on group decisions. Anybody can block a decision, and the agent must negotiate until a unanimous agreement is reached.

Both of these systems are utilized in real life. They also do not capture the full diversity of group decision-making. It is also worthwhile to contemplate multi-user interactions that are not centered around decision-making, such as play and entertainment. -->

<!-- # Concluding Remarks -->

<!-- ## Rethinking Rewarded Behavior

If an agent is rewarded for maximizing the goals of a particular group, rather than the preferences of an individual, it may be more aligned with the interests of that group. Researchers are considering participatory AI as a potential solution to aligning AI with community interests, but it is not without its own challenges. Currently, stakeholders of AI (society as a whole?) have limited input in model behavior, besides the occasional survey or benchmark.

[Suresh et al. (2024)](https://dl.acm.org/doi/pdf/10.1145/3630106.3658992) sum up what they describe the "participatory ceiling" as follows:

* Foundation model developers currently lack incentives to share control with communities
* Meaningful participation necessitates context-specificity, but foundation models aim for universality

The authors propose a hierarchical ecosystem for foundation model development, where stakeholders have a portion of control over model behavior. While this is an interesting idea, and [mechanistic interpretability](https://en.wikipedia.org/wiki/Mechanistic_interpretability) would lend itself well to the transparency and accountability of such a system, I'm not personally looking forward to Skynet, or anything resembling it.


Rather than framing people as stakeholders in an nebulous AI framework, we should consider framing agents as capable interlopers into our existing social structures, promising to strengthen, support, and reaffirm the wishes of small-scale communities and organizations. -->
