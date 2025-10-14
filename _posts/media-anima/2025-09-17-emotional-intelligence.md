---
layout: post
title:  "Interpretable Emotional Intelligence"
date:   2025-09-17
categories: machine learning
usemathjax: true
image: /assets/img/media-anima/excite.png
feat_map_raw: /assets/img/saliency_post/feat258516.png
feat_ovl_raw: /assets/img/saliency_post/feat258516_ovl.png
feat_map_smooth: /assets/img/saliency_post/feat258516_smoothgrad.png
feat_ovl_smooth: /assets/img/saliency_post/feat258516_smoothgrad_ovl.png
eval: /assets/img/saliency_post/graph.png
screenshot_emotionsel: /assets/img/saliency_post/emotionsel.png
screenshot_sliders: /assets/img/saliency_post/sliders.png
screenshot_beforeatten: /assets/img/saliency_post/beforeatten.png
screenshot_afteratten: /assets/img/saliency_post/afteratten.png
affection: /assets/img/saliency_post/emotion_img/Affection_rank01_original.png
affection_map: /assets/img/saliency_post/emotion_map/Affection_rank01.png
anger: /assets/img/saliency_post/emotion_img/Anger_rank01_original.png
anger_map: /assets/img/saliency_post/emotion_map/Anger_rank01.png
annoyance: /assets/img/saliency_post/emotion_img/Annoyance_rank01_original.png
annoyance_map: /assets/img/saliency_post/emotion_map/Annoyance_rank01.png
anticipation: /assets/img/saliency_post/emotion_img/Anticipation_rank01_original.png
anticipation_map: /assets/img/saliency_post/emotion_map/Anticipation_rank01.png
arousal: /assets/img/saliency_post/emotion_img/Arousal_rank01_original.png
arousal_map: /assets/img/saliency_post/emotion_map/Arousal_rank01.png
aversion: /assets/img/saliency_post/emotion_img/Aversion_rank01_original.png
aversion_map: /assets/img/saliency_post/emotion_map/Aversion_rank01.png
confidence: /assets/img/saliency_post/emotion_img/Confidence_rank01_original.png
confidence_map: /assets/img/saliency_post/emotion_map/Confidence_rank01.png
disapproval: /assets/img/saliency_post/emotion_img/Disapproval_rank01_original.png
disapproval_map: /assets/img/saliency_post/emotion_map/Disapproval_rank01.png
disconnection: /assets/img/saliency_post/emotion_img/Disconnection_rank01_original.png
disconnection_map: /assets/img/saliency_post/emotion_map/Disconnection_rank01.png
disquietment: /assets/img/saliency_post/emotion_img/Disquietment_rank01_original.png
disquietment_map: /assets/img/saliency_post/emotion_map/Disquietment_rank01.png
doubt: /assets/img/saliency_post/emotion_img/Doubt_Confusion_rank01_original.png
doubt_map: /assets/img/saliency_post/emotion_map/Doubt_Confusion_rank01.png
embarrassment: /assets/img/saliency_post/emotion_img/Embarrassment_rank01_original.png
embarrassment_map: /assets/img/saliency_post/emotion_map/Embarrassment_rank01.png
engagement: /assets/img/saliency_post/emotion_img/Engagement_rank01_original.png
engagement_map: /assets/img/saliency_post/emotion_map/Engagement_rank01.png
esteem: /assets/img/saliency_post/emotion_img/Esteem_rank01_original.png
esteem_map: /assets/img/saliency_post/emotion_map/Esteem_rank01.png
excitement: /assets/img/saliency_post/emotion_img/Excitement_rank01_original.png
excitement_map: /assets/img/saliency_post/emotion_map/Excitement_rank01.png
fatigue: /assets/img/saliency_post/emotion_img/Fatigue_rank01_original.png
fatigue_map: /assets/img/saliency_post/emotion_map/Fatigue_rank01.png
fear: /assets/img/saliency_post/emotion_img/Fear_rank01_original.png
fear_map: /assets/img/saliency_post/emotion_map/Fear_rank01.png
happiness: /assets/img/saliency_post/emotion_img/Happiness_rank01_original.png
happiness_map: /assets/img/saliency_post/emotion_map/Happiness_rank01.png
pain: /assets/img/saliency_post/emotion_img/Pain_rank01_original.png
pain_map: /assets/img/saliency_post/emotion_map/Pain_rank01.png
peace: /assets/img/saliency_post/emotion_img/Peace_rank01_original.png
peace_map: /assets/img/saliency_post/emotion_map/Peace_rank01.png
pleasure: /assets/img/saliency_post/emotion_img/Pleasure_rank01_original.png
pleasure_map: /assets/img/saliency_post/emotion_map/Pleasure_rank01.png
sadness: /assets/img/saliency_post/emotion_img/Sadness_rank01_original.png
sadness_map: /assets/img/saliency_post/emotion_map/Sadness_rank01.png
sensitivity: /assets/img/saliency_post/emotion_img/Sensitivity_rank01_original.png
sensitivity_map: /assets/img/saliency_post/emotion_map/Sensitivity_rank01.png
suffering: /assets/img/saliency_post/emotion_img/Suffering_rank01_original.png
suffering_map: /assets/img/saliency_post/emotion_map/Suffering_rank01.png
surprise: /assets/img/saliency_post/emotion_img/Surprise_rank01_original.png
surprise_map: /assets/img/saliency_post/emotion_map/Surprise_rank01.png
sympathy: /assets/img/saliency_post/emotion_img/Sympathy_rank01_original.png
sympathy_map: /assets/img/saliency_post/emotion_map/Sympathy_rank01.png
yearning: /assets/img/saliency_post/emotion_img/Yearning_rank01_original.png
yearning_map: /assets/img/saliency_post/emotion_map/Yearning_rank01.png
gender_age_emotion_bias: /assets/img/saliency_post/gender_age_emotion_bias.png
emotic_bias: /assets/img/saliency_post/emotic_bias.png
siglip_bias: /assets/img/saliency_post/siglip_bias.png
---


