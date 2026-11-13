import React from 'react';
import {
  Cpu,
  Eye,
  Layers,
  Network,
  Binary,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Disclaimer } from '../components/common/Disclaimer';

export const ModelPage: React.FC = () => {
  const classes = [
    {
      name: 'Adenocarcinoma',
      description:
        'A major histological subtype of non-small cell lung cancer (NSCLC). It typically arises in glandular cells of outer/peripheral lung zones, often associated with mucus production.',
      features: 'Peripheral nodular opacities, ground-glass halos, irregular margins on axial CT slices.',
    },
    {
      name: 'Large Cell Carcinoma',
      description:
        'A heterogeneous, aggressive non-small cell lung carcinoma characterized by large, undifferentiated polygonal cells with abundant cytoplasm and prominent nucleoli without clear squamous or glandular architecture.',
      features: 'Bulky, rapid-growing necrotic masses, often peripheral with extensive mediastinal invasion.',
    },
    {
      name: 'Normal',
      description:
        'CT scan slices showing healthy pulmonary parenchyma with normal vascular arborization, clear broncho-alveolar structures, and absence of suspicious focal nodules or parenchymal consolidation.',
      features: 'Homogeneous lung attenuation, smooth pleural borders, standard hilar and bronchial contours.',
    },
    {
      name: 'Squamous Cell Carcinoma',
      description:
        'A non-small cell lung carcinoma closely linked with mucosal epithelial irritation and smoking history. Usually originates in the central tracheobronchial tree or mainstem bronchi.',
      features: 'Central endobronchial or hilar masses, bronchial narrowing, atelectasis, cavitation.',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Title & Introduction */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5C6B73]/20 border border-[#9DB4C0]/30 text-[#9DB4C0] text-xs font-semibold uppercase tracking-wider">
          <Binary className="w-3.5 h-3.5" />
          Technical Specifications
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Model Architecture & Explainability
        </h1>
        <p className="text-sm sm:text-base text-[#E0FBFC] max-w-3xl leading-relaxed">
          Comprehensive overview of the ResNet50 deep convolutional backbone, categorical classification pipeline, and Gradient-weighted Class Activation Mapping (Grad-CAM) implementation.
        </p>
      </div>

      {/* Mandatory Disclaimer */}
      <Disclaimer variant="card" />

      {/* Section 1: ResNet50 Architecture */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-[#5C6B73]/40 pb-3">
          <div className="p-2 rounded-xl bg-[#5C6B73]/30 text-[#9DB4C0]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              1. ResNet50 Architecture & Transfer Learning
            </h2>
            <p className="text-xs text-[#C2DFE3]">
              Deep residual learning for pulmonary CT feature extraction
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 text-xs sm:text-sm text-[#E0FBFC] leading-relaxed">
            <p>
              The platform utilizes <strong>ResNet50</strong> (Residual Network with 50 layers), a landmark deep convolutional architecture designed to eliminate the degradation problem in very deep neural networks.
            </p>
            <p>
              Traditional convolutional neural networks suffer from vanishing or exploding gradients when depth increases. ResNet resolves this through identity shortcut connections (skip connections) that perform residual mappings:
            </p>
            <div className="p-4 rounded-xl bg-[#1b2529] border border-[#5C6B73]/40 font-mono text-xs text-[#9DB4C0] my-3">
              F(x) = H(x) - x &nbsp;⟹&nbsp; H(x) = F(x) + x
            </div>
            <p>
              This ensures that gradients backpropagate directly across the 16 three-layer bottleneck blocks without attenuation, preserving low-level edge features while abstracting high-level pulmonary nodule characteristics.
            </p>
            <p>
              <strong>Transfer Learning Implementation:</strong> Implemented in <strong>TensorFlow</strong> and <strong>Keras</strong>, the backbone utilizes initial weights pretrained on large-scale natural image datasets (ImageNet) to capture universal filters (edges, textures, contours), fine-tuned for high-resolution axial chest CT representations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Network className="w-4 h-4 text-[#9DB4C0]" />
              Architectural Pipeline
            </h3>
            <ul className="space-y-3 text-xs text-[#E0FBFC]">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9DB4C0] mt-1.5 shrink-0" />
                <span>
                  <strong>Input Resolution:</strong> 224 × 224 × 3 normalized floating-point tensor.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9DB4C0] mt-1.5 shrink-0" />
                <span>
                  <strong>Bottleneck Residual Blocks:</strong> 1×1, 3×3, 1×1 convolutions reducing parameter dimensions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9DB4C0] mt-1.5 shrink-0" />
                <span>
                  <strong>Target Layer:</strong> <code>conv5_block3_out</code> (final convolutional feature map).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9DB4C0] mt-1.5 shrink-0" />
                <span>
                  <strong>Pooling:</strong> Global Average Pooling (GAP) collapsing spatial dimensions to 2048-D vector.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9DB4C0] mt-1.5 shrink-0" />
                <span>
                  <strong>Head:</strong> Fully connected dense layer with 4-class categorical Softmax activation.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Explainability with Grad-CAM */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-[#5C6B73]/40 pb-3">
          <div className="p-2 rounded-xl bg-[#5C6B73]/30 text-[#9DB4C0]">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              2. Explainable AI with Grad-CAM
            </h2>
            <p className="text-xs text-[#C2DFE3]">
              Gradient-weighted Class Activation Mapping methodology
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 text-xs sm:text-sm text-[#E0FBFC] leading-relaxed">
            <p>
              In healthcare applications, black-box deep learning models present unacceptable risks. <strong>Grad-CAM</strong> (Selvaraju et al.) provides visual interpretability by computing the gradients of the score for target class <em>c</em> with respect to the feature activation map <em>A<sup>k</sup></em> of the final convolutional layer:
            </p>
            <div className="p-4 rounded-xl bg-[#1b2529] border border-[#5C6B73]/40 font-mono text-xs text-[#9DB4C0] my-3">
              α<sub>k</sub><sup>c</sup> = (1/Z) ∑<sub>i</sub> ∑<sub>j</sub> (∂y<sup>c</sup> / ∂A<sub>i,j</sub><sup>k</sup>)
            </div>
            <p>
              These neuron importance weights α<sub>k</sub><sup>c</sup> capture how strongly each convolutional filter contributes to predicting category <em>c</em>.
            </p>
            <p>
              A weighted combination of forward activation maps is followed by a Rectified Linear Unit (ReLU) to retain only positive evidence supporting the target class:
            </p>
            <div className="p-4 rounded-xl bg-[#1b2529] border border-[#5C6B73]/40 font-mono text-xs text-[#9DB4C0] my-3">
              L<sub>Grad-CAM</sub><sup>c</sup> = ReLU( ∑<sub>k</sub> α<sub>k</sub><sup>c</sup> A<sup>k</sup> )
            </div>
            <p className="text-[#C2DFE3] italic">
              Notice: Grad-CAM highlights image regions influencing the mathematical decision boundary. It visualizes model attention and does not guarantee anatomical tumour localization.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#9DB4C0]" />
              Grad-CAM Key Stages
            </h3>
            <div className="space-y-3 text-xs text-[#E0FBFC]">
              <div className="p-3 rounded-xl bg-[#1b2529] border border-white/5 space-y-1">
                <span className="font-semibold text-white">1. Forward Pass</span>
                <p className="text-[#C2DFE3]">Compute class score y<sup>c</sup> and retain final convolution activations.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1b2529] border border-white/5 space-y-1">
                <span className="font-semibold text-white">2. Backward Gradient</span>
                <p className="text-[#C2DFE3]">Calculate ∂y<sup>c</sup>/∂A<sup>k</sup> with respect to conv5_block3_out.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1b2529] border border-white/5 space-y-1">
                <span className="font-semibold text-white">3. Global Average Pooling</span>
                <p className="text-[#C2DFE3]">Average gradients across spatial dimensions to yield importance weight α<sub>k</sub>.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1b2529] border border-white/5 space-y-1">
                <span className="font-semibold text-white">4. Colormap Projection</span>
                <p className="text-[#C2DFE3]">Bilinear interpolation of 7×7 heatmap up to 224×224 CT slice coordinate grid.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Supported Classification Categories */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-[#5C6B73]/40 pb-3">
          <div className="p-2 rounded-xl bg-[#5C6B73]/30 text-[#9DB4C0]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              3. Supported Classification Categories
            </h2>
            <p className="text-xs text-[#C2DFE3]">
              Categorical definitions across the four output target classes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.name}
              className="p-6 rounded-2xl bg-[#253237] border border-[#5C6B73]/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9DB4C0]" />
                  {cls.name}
                </h3>
                <span className="text-xs font-mono text-[#C2DFE3] px-2 py-0.5 rounded bg-[#5C6B73]/20 border border-[#9DB4C0]/20">
                  Target Class
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#E0FBFC] leading-relaxed">
                {cls.description}
              </p>
              <div className="pt-2 border-t border-[#5C6B73]/30 text-xs text-[#C2DFE3]">
                <strong className="text-white">Radiological hallmarks: </strong>
                {cls.features}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Link to Analyzer */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#253237] via-[#5C6B73]/40 to-[#253237] border border-[#9DB4C0]/40 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white">Experience the Model Interface</h3>
          <p className="text-xs sm:text-sm text-[#C2DFE3]">
            Test image upload, validation, and interpretability layout in the CT Scan Analyzer.
          </p>
        </div>
        <Link
          to="/analyzer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-[#9DB4C0] hover:bg-[#C2DFE3] text-[#253237] shadow-lg transition-all"
        >
          <span>Open CT Analyzer</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
