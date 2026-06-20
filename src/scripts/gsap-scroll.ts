export function initGsapScroll(): void {
	// Defer GSAP loading — it is not needed for initial render (only for scroll animations).
	const load = () => Promise.all([
		import('gsap'),
		import('gsap/ScrollTrigger'),
	]).then(([{ gsap }, { ScrollTrigger }]) => {
		gsap.registerPlugin(ScrollTrigger);

		const mm = gsap.matchMedia();

		mm.add('(min-width: 768px)', () => {
			document.querySelectorAll<HTMLElement>('[data-horizontal-section]').forEach((section) => {
				const pin   = section.querySelector<HTMLElement>('.horizontal-pin');
				const track = section.querySelector<HTMLElement>('.horizontal-track');
				if (!pin || !track) return;

				const panels      = Array.from(track.children) as HTMLElement[];
				const panelCount  = panels.length;
				const distance    = track.scrollWidth - window.innerWidth;
				const timelineBar = section.querySelector<HTMLElement>('[data-timeline-progress]');
				const timelineNodes = section.querySelectorAll<HTMLElement>('[data-timeline-node]');
				const timelineCaption = section.querySelector<HTMLElement>('[data-timeline-caption]');

				// Get the visible role text from a panel's meta block (respects i18n).
				const getRoleText = (panel: HTMLElement): string => {
					const lang = document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'id';
					const meta = panel.querySelector<HTMLElement>('[data-stagger="meta"]');
					if (!meta) return '';
					const h3 = meta.querySelector<HTMLElement>('h3');
					if (!h3) return '';
					// <T> renders two <span data-lang="id/en">; pick the visible one.
					const span = h3.querySelector<HTMLElement>(`[data-lang="${lang}"]`);
					return span?.textContent?.trim() ?? h3.textContent?.trim() ?? '';
				};

				const tween = gsap.to(track, {
					x: () => -distance,
					ease: 'none',
					scrollTrigger: {
						trigger: pin,
						start: 'top top',
						end: () => `+=${distance}`,
						pin: true,
						scrub: 1,
						invalidateOnRefresh: true,
						anticipatePin: 1,
						onUpdate: (self) => {
							// ── Enhanced timeline progress + active node ──
							// The first panel is the intro; experience panels start at index 1.
							const expCount = panelCount - 1;
							if (timelineBar) {
								timelineBar.style.width = `${self.progress * 100}%`;
							}
							if (expCount > 0) {
								// Map scroll progress to experience-node index.
								const activeIdx = Math.min(
									expCount - 1,
									Math.floor(self.progress * expCount),
								);
								timelineNodes.forEach((node, i) => {
									node.classList.toggle('is-active', i === activeIdx);
								});
								// Update single caption line above the timeline.
								if (timelineCaption) {
									const activePanel = panels[activeIdx + 1]; // +1 because panel[0] is intro
									timelineCaption.textContent = activePanel ? getRoleText(activePanel) : '';
								}
							}
						},
					},
				});

				// ── Per-panel: parallax layers + staggered reveal timeline ──
				panels.forEach((panel, i) => {
					if (i === 0) return; // intro panel, no anim

					// Parallax orbs (move opposite to scroll at varying speeds).
					panel.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
						const depth = Number(el.dataset.parallax ?? '0.3');
						gsap.to(el, {
							x: () => -distance * depth * 0.15,
							ease: 'none',
							scrollTrigger: {
								trigger: panel,
								containerAnimation: tween,
								start: 'left right',
								end: 'right left',
								scrub: 1,
							},
						});
					});

					// ── Cinematic reveal ──
					// Each experience stays hidden until the previous panel is ~80%
					// scrolled past. With full-width (100vw) panels, that moment is when
					// this panel's left edge reaches ~20% of the viewport. Every element
					// then animates in with its own easing (back / power3 / expo /
					// power4 / elastic) so the reveal never feels monotone.
					const tl = gsap.timeline({
						scrollTrigger: {
							trigger: panel,
							containerAnimation: tween,
							start: 'left 20%',   // previous panel ~80% passed
							end: 'left 5%',      // panel settling into reading position
							scrub: 1,
						},
					});

					// Brand mark: pop + counter-spin.
					const brand = panel.querySelector('[data-stagger="brand"]');
					if (brand) {
						gsap.set(brand, { opacity: 0, scale: 0.5, rotate: -24 });
						tl.to(brand, { opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)' });
					}

					// Meta block (period / role / company): drift up + from the left.
					const meta = panel.querySelector('[data-stagger="meta"]');
					if (meta) {
						gsap.set(meta, { opacity: 0, y: 40, x: 26 });
						tl.to(meta, { opacity: 1, y: 0, x: 0, duration: 0.5, ease: 'power3.out' }, '-=0.25');
					}

					// Metrics: rise + fade with an expo settle.
					const metrics = panel.querySelector('[data-stagger="metrics"]');
					if (metrics) {
						gsap.set(metrics, { opacity: 0, y: 28 });
						tl.to(metrics, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, '-=0.2');
					}

					// Glass card container: 3D rotate-in as the framing panel.
					const card = panel.querySelector('.glass');
					if (card) {
						gsap.set(card, {
							opacity: 0,
							y: 70,
							rotateY: 16,
							transformPerspective: 900,
							transformOrigin: 'left center',
						});
						tl.to(card, { opacity: 1, y: 0, rotateY: 0, duration: 0.6, ease: 'power4.out' }, '<');
					}

					// Description line.
					const desc = panel.querySelector('[data-stagger="desc"]');
					if (desc) {
						gsap.set(desc, { opacity: 0, y: 18 });
						tl.to(desc, { opacity: 0.8, y: 0, duration: 0.35, ease: 'power2.out' }, '-=0.3');
					}

					// Achievements: cascade in from the left.
					const achievements = panel.querySelectorAll('.exp-achievement');
					if (achievements.length) {
						gsap.set(achievements, { opacity: 0, x: -28 });
						tl.to(achievements, { opacity: 0.8, x: 0, duration: 0.3, stagger: 0.1, ease: 'power2.out' }, '-=0.15');
					}

					// Tech badges: elastic pop-in.
					const badges = panel.querySelectorAll('.exp-badge');
					if (badges.length) {
						gsap.set(badges, { opacity: 0, scale: 0.4, y: 12 });
						tl.to(badges, { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'elastic.out(1, 0.6)' }, '-=0.1');
					}
				});
			});

			return () => {
				ScrollTrigger.getAll().forEach((st) => st.kill());
			};
		});

		window.addEventListener('load', () => {
			ScrollTrigger.refresh();
		});
	});

	// Defer GSAP loading until the browser is idle — this prevents GSAP from
	// competing with critical resources during initial page load.
	if ('requestIdleCallback' in window) {
		requestIdleCallback(() => load());
	} else {
		setTimeout(() => load(), 200);
	}
}
