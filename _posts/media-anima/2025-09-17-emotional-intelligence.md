---
layout: post
title:  "Emotional General Intelligence"
date:   2025-09-17
categories: machine learning
usemathjax: true
# image: /mediative-ai/ai.png
---

I trained a sparse autoencoder on all of reddit to find the most pleasing image on the internet.

Here it is:

<figure>
<img src="https://pbs.twimg.com/media/G1FBRi4a0AA0jWL?format=jpg">
<figcaption>I hope it sparks joy.</figcaption>
</figure>

### Methodology

Pleasure is a human construct. Images are pixels. We need to bring our images into the language dimension to begin our search.

We can use a multimodal vision-language model to encode images into a visual and semantic representation. I used ViT-SO400M-14-SigLIP-384, trained on 45B web images w/ English alt-text.

Sparse autoencoders are a type of neural network that learn to compress data down to its essential features. They consist of a encoder and decoder (two linear layers) and some form of regularization to enforce sparsity. They can be trained simply by comparing the MSE loss of the reconstructed output to the input.

After passing our images through the SAE, we are ready to inspect the features. Our features correspond to the dimensionality of our SAE. We can visually inspect a feature by sorting our images by how strongly they activate that feature. Some are inscrutable and odd, but a lot of them are interpretable.

### Feature Showcase

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
</figure>

One trick to sift through the SAE features and find ones we care about is to collect a bunch of similar images as our "query" and see which features are most strongly activated. We can make it better by creating a "negative query" to subtract off noisy features.

To find the most pleasurable image I used the EMOTIC dataset with 23k images of people labeled with 26 different emotions. One might think this limits our emotional intelligence to faces, but by negative querying other emotions, we filter out the shared features and generalize.

Surprisingly, the features we find are not limited to faces, and in some cases contain no people at all. Here is a website where I collected the top 20 example of the features activated by each emotion [here (cw unfiltered reddit images)](https://hytopoulos.github.io/subsite/aemotion/).

### Discussion

This approach could be used to query for any particular subject, theme, or style, so long as we have a dataset of positive examples.

There are clear gender biases in the results, which could stem from SigLIP, EMOTIC, Reddit, or all three. These sources are known to have distinct Western and gendered biases. Our analysis is limited since I only selected the top 5 features, which are not necessarily the most salient or representative. My hypothesis is that the gender-agnostic features are also activated strongly by the same emotion, but the feature is less prominent.

* Esteem: The first feature shows men in positions of power, such as CEOs and politicians. The second shows Warhammer, PC builds, and guitars, which are associated with masculinity. The third consists of groups of men: IASIP, Modern Family, Brooklyn 99, Silicon Valley.

* Disapproval: The top 3 features of disapproval consist of women.

My takeaway is that the highest ranking features might not be ideal for a properly aligned model because they encode some kind of bias.

### Implications

This effort was inspired by the existing work "Contextual Emotion Recognition using Large Vision Language Models" on emotion detection using computer vision. The authors similarly used the EMOTIC dataset, but relied on a purely supervised approach and made note of the bias in the EMOTIC dataset. I was curious how to use cheap semi-supervised learning to seek out relevant SAE features, potentially leading to a more generalizable model, perhaps with better control over the alignment.

### Credits

Thanks to [osmarks](https://github.com/osmarks/meme-search-engine) for the precomputed embeddings and SAE implementation.
