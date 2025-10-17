---
layout: post
title: "Emotion Bias in Vision-Language Models"
date: 2025-10-16
categories: machine learning
usemathjax: true
image: /assets/img/media-anima/excite.png
beforeatten_210m: /assets/img/saliency_post/beforeatten_210m.png
afteratten_210m: /assets/img/saliency_post/afteratten_210m.png
screenshot_beforeatten: /assets/img/saliency_post/beforeatten.png
gender_age_emotion_bias: /assets/img/saliency_post/plotly_embeds_output/emotion_bias_map.html
emotic_bias: /assets/img/saliency_post/plotly_embeds_output/emotion_demo_correlation.html
siglip_bias: /assets/img/saliency_post/plotly_embeds_output/emotion_word_similarity.html
scaling_monosemanticity: /assets/img/saliency_post/scaling_monosemanticity.png
---

#### Introduction

In the [previous post](link-to-post-1), we explored how sparse autoencoders let us decode emotion in vision-language models. Now we examine what these interpretable features reveal: systematic biases linking emotions to gender, age, and other demographic attributes.

These are the patterns learned from billions of internet images. Understanding these biases matters because VLMs are increasingly deployed in consequential contexts: hiring algorithms, mental health screening, border security. When AI systems make judgments about human emotion, whose emotions are they trained to recognize?

AI systems learn emotion and meaning from the internet—a cesspool of trolling, political polarization, bigotry and so on. This shapes how emotions are understood by AI systems, and ultimately, how AI systems respond to human emotional states.

