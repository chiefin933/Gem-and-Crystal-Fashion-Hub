# Storefront design update

The customer storefront uses an original fashion retail design: black brand framing, selective pink accents, bright campaign photography, flat merchandise grids, consistent commerce typography and responsive navigation. The supplied screenshots and screencasts informed visual principles only; their layouts, branding and imagery were not copied.

## Implemented surfaces

- Homepage, campaign, category directory and live product assortment.
- Desktop/mobile navigation and product search.
- Shared women/men/catalogue grids with catalogue-derived size and colour filters.
- Product details, explicit variant selection, quick view and wishlist.
- Shopping bag, checkout, pending M-Pesa payment and order confirmation.
- About/contact, footer, WhatsApp and bilingual AI entry points.
- Fixed circular WhatsApp and Gem AI controls with accessible labels, safe-area spacing and modal-aware visibility.
- Loading, unavailable, empty-results and retry states.
- Modal keyboard focus, Escape dismissal and scroll restoration.
- Four-slide top campaign for women's clothing, men's clothing, sneakers and new arrivals, with accessible navigation and pausable rotation.
- New arrivals use catalogue isNew metadata; other catalogue entry points clear that restriction.
- Compact inset Gem AI panel on phones, with internally scrolling messages and reachable close/send controls.
- Fixed footer copyright year 2023, separate from the documentation revision date.

## Verification

Build, lint and nine unit tests pass, including API-only catalogue and new-arrival filtering checks. Browser checks use disposable responses intercepted inside an isolated Chrome session; no catalogue records, real orders or payments are created. Earlier checks covered mobile search, wishlist, variant selection, bag, checkout, pending payment recovery and server-confirmed order presentation. Responsive review covers desktop and 320/390px phone widths. The real API catalogue is not replaced with fixtures or demo products.

Production deployment, genuine merchant payment acceptance, business-approved policies, address, hours and other missing contact details remain separate launch work.

## Documentation maintenance

The PRD and TRD Markdown documents, Word sharing copies, master specification and project documentation are updated with storefront changes. No update to this UI resolves or bypasses the pending POS M-Pesa callback/notification investigation.

## October showcase and assistant behaviour

The campaign advances automatically every five seconds through a 650ms horizontal image transition, with previous/next, labelled slide tabs and explicit pause/play controls. Pointer hover and mouse-selected controls no longer stop ordinary playback. Keyboard navigation, hidden documents and reduced-motion preferences retain appropriate safeguards. Photos fill their frames using cover and per-slide focal points instead of contained images with blank bands. Actions reset incompatible filters; new arrivals restrict the catalogue to API isNew records and expose a clearable checkbox.

Live-photo desktop slides use a uniform charcoal scrim and light foreground text for contrast. Phone copy remains below the photo, so it does not need the same scrim. Campaign fallback photos retain their original brightness.

The assistant panel is inset 12px, constrained to 380px width and at most 440px or 65dvh height. Visual viewport changes adjust its available height and keyboard inset. Messages scroll separately from the header and composer.

The original sneaker campaign asset at src/assets/gem-crystal-sneakers-campaign.webp is promotional photography, not a product listing. Matching live catalogue images take precedence over fallback campaign assets. The fixed footer displays 2023.

The initial October review passed desktop, 320px/390px phones and short-landscape chat checks. All four slide assets rendered, catalogue actions and filter reset worked with isolated fixtures, autoplay advanced and reduced motion stopped rotation. Carousel controls cleared the fixed support dock; the next section remained visible. The compact chat retained reachable close/composer controls. Hidden-document timer handling was source-reviewed. Word copies were rendered and visually checked. Subsequent owner feedback requires filled photo frames and automatic playback during ordinary pointer interaction; these supersede the initial contained-photo and hover-pause behaviour.

The automatic-playback/image-fit revision passed fresh desktop and phone checks with fallback images and isolated live-product fixtures. Rotation continued during hover and after pointer clicks; Pause held and Play resumed. All four image frames filled without blank bands or stretching, phone controls remained clear, and reduced motion disabled rotation/transitions. Live-photo text contrast was corrected and rechecked. Build, lint and all nine tests passed; hidden-tab handling was source-reviewed.

## Campaign asset

The built-in image generation tool produced the original campaign image at `src/assets/gem-crystal-campaign-v2.png`; the storefront loads its compressed WebP sibling. The campaign is illustrative brand photography, not a catalogue listing or stock claim. Existing local collection images were also compressed to WebP without changing their composition.

Final generation prompt:

> Use case: ads-marketing. Asset type: original wide photographic fashion storefront campaign for Gem & Crystal Fashion Hub, contemporary Nairobi boutique. Create a landscape 3:2 editorial fashion photograph, preferably 1536x1024. Bright clean studio with pale cool grey architectural backdrop, subtle dusty pink panel at far right, no beige. Two adult Black East African fashion models on right half, woman wearing a beautifully tailored vivid pink blazer over white top and straight dark denim, man wearing an elegant black jacket over white shirt and dark trousers. Full garments and natural proportions clearly visible, framed from heads to knees, subjects stand closely in a confident candid editorial pose. Left 45 percent is open uncluttered pale grey negative space for black HTML headline, no objects on left. Soft even daylight, sharp textile detail, authentic skin texture, sophisticated retail campaign rather than luxury fantasy. Pink, black, white palette, lively but restrained. No text, letters, logo, watermark, decorative orbs, gradients, floating shapes, diamonds, neon lighting, blur or duplicated people. Not a screenshot or website mockup, only photographic background asset.

The reference screencasts were inspected using a portable FFmpeg installation at `/tmp/gem-video-tools`. This temporary tool installation does not change system packages.
