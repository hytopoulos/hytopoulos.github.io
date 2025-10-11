---
layout: post
title:  "Interpretable Emotional Intelligence (Pt. 2)"
date:   2025-10-05
categories: machine learning
usemathjax: true
image: /assets/img/media-anima/excite.png
feat_map_raw: /assets/img/saliency_post/feat258516.png
feat_ovl_raw: /assets/img/saliency_post/feat258516_ovl.png
feat_map_smooth: /assets/img/saliency_post/feat258516_smoothgrad.png
feat_ovl_smooth: /assets/img/saliency_post/feat258516_smoothgrad_ovl.png
prev_post: emotional-intelligence

---

## Introduction

In the [previous post]({{ site.baseurl }}/{{ page.prev_post }}) we learned how to extract visual and semantic features from images using SigLIP, and use this information to query a database of images based on their content.

In this post we will learn how to use SigLIP to create heatmaps, and evaluate our trained sparse autoencoder against existing classification methods.

## Heatmaps

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

This implementation also smooths the gradient by averaging over multiple noisy samples [^1][^2]. Here is a comparison with and without smoothing:

[^1]: See [SmoothGrad](https://arxiv.org/abs/1706.03825). While effective, it is expensive to compute the gradient multiple times.

[^2]: Gradients are noisy but so is attention. [This](https://mlhonk.substack.com/p/40-vision-transformers-need-registers) substack post explains how ViT models sometimes stick global information in background patches, which can be resolved by adding CLS token "registers" during training.

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

# Evaluation

We will evaluate our trained sparse autoencoder against existing classification methods.
