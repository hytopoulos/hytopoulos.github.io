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

Many individuals are beginning to seek emotional and therapeutic support from chatbots. However, this trend coincides with growing evidence of increased psychological distress. "AI psychosis" is a term that describes the disconnect from reality that can occur from prolonged and intense interaction with AI assistants. This term has surfaced onto sites like <a href="https://www.psychologytoday.com/us/blog/urban-survival/202507/the-emerging-problem-of-ai-psychosis">Psychology Today</a>, <a href="https://time.com/7307589/ai-psychosis-chatgpt-mental-health/">Time Magazine</a> and <a href="https://www.nytimes.com/2025/06/13/technology/chatgpt-ai-chatbots-conspiracies.html">The New York Times</a>. These articles outline how vulnerable individuals are prone to seeking emotional comfort and validation from AI assistants, with "sycophancy" being a contributing factor.

In April 2025, OpenAI released a <a href="https://openai.com/index/sycophancy-in-gpt-4o/">short memo</a> regarding the issue of sycophancy in a now-recalled update to their GPT-4o model, describing the model as, "overly supportive but disingenous." Sycophancy is being actively studied as a type of **AI misalignment**. Researchers at [Anthropic](https://www.anthropic.com/research/towards-understanding-sycophancy-in-language-models) (2023) have identified sycophancy as a general side effect of reinforcement learning with human feedback (RLHF), where individuals are more likely to prefer responses that appeal to their preexisting beliefs and emotional state. The authors conclude that additional processing is required to prevent sycophancy.

Sycophancy can be construed as a form of "reward hacking", a phenomenon in reinforcement learning where an agent learns to "exploit" its environment in order to receive a reward, rather than learning to perform the task in the intended way. When we consider that the reward function is the preference of an individual, we can understand how unintended consequences can arise from mirroring or reinforcing anti-social attitudes without broader social considerations.

# Rewarding pro-social behavior

Currently, the social awareness of agents is limited to "single-user" interactions. This does not reflect the true nature of human relationships, which often involve groups of people (communities) and contextual identities. I believe that one potential solution is to design agents that are embedded within communities and what modes of social interaction can occur away from a chat interface. Agents, as mediative figures, can strive to negotiate on behalf of multiple subjective viewpoints -- potentially reducing sycophancy and successfully navigating real-life social interactions.

On a technical level, there is a lack of infrastructure for supporting communication formats beyond the chat interface. Existing work has attempted to adapt pre-existing conversational assistants, but there is a lack of reinforcement learning infrastructure for developing multi-user, group-oriented communication.

Further contextualization may require a different architecture. The current paradigm of monolithic foundation models offered as a one-size-fits-all solution inevitably contains biases, as there is no universal pattern we can apply to communication. Normative assumptions about social structures are not a sustainable approach. We should develop alternative designs that adaptively learn the needs of a community. This type of grounding not only promises to yield more ethically aligned agents, but also has the potential to strengthen communities and identities.

Furthermore, as we begin to explore the physical presence of AI, it is important to consider how these systems interact within social structures outside of a digital environment. We must carefully consider what method we use to shape agents toward socialization in communities, and what this kind of infusion means for society.

<!-- # Fictional Examples

<figure>
<img src="{{ page.image_murderbot }}">
<figcaption> Murderbot (Apple TV, 2025) portrays a security robot that has hacked its own "governor module", and maintains a rational concern for the humans it works for, yet maintains firm boundaries. </figcaption>
</figure> -->

We have a long way to go toward implementing these interactions, or even toward a clear understanding of what it means to do so, but it is clear that we are already witnessing the side effects of a technology that is stepping into an unspoken and sacred territory of the human experience.


<!-- <div>
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
</div> -->

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
