---
layout: post
title: "Decoding Emotion in Vision-Language Models"
date: 2025-09-17
categories: machine learning
usemathjax: true
image: /assets/img/media-anima/excite.png
feat_map_raw: /assets/img/saliency_post/feat258516.png
feat_ovl_raw: /assets/img/saliency_post/feat258516_ovl.png
feat_map_smooth: /assets/img/saliency_post/feat258516_smoothgrad.png
feat_ovl_smooth: /assets/img/saliency_post/feat258516_smoothgrad_ovl.png
eval: /assets/img/saliency_post/plotly_embeds_output/ap_comparison.html
affection: /assets/img/saliency_post/emotion_img/Affection_rank01_original.png
affection_map: /assets/img/saliency_post/emotion_map/Affection_rank01.png
anger: /assets/img/saliency_post/emotion_img/Anger_rank01_original.png
anger_map: /assets/img/saliency_post/emotion_map/Anger_rank01.png
annoyance: /assets/img/saliency_post/emotion_img/Annoyance_rank01_original.png
annoyance_map: /assets/img/saliency_post/emotion_map/Annoyance_rank01.png
confidence: /assets/img/saliency_post/emotion_img/Confidence_rank01_original.png
confidence_map: /assets/img/saliency_post/emotion_map/Confidence_rank01.png
disapproval: /assets/img/saliency_post/emotion_img/Disapproval_rank01_original.png
disapproval_map: /assets/img/saliency_post/emotion_map/Disapproval_rank01.png
disconnection: /assets/img/saliency_post/emotion_img/Disconnection_rank01_original.png
disconnection_map: /assets/img/saliency_post/emotion_map/Disconnection_rank01.png
embarrassment: /assets/img/saliency_post/emotion_img/Embarrassment_rank01_original.png
embarrassment_map: /assets/img/saliency_post/emotion_map/Embarrassment_rank01.png
peace: /assets/img/saliency_post/emotion_img/Peace_rank01_original.png
peace_map: /assets/img/saliency_post/emotion_map/Peace_rank01.png
sadness: /assets/img/saliency_post/emotion_img/Sadness_rank01_original.png
sadness_map: /assets/img/saliency_post/emotion_map/Sadness_rank01.png
superposition: /assets/img/saliency_post/superposition.png
slider: /assets/img/saliency_post/sliders.png
sadness_peace_html: /assets/img/saliency_post/sadness_peace.html
---

#### Introduction

Vision-language models (VLMs) are AI models trained on text and images that create a joint representation of visual and linguistic information. VLMs are already being used for tasks such as robotics and medical image analysis. Understanding how these models encode emotion is important for developing AI technology that interacts with humans and can potentially make decisions that affect people's well-being.

This post walks through an approach to inspect the internal workings of VLMs using sparse autoencoders (SAEs). We'll see how to disentangle emotion-related features from VLM embeddings, visualize what the model "sees" when detecting emotions, and evaluate how well these features can predict emotion. In a follow-up post, we'll also examine what these features reveal about bias in emotion recognition.