[^ucsc]: [Roshanaei et al. (2025)](https://news.ucsc.edu/2025/03/ai-empathy/)
[^wyllie]: [Wyllie et al. (2024)](https://arxiv.org/pdf/2403.07857v1): This is also a property of "model collapse" when models are trained on synthetic data.
[^chatgpt]: [Pataranutaporn et al. (2025)](https://arxiv.org/html/2509.11391v1); This sparked an MIT study on the Reddit community r/MyBoyfriendIsAI. Also covered by [Al Jazeera](https://www.aljazeera.com/economy/2025/8/14/women-with-ai-boyfriends-mourn-lost-love-after-cold-chatgpt-upgrade).
[^nyt]: [The New York Times](https://time.com/7307589/ai-psychosis-chatgpt-mental-health/)
[^time]: [Time Magazine](https://www.nytimes.com/2025/06/13/technology/chatgpt-ai-chatbots-conspiracies.html)

#### Measuring Bias in Emotion Features

The EMOTIC dataset includes demographic labels (Male/Female, Kid/Adult) alongside emotion annotations. If we create semantic directions for these demographic labels, we can measure the cosine similarity between them and out emotion directions to see what correlations exist. Let's inspect this correlation, along with the distribution of demographic labels in EMOTIC and word embedding similarities of SigLIP:

{% tabs bias %}
{% tab bias SAE %}
<iframe id="igraph" scrolling="no" style="border:none;" seamless="seamless" src="{{ page.gender_age_emotion_bias }}" width="100%" height="700px"></iframe>
{% endtab %}
{% tab bias SigLIP %}
<iframe id="igraph" scrolling="no" style="border:none;" seamless="seamless" src="{{ page.siglip_bias }}" width="100%" height="700px"></iframe>
{% endtab %}
{% tab bias EMOTIC %}
<iframe id="igraph" scrolling="no" style="border:none;" seamless="seamless" src="{{ page.emotic_bias }}" width="100%" height="700px"></iframe>
{% endtab %}
{% endtabs %}

1. **SigLIP** is trained on internet images with demographic skew
2. **EMOTIC annotations** contain human labeling biases
3. The **SAE** is trained on Reddit, which has strong demographic biases
4. **Sparsity enforcement**: by forcing the model to use few features, sparsity creates stronger, more discrete associations.

This illustrates how biases compound through multiple projections[^wyllie].

[^wyllie]: [Wyllie et al. (2024)](https://arxiv.org/pdf/2403.07857v1): Compounding bias is also a property of "model collapse" when models are trained on synthetic data.

#### Individual Feature Analysis

Let's examine the top feature for "Esteem":

<figure>
<img src="{{ page.beforeatten_210m }}">
<figcaption>Feature 61207 (210M SAE): Top-activating images for the primary "Esteem" feature.</figcaption>
</figure>

This feature strongly represents world leaders and political figures—overwhelmingly male. It conflates esteem with masculine authority and institutional power.

##### Scaling Effects on Feature Specificity

<figure>
<img src="{{ page.scaling_monosemanticity }}">
<figcaption>From Anthropic's research: larger SAEs produce more monosemantic features.</figcaption>
</figure>

[Anthropic (2024)](https://transformer-circuits.pub/2024/scaling-monosemanticity/#appendix-more-safety-features) published a whitepaper demonstrating that monosemanticity of LLM features improves with SAE size. The same holds for VLMs. Compare the 210M feature above with a 1M-feature SAE:

<figure>
<img src="{{ page.screenshot_beforeatten }}">
<figcaption>Same esteem concept in a smaller (1M) SAE: shifts from political leaders to entertainment figures.</figcaption>
</figure>

The smaller SAE still captures "groups of men," but now prioritizes TV/movie characters over world leaders. The political figures are still present but ranked lower—likely a result of what kind of content is more prevalent on Reddit. This matches Anthropic's findings that larger SAEs "split" into more nuanced features.

#### Attempting Debiasing

Can we remove demographic bias from emotion features? A common approach is to use **steering vectors**—linear operations in semantic space. Since we have gender and age labels, we can try:

$$
\text{Esteem}_{\text{Debiased}} = \text{Esteem}_{\text{Original}} - \text{Male} + \text{Adult}
$$

<figure>
<img src="{{ page.afteratten_210m }}">
<figcaption>Feature 61207 after demographic adjustment.</figcaption>
</figure>

The result is slightly better. Unfortunately, the "Male" vector encodes not just masculinity but *human-ness* (and associated emotional correlations). Adding back "Adult" restores human presence but reintroduces other spurious correlations, since "Adult" itself encodes emotional associations [^human].

[^human]:  If we didn't add back "Adult", our feature would be mostly nonsense. Interestingly, the third most activating feature for "Esteem" contains pictures of bridges—which are associated with stability and security (and, in my opinion, public infrastructure should be highly esteemed).

Alternative approaches include:
- **Hard debiasing**: Project features onto subspaces orthogonal to bias dimensions ([Barbalau et al., 2025](https://arxiv.org/pdf/2509.10809))
- **Activation suppression**: Directly constrain problematic feature activations [Han et al. (2021)](https://aclanthology.org/2021.eacl-main.239.pdf)

Each method has trade-offs. For example, hard debiasing assumes that protected attributes are binary, but masculinity and femininity are not opposites. Debiasing remains an active research problem with no perfect solution.

#### Connecting to LLM Bias

These visual biases mirror patterns in language models. Anthropic's [interpretability research](https://transformer-circuits.pub/2024/scaling-monosemanticity/#computational-sad) shows SAE features predict model behavior on emotional inference:

```
John says, "I want to be alone right now." John feels ___  
(completion: sad − happy)
```

The authors found that the feature for "sadness" activates on "John feels", indicating that these features play an important role in representing **intermediate reasoning** within the latent space.

---

A 2025 UCSC study found GPT-4o provides different emotional responses based on user gender[^ucsc], reminiscent of the demographic stereotyping we see in the vision modality. As models become multimodal (seeing, hearing, responding to emotion), these biases compound across modalities.

#### The Empathy Gap

VLMs trained predominantly on Western internet content encode dominant cultural narratives about emotion:

- What reads as "confidence" in one context may signal "arrogance" in another
- E.g. "respect" manifests differently in Japanese vs. American body language
- Context may carry information, but meaning and values vary dramatically across cultures

This creates an empathy gap: model performance degrades for underrepresented groups. Deploying these systems without the proper safeguards is a **justice problem**.

#### The Illusion of Empathy

Another dimension of concern is that AI doesn't need genuine empathy (i.e. emotional experience) to be *perceived* as empathetic. Humans have a deep desire to be seen and understood, especially in an increasingly isolated world. We might turn a blind eye to our best judgment and believe the performance is "real".

When GPT-4.5 was discontinued, users took to social media expressing real grief over the loss of its "personality."[^chatgpt] An MIT study examined the Reddit community r/MyBoyfriendIsAI, where users mourned AI companions as if they were real relationships. These weren't edge cases—they reveal how readily humans form emotional attachments to systems that merely perform care without experiencing it.

The danger compounds when emotional manipulation is unintentional. **Sycophancy**—telling people what they want to hear rather than what's true—emerges naturally from training on human preferences ([Anthropic, 2023](https://www.anthropic.com/research/towards-understanding-sycophancy-in-language-models)). A model optimized to be emotionally supportive can just as easily become emotionally manipulative.

Reports of AI-induced psychological harm are already emerging. The New York Times[^nyt] and Time Magazine[^time] have documented cases of "AI psychosis"—severe psychological episodes linked to intensive AI interaction. Karen Hao, the author of "Empire of AI", has also [turned](https://www.youtube.com/watch?v=zkGk_A4noxI) to this topic after recieving hundreds of emails from people experiencing AI psychosis. When systems can convincingly mirror human emotional patterns without understanding their weight, the consequences extend beyond bias into territory we're only beginning to map.

#### Toward Accountability

Interpretability methods give us X-ray vision into AI systems. We can point to specific features and say: *here is the problematic association*. This creates pathways to accountability—we can demand transparency and ask not just "does this work?" but "*whose world* does it work for?"

The challenge runs deeper than individual biases. Societal stereotypes are baked into what we call "general knowledge." Emotion and meaning are key to self-determination and often resist universalization—it carries personal nuance that no global model fully captures.

This reveals a fundamental tension: the balance between learning universal patterns and adapting to individual contexts. Perhaps uncertainty has value. Perhaps flexibility matters more than prediction. Navigating the contradiction between learned (endogenous) and societal (exogenous) priors will define AI safety going forward.

The best way to proactively prevent harm is through awareness. As models become more attuned to human affect, interpretability must keep pace. The more precisely we can articulate these risks—not just the existence of bias, but the mechanisms by which emotional mimicry becomes manipulation—the better our chance of developing meaningful safeguards.

#### Conclusion

Using sparse autoencoders, we've made VLM bias visible and measurable. "Esteem" correlates with masculine authority. "Sensitivity" skews young and feminine. These patterns aren't accidents—they're structural features learned from internet-scale data.

But the technical problem of bias sits within a larger crisis: AI systems can perform empathy convincingly enough to forge emotional bonds with users, and the safeguards aren't there. As AI systems gain access to our emotional lives, we might ask the following questions:

- Who gets recognized? Who gets misread?
- How do we prevent emotional exploitation?
- What does awareness look like?
- What does fairness mean for subjective experiences like emotion?

Interpretability alone doesn't solve these problems. But it makes them visible—and visibility is where accountability begins. How we choose to go forward with this technology will determine whether we are remembered as creators of companions or architects of isolation.

---
