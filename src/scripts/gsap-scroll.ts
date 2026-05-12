export function initGsapScroll(): void {
	import('gsap').then(({ gsap }) => {
		import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
			gsap.registerPlugin(ScrollTrigger);

			const mm = gsap.matchMedia();

			mm.add('(min-width: 768px)', () => {
				document.querySelectorAll<HTMLElement>('[data-horizontal-section]').forEach((section) => {
					const pin   = section.querySelector<HTMLElement>('.horizontal-pin');
					const track = section.querySelector<HTMLElement>('.horizontal-track');
					if (!pin || !track) return;

					const panels      = track.children;
					const panelCount  = panels.length;
					const distance    = track.scrollWidth - window.innerWidth;
					const isProjects  = section.id === 'projects';
					const progressCls = isProjects ? 'projects-progress' : 'experience-progress';

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
								const activeIdx = Math.min(
									panelCount - 1,
									Math.floor(self.progress * panelCount),
								);
								document
									.querySelectorAll(`[class*="${progressCls}-"]`)
									.forEach((el, i) => {
										const elem = el as HTMLElement;
										if (i === activeIdx) {
											elem.style.width      = '2.5rem';
											elem.style.background = 'var(--color-primary)';
										} else {
											elem.style.width      = '0.75rem';
											elem.style.background = '';
										}
									});
							},
						},
					});

					Array.from(panels).forEach((panel, i) => {
						if (i === 0) return;
						const card = panel.querySelector('.glass');
						if (!card) return;
						gsap.from(card, {
							opacity: 0,
							y: 60,
							scale: 0.95,
							duration: 0.5,
							scrollTrigger: {
								trigger: panel,
								containerAnimation: tween,
								start: 'left 80%',
								end: 'left 40%',
								scrub: 1,
							},
						});
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
	});
}