### **Intro: What Vision–Language Models Do**

Vision–language models (VLMs) connect text and images using joint embeddings. They align language with visual representations, allowing AI to form a semantic understanding of the world. This opens new possibilities for how AI perceives and interacts with humans. This technology is central to how AI becomes embedded in social life, and we must be aware of how it interfaces with emotional life.

The mapping between text and images is not neutral. It reflects stereotypes related to gender, age, and other identity traits. For AI to promote fairness and self-determination, its understanding of emotion must avoid reproducing privilege or dominant social assumptions. True empathy, rather than a facsimile, is necessary for human-level interaction. For example, a 2025 UCSC study found GPT-4o’s emotional responses differed depending on a user’s gender, reinforcing gender stereotypes [^ucsc]. The ramifications of this are frightening when we consider how embodied AI might affect autonomy and social connection.


[^ucsc]: [Roshanaei et al. (2025)](https://news.ucsc.edu/2025/03/ai-empathy/).

<!-- Vision–language models (VLMs) connect text and images through joint embeddings. By aligning language with visual representations, they allow AI to build a semantic understanding of the world—opening new possibilities for how machines perceive and interact with us. As AI becomes more embedded in social life, it also gains access to our emotional lives.

Yet this mapping is far from neutral. It is shaped by stereotypes tied to gender, age, and other attributes. For AI to support fairness and self-determination, its judgments must not reflect privilege or mainstream assumptions. True empathy is essential for human-level interaction. A 2025 UCSC study found that GPT-4o’s emotional responses varied depending on a user’s gender.[^ucsc]

Empathy in AI poses an active threat—not because AI struggles with it, but because it doesn't need to. Our longing to be seen in a world that is increasingly lonely makes us willing to suspend disbelief; we want machines that care. And so, we mistake flawless performance for genuine feeling, imitation for intimacy. Many users took to social media in defense of GPT-4.5 when it was discontinued, claiming to have an emotional attachment to the personality. [^chatgpt]

AI learns emotion and meaning from the internet, which has biases and distortions. This post explores how emotions are encoded in images, what narratives are assumed, and what we can do about it. -->

[^siglip]: Specifically ViT-SO400M-14-SigLIP-384, which is trained on 45B web images with English alt-text.


[^nyt]: [The New York Times](https://time.com/7307589/ai-psychosis-chatgpt-mental-health/).

[^time]: [Time Magazine](https://www.nytimes.com/2025/06/13/technology/chatgpt-ai-chatbots-conspiracies.html).

[^chatgpt]: [Pataranutaporn et al. (2025)](https://arxiv.org/html/2509.11391v1); This sparked an MIT study on the Reddit community r/MyBoyfriendIsAI. Also covered by [Al Jazeera](https://www.aljazeera.com/economy/2025/8/14/women-with-ai-boyfriends-mourn-lost-love-after-cold-chatgpt-upgrade).

[^turing]: Ma et al. via [Stanford Law](https://law.stanford.edu/2023/11/16/overcoming-turing-rethinking-evaluation-in-the-era-of-large-language-models/); The authors point out the limitations of the Turing Test as a measure of competency in real-world tasks, but I believe it is still relevant for mirroring human behavior and simulating empathy. Gary Marcus [says](https://garymarcus.substack.com/p/ai-has-sort-of-passed-the-turing) the Turing Test is a measure of "human gullability".

[^sycophancy]:
    [Anthropic (2023)](https://www.anthropic.com/research/towards-understanding-sycophancy-in-language-models) published a whitepaper on sycophancy, showing that it is a general side effect of reinforcement learning with human feedback (RLHF).
    
[^psychology]: [Psychology Today](https://www.psychologytoday.com/us/blog/urban-survival/202507/the-emerging-problem-of-ai-psychosis), [The New York Times](https://time.com/7307589/ai-psychosis-chatgpt-mental-health/), and [Time Magazine](https://www.nytimes.com/2025/06/13/technology/chatgpt-ai-chatbots-conspiracies.html) have covered AI psychosis.
 
[^ucsc]: Roshanaei et al. (2025) via [https://news.ucsc.edu/2025/03/ai-empathy/](https://news.ucsc.edu/2025/03/ai-empathy/).

<!-- 
<figure>
<img src="https://pbs.twimg.com/media/G1FBRi4a0AA0jWL?format=jpg">
<figcaption>The most pleasing image—I hope it sparks joy.</figcaption>
</figure> -->

### Interpretability and Transparency

The best way to prevent harm is through awareness. As models become more attuned to human affect, interpretability must keep pace.

AI models reason about images using vector embeddings output by vision-language encoders. These embeddings are high-dimensional vectors that compress various features of the image. Embeddings exhibit a property called "superposition", where a high number of features are packed into a much lower dimensional space. Using interpretability methods, it is possible to decompose and disentangle an embedding into its constituent features.

Sparse autoencoders perform the opposite of superposition by expanding a representation into a higher dimensional space. Sparse autoencoders are used extensively for vision and language interpretability. The three main components of a sparse autoencoder are:

1. a projection into a higher dimensional space
2. a sparsity constraint (e.g. top-k)
3. reconstruction loss (e.g. MSE)


Using sparse autoencoders, it is possible to extract monosemantic[^monosemantic] features of images and inspect them. After training the sparse autoencoder, we're left with a learned weight matrix that disentangles our embeddings into constituent features.

Let's train a TopK-SAE on SigLIP embeddings, which are 1152-dimensional vectors:

[^monosemantic]: A monosemantic feature is a feature that is associated with a single meaning.

```python
class SparseAutoencoder(nn.Module):
    def __init__(self, d_in=1152, d_hidden=262_144, k=128):
        super().__init__()
        self.up_proj = nn.Linear(d_in, d_hidden, bias=False)
        self.k = k

    def forward(self, x):
        z = F.relu(self.up_proj(x))  # (B, H)

        # Keep only top-k activations per row
        vals, idxs = torch.topk(z, k=self.k, dim=-1)
        z_sparse = torch.zeros_like(z).scatter_(-1, idxs, vals)

        x_hat = F.linear(z_sparse, self.up_proj.weight.t(), bias=None)
        return x_hat

    def train_step(self, batch, optimizer):
        optimizer.zero_grad()
        x_hat = self.forward(batch)
        loss = F.mse_loss(x_hat, batch)
        loss.backward()
        optimizer.step()
        return loss.item()
```

<!-- ### Feature Showcase

<figure>
<img src="https://pbs.twimg.com/media/G1Fx4-6bwAAohyk?format=jpg">
<figcaption>An entire neuron whose only job is graffiti about Pewdiepie</figcaption>
</figure>

<figure>
<img src="https://pbs.twimg.com/media/G1F91ApaEAARtjt?format=jpg">
<figcaption>All kinds of home construction to be found on Reddit, including gingerbread houses and the Sims</figcaption>
</figure>

<figure>
<img src="https://pbs.twimg.com/media/G1GBc3HbgAA2C8a?format=jpg&name=4096x4096">
<figcaption>Filtering Reddit by a latent aesthetic feature</figcaption>
</figure> -->

### Feature Filtering

The vector representation of an image encodes emotion as well as other features. 

<!-- Most of these are not relevant to emotion detection.  -->
Our task is to sift through the disentangled features and find the ones that are most relevant to emotion. To do this, we can collect a bunch of similar images as a kind of "query" and record which features are most strongly activated.

<!-- , we can create a "negative query" to subtract off noisy features. -->

The EMOTIC dataset contains 23k images of people labeled with 26 different emotions. For each emotion, we can find corresponding images by taking the mean of each activation.

 <!-- querying the SAE with images of that emotion and recording which features are most strongly activated. One might think this limits our emotional intelligence to images of people, but by negative querying other emotions, and taking advantage of the SigLIP transfer learning, we filter out the shared features and generalize to other portrayals of emotion. -->

<style>
  /* Masonry container */
  .masonry { columns: 1; column-gap: 14px; }
  @media (min-width: 640px) { .masonry { columns: 2; } }
  @media (min-width: 1024px){ .masonry { columns: 3; } }

  .masonry-item {
    break-inside: avoid;
    margin: 0 0 14px;
    border-radius: 12px;
    box-shadow: 0 4px 18px rgba(0,0,0,.08);
    overflow: hidden;
    background: #111;
  }

  .heatcard {
    position: relative;
    display: block;
    line-height: 0;
  }

  /* Base image sets the natural size of the card */
  .heatcard img.base {
    display: block;
    width: 100%;
    height: auto;          /* preserves base aspect ratio */
  }

  /* Heatmap overlay: stretches to container (deforms to match base box) */
  .heatcard img.heatmap {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;      /* <-- deform to match underlying image box */
    opacity: 0;
    transition: opacity 180ms ease-in-out;
    mix-blend-mode: multiply;
    pointer-events: none;  /* hover passes through */
  }

  .heatcard:hover img.heatmap,
  .heatcard:focus-visible img.heatmap {
    opacity: .8;          /* tweak overlay strength */
  }

  .masonry-caption {
    font: 500 0.9rem/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    color: #ddd;
    padding: 8px 10px;
    background: rgba(0,0,0,.35);
    backdrop-filter: blur(6px);
    position: absolute;
    left: 8px;
    bottom: 8px;
    border-radius: 8px;
  }

  .figure-wrap { position: relative; }
  .heatcard:focus-visible { outline: 2px solid #7aa2ff; outline-offset: 2px; border-radius: 8px; }
</style>

<div class="masonry">
  {% assign emotions = "affection,anger,annoyance,confidence,disapproval,disconnection,embarrassment,peace,sadness" | split: "," %}
  {% for e in emotions %}
    {% assign map_key = e | append: '_map' %}
    <article class="masonry-item">
      <div class="figure-wrap">
        <a class="heatcard" href="{{ page[e] }}" tabindex="0" aria-label="{{ e }} heatmap preview">
          <img class="base" src="{{ page[e] }}" alt="{{ e }}" loading="lazy" />
          {% if page[map_key] %}
            <img class="heatmap" src="{{ page[map_key] }}" alt="" aria-hidden="true" />
          {% endif %}
        </a>
        <div class="masonry-caption">{{ e }}</div>
      </div>
    </article>
  {% endfor %}
</div>

Here is a website where I collected the top 20 example of the top SAE features activated by each emotion [here (cw unfiltered reddit images)](https://hytopoulos.github.io/subsite/aemotion/).

The top activating feature does not containing any faces, despite the fact that the EMOTIC dataset only contains people. Instead, it shows peaceful looking interiors.

### Heatmaps

We can also use SigLIP to isolate what components of an image trigger a feature by creating a heatmap. Heatmaps aid in interpreting the model's behavior and also serve as a kind of segmentation.

To create a heatmap for a given feature, we compute the gradient of the feature with respect to the input image. This is a common technique in computer vision called "saliency mapping".

The saliency map is computed as follows:

{% tabs mygroup %}
{% tab mygroup LaTeX %}
$$
\begin{align*}
&\text{Given: } x \in \mathbb{R}^{C \times H \times W},\quad \sigma > 0,\quad n \in \mathbb{N} \\
& G \leftarrow 0 \\
&\textbf{for } i = 1, \dots, n \textbf{ do} \\
&\quad \epsilon_i \sim \mathcal{N}(0, I) \\
&\quad \tilde{x}_i \leftarrow x + \sigma\epsilon_i\mathrm{std}(x) \\
&\quad g_i \leftarrow \frac{1}{C} \sum_{c=1}^{C} \bigl| \nabla_{\tilde{x}_i^{(c)}} f(\tilde{x}_i) \bigr| \\
&\quad G \leftarrow G + g_i \\
&\textbf{end for} \\
&S \leftarrow \frac{1}{n} G
\end{align*}
$$

{% endtab %}
{% tab mygroup Python %}
```python
G = torch.zeros_like(base[0])  # [H, W]
for _ in range(n):
    noise = torch.randn_like(base) * sigma * base.std()
    x_noised = x + noise
    x_noised.requires_grad_(True)

    y = forward(x_noised)
    # simpler than score.backward()
    g, = torch.autograd.grad(y, x_noised, create_graph=False)
    G += g.abs().mean(dim=1)

sal = G / n
```
{% endtab %}
{% endtabs %}

This implementation also smooths the gradient by averaging over multiple noisy samples [^smilkov]. Here is a comparison with and without smoothing:

[^smilkov]: [Smilkov et al. (2017)](https://arxiv.org/abs/1706.03825); SmoothGrad. It took my Mac M4 Pro around a minute to compute the heatmap for each image.

<table>
  <thead>
    <tr>
      <th>Raw Gradient</th>
      <th>Smoothed Gradient</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><img src="{{ page.feat_map_raw }}"></td>
      <td><img src="{{ page.feat_map_smooth }}"></td>
    </tr>
    <tr>
      <td><img src="{{ page.feat_ovl_raw }}"></td>
      <td><img src="{{ page.feat_ovl_smooth }}"></td>
    </tr>
  </tbody>
</table>

The heatmap still has some artifacts, but this is to be expected for a SigLIP model that has not been fine-tuned for this task. [^attention]

[^attention]: Also, attention itself is noisy. [This](https://mlhonk.substack.com/p/40-vision-transformers-need-registers) substack post explains how ViT models sometimes stick global information in background patches. It can be mitigated by adding CLS token "registers" during training.

### Evaluation

We can use a linear combination of feature activations to predict the intensity of an emotion. 

<figure>
<img src="{{ page.eval }}">
<figcaption>SAEFE compared to other methods on the EMOTIC dataset.</figcaption>
</figure>

### Visualizing Bias

The EMOTIC dataset contains additional labels for Kid/Adult and Male/Female. Let's inspect if there is an association between these labels and emotions.

{% tabs bias %}
{% tab bias SAE %}
<figure>
<img src="{{ page.gender_age_emotion_bias }}">
<figcaption>Gender and age bias in EMOTIC.</figcaption>
</figure>
{% endtab %}
{% tab bias EMOTIC %}
<figure>
<img src="{{ page.emotic_bias }}">
<figcaption>Gender and age bias in EMOTIC.</figcaption>
</figure>
{% endtab %}
{% tab bias SigLIP %}
<figure>
<img src="{{ page.siglip_bias }}">
<figcaption>Gender and age bias in EMOTIC.</figcaption>
</figure>
{% endtab %}
{% endtabs %}

We see very strong gender and age bias in the SAE features. This is an example of how biases can propagate downstream when there are multiple projections[^wyllie]:

1. SigLIP is trained on the internet, which has a slight gender and age bias.
2. The EMOTIC annotations have a slight gender and age bias.
3. The SAE is trained on Reddit, with strong biases associated with its demographic.
4. By enforcing sparsity, the SAE is forced to isolate biases, leading to stronger associations.

[^wyllie]: [Wyllie et al. (2024)](https://arxiv.org/pdf/2403.07857v1): This is also a property of "model collapse" when a model is trained on synthetic data (an ever-increasing problem).

### Filtering Bias

Now that we've identified biases, we can use attenuate it by removing features that are associated with age and gender. For example, feature 61207, which is most associated with "Esteem", encodes groups of men from TV shows and movies.

Since we have labels for gender and age, we can perform the following operation in semantic space:

$$
Esteem_{Debiased}= Esteem_{Original} - Male + Adult
$$

#### Before Vector Operation

<figure>
<img src="{{ page.screenshot_beforeatten }}">
</figure>

#### After Vector Operation

<figure>
<img src="{{ page.screenshot_afteratten }}">
</figure>

The "Male" vector encodes not only masculinity but human-ness (and the emotional correlations from above). We can mitigate the humanness part by adding back the "Adult" vector, which gives us the human-ness back. However this introduces a new bias, as the "Adult" vector encodes not only adulthood but also the emotional correlations from above. Spurious correlations are common issue with removing biases using vector operations.

[Barbalau et al. (2025)](https://arxiv.org/pdf/2509.10809) describe a more mathematically grounded method. Instead of subtracting features like this, the authors project features onto a subspace that is orthogonal to the bias. However they note that this method is limited to binary attributes.

### Discussion

Using SAEs, we capture emotions as a linear combination (or weighted sum) of interpretable latent features. We can directly inspect features that encode gender, race, religion, or other attributes.

Revealing biased correlations is critical for transparency and accountability. It provides a pathway to seek accountability from the companies that build and deploy these models.

There are two major groups of empathy: cognitive empathy and affective empathy. Cognitive empathy is the ability to understand and share the feelings of another, while affective empathy is the ability to feel the emotions of another.

### Conclusion

Empathy is not incentivized. The best way to prevent future harm is through awareness. As models become more attuned to human affect, interpretability must keep pace.

Benchmarks for "social ambiguity" are needed. 

<!-- Our ancestors showed us that empathy can turn cunning wolves into adorable puppies. If we cannot apply this lesson to AI, it should stay in the wild. Empathy is required for human-level interaction; it is what brings minds together. How we choose to use the technology will determine whether we are remembered as creators of companions or architects of isolation. -->

<!-- 
This effort was inspired by the existing work "Contextual Emotion Recognition using Large Vision Language Models" on emotion detection using computer vision. The authors similarly used the EMOTIC dataset, but relied on a purely supervised approach and made note of the bias in the EMOTIC dataset. I was curious if a semi-supervised approach could be used to seek out relevant SAE features, potentially leading to a more generalizable model, perhaps with better control over the alignment. -->

It is critical that we are aware of the self-reinforcing biases in 

### Credits

Special thanks to [osmarks](https://github.com/osmarks/meme-search-engine) for the precomputed embeddings and pretrained sparse autoencoder weights.