[^sae]: Towards Monosemanticity: Decomposing Language Models With Dictionary Learning ([Anthropic (2023)](https://transformer-circuits.pub/2023/monosemantic-features/index.html)).
[^monosemantic]: A monosemantic feature is a feature that is associated with a single meaning.
[^smilkov]: [Smilkov et al. (2017)](https://arxiv.org/abs/1706.03825); SmoothGrad reduces noise in gradient-based saliency maps.
[^attention]: Also, attention itself is noisy. [This](https://mlhonk.substack.com/p/40-vision-transformers-need-registers) substack post explains how ViT models sometimes stick global information in background patches. It can be mitigated by adding CLS token "registers" during training.

#### How VLMs Encode Emotion

VLMs encode images into high-dimensional vectors called embeddings. These embeddings exhibit a property called **superposition**: many features are compressed into fewer dimensions, with emotion-related information spread across multiple dimensions.

<figure class="invert-on-dark">
<img src="{{ page.superposition }}" alt="Superposition diagram">
<figcaption>
 Superposition represents the compression of many features into a lower-dimensional space.<br>
 Source: <a href="https://transformer-circuits.pub/2022/toy_model/">Anthropic (2022)</a>
</figcaption>
</figure>

Understanding how to disentangle these features is the key to interpretability. Using mechanistic interpretability methods, we can decompose embeddings into interpretable components.

##### Sparse Autoencoders

Sparse autoencoders reverse superposition by projecting representations into a higher-dimensional space. They've become a standard tool for vision and language interpretability.[^sae] 

The three main components are:
1. **Projection** into a higher dimensional space
2. **Sparsity constraint** (e.g., top-k activation)
3. **Reconstruction loss** (e.g., MSE)

Training a sparse autoencoder decomposes embeddings into monosemantic features. In essence, it unweaves the high-dimensional image representation into interpretable concepts.

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

#### Using Pre-trained SAE Features

Rather than training from scratch, we can use a pre-trained SAE trained on 210M Reddit images ([available here](https://datasets.osmarks.net/big_sae/)). This gives us access to 262,144 disentangled features.

##### Finding Emotion-Relevant Features

We can use the EMOTIC dataset to identify the features that are related to emotion. The EMOTIC dataset contains 23k images labeled with 26 emotions. Our approach:

1. Pass each EMOTIC image through the VLM to get embeddings
2. Run embeddings through the SAE to get feature activations
3. For each emotion, average the activation patterns across all images labeled with that emotion
4. This gives us an "emotion direction" in feature space

Using these directions, we can rank any image by cosine similarity to measure alignment with each emotion. Here are the Reddit images that activate each emotion direction the most:

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
.heatcard img.base {
    display: block;
    width: 100%;
    height: auto;
}
.heatcard img.heatmap {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    opacity: 0;
    transition: opacity 180ms ease-in-out;
    mix-blend-mode: multiply;
    pointer-events: none;
}
.heatcard:hover img.heatmap,
.heatcard:focus-visible img.heatmap {
    opacity: .8;
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

*Hover over images to see heatmaps showing where emotion features activate.*

#### Visualizing Model Attention with Heatmaps

To understand *where* in an image the model detects emotion, we use saliency mapping, which computes gradients of the output with respect to input pixels (full code [here](https://github.com/hytopoulos/saemotion/blob/main/saliency.py)).

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
    g, = torch.autograd.grad(y, x_noised, create_graph=False)
    G += g.abs().mean(dim=1)
sal = G / n
```
{% endtab %}
{% endtabs %}

We smooth the gradients by averaging over multiple noisy samples[^smilkov]. This reduces artifacts and produces cleaner visualizations:

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

The smoothed heatmaps still contain some artifacts[^attention], but show clear spatial localization of emotion-relevant features—impressive for a model not fine-tuned specifically for this task.

#### Performance Evaluation

How well can we predict emotions using just these learned directions? We evaluate on the EMOTIC test set by measuring cosine similarity between image embeddings and emotion directions and then computing average precision (AP).

[Mittal et al. (2020)](https://www.researchgate.net/profile/Uttaran-Bhattacharya-2/publication/339972569_EmotiCon_Context-Aware_Multimodal_Emotion_Recognition_using_Frege's_Principle/links/5f53d102299bf13a31a4b738/EmotiCon-Context-Aware-Multimodal-Emotion-Recognition-using-Freges-Principle.pdf) provide benchmark results on EMOTIC for comparison:

<iframe src="{{ page.eval }}" width="100%" height="500px"></iframe>

While not state-of-the-art, this unsupervised approach achieves reasonable performance—and crucially, gives us interpretable features we can inspect and modify.

#### Decomposing Emotions

I created [this](https://github.com/hytopoulos/saemotion) tool to help explore the sparse autoencoder features. It visualizes emotion directions and their activations.

<figure>
<img src="{{ page.slider }}">
<figcaption>We can configure the strength of each feature to see how it affects the image.</figcaption>
</figure>

Let's look at the top features encoded in the "Peace" direction (see the images [here]({{ page.sadness_peace_html }})):
1. People at the beach tanning their legs
2. People passed out on couches
3. Black and white photos of older people on benches
4. Priests delivering sermons
5. Bikes

And for "Sadness":
1. American pallbearers carrying caskets of veterans
2. Ghanaian "[Dancing pallbearers](https://en.wikipedia.org/wiki/Dancing_Pallbearers)", who became a popular internet meme in 2020.
3. Obituary photos
4. Nature documentary style photographs of African safari animals fighting.
5. Pallbearers featuring other countries.

These features do not neutrally represent emotion. Instead, they encode hierarchies of meaning through layered specificity and emotionally charged modifiers. We see that the most salient features for sadness are compounded with death rituals, national identity, and viral spectacle.

#### Conclusion

Using sparse autoencoders, we can decompose VLM embeddings to understand how models encode emotion. This interpretability comes with practical benefits: we can visualize model attention, search images by emotional content, and identify which features contribute to predictions.

Interpretability also reveals layered meaning that is shaped by predominantly Western cultural context. In the next post, we'll examine systematic biases in these emotion features—and explore what this means for deploying emotion recognition systems in the real world.

---
